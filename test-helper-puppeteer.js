let puppeteer, browser
const fs = require('fs')
const util = require('util')
const wait = util.promisify(function (amount, callback) {
  if (amount && !callback) {
    callback = amount
    amount = null
  }
  if (!process.env.STORAGE_ENGINE) {
    return setTimeout(callback, amount || 1)
  }
  return callback()
})
const allDevices = require('puppeteer/DeviceDescriptors')
const devices = [{
    name: 'Desktop',
    userAgent: 'Desktop browser',
    viewport: {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      isLandscape: false
    }
  },
  allDevices['iPad Pro'],
  allDevices['iPad Mini'],
  allDevices['Pixel 2 XL'],
  allDevices['iPhone SE']
]

module.exports = {
  fetch,
  hover,
  click,
  fill,
  close: () => {
    if (browser && browser.close) {
      browser.close()
      browser = null
    }
    puppeteer = null
  }
}

async function fetch (method, req) {
  puppeteer = global.puppeteer = global.puppeteer || require('puppeteer')
  while (!browser) {
    try {
      browser = await puppeteer.launch({
        headless: !(process.env.SHOW_BROWSERS === 'true'),
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox', 
          '--window-size=1920,1080', 
          '--incognito', 
          '--disable-dev-shm-usage'
        ],
        slowMo: 0
      })
    } catch (error) {
    }
    if (browser) {
      break
    }
    await wait(1)
  }
  let pages
  while (!pages) {
    try {
      pages = await browser.pages()
    } catch (error) {
    }
    if (pages) {
      break
    }
    await wait(1)
  }
  let page
  if (pages && pages.length) {
    page = pages[0]
  } else {
    while (true) {
      pages = await browser.pages()
      if (pages && pages.length) {
        page = pages[0]
      } else {
        try {
          page = await browser.newPage()
          if (process.env.DEBUG_PUPPETEER) {
            page.on('error', msg => console.log('[error]', msg.text()))
            page.on('console', msg => console.log('[console]', msg.text()))
          }
        } catch (error) {
        }
      }
      if (page) {
        break
      }
      await wait(1)
    }
  }
  while (true) {
    try {
      await page.emulate({
        name: 'Desktop',
        userAgent: 'Desktop browser',
        viewport: {
          width: 1920,
          height: 1080,
          deviceScaleFactor: 1,
          isMobile: false,
          hasTouch: false,
          isLandscape: false
        }
      })
      break
    } catch (error) {
      await wait(1)
      continue
    }
  }
  if (req.session) {
    await page.setCookie({
      value: req.session.sessionid,
      domain: process.env.DOMAIN,
      expires: Date.now() / 1000 + 10,
      name: 'sessionid'
    })
    await page.setCookie({
      value: req.session.token,
      domain: process.env.DOMAIN,
      expires: Date.now() / 1000 + 10,
      name: 'token'
    })
  }
  if (req.screenshots) {
    if (req.account) {
      await page.goto(`${process.env.DASHBOARD_SERVER}/home`, { waitLoad: true, waitNetworkIdle: true })
    } else {
      await page.goto(`${process.env.DASHBOARD_SERVER}/`, { waitLoad: true, waitNetworkIdle: true })
    }
    await page.waitForSelector('body')
    let screenshotNumber = 1
    let device
    for (const deviceInfo of devices) {
      if (deviceInfo.name === process.env.DEVICE_NAME) {
        device = deviceInfo
      }
    }
    device = device || devices[0]
    for (const step of req.screenshots) {
      if (step.hover) {
        await hover(page, step.hover)
        if (process.env.GENERATE_SCREENSHOTS) {
          await saveScreenshot(device, page, screenshotNumber, 'hover', step.hover, req.filename)
          screenshotNumber++
        }
      } else if (step.click) {
        if (step.click === '/account') {
          await hover(page, '#account-menu-container')
          await focus(page, '#account-menu-container')
          await wait(1)
        } else if (step.click === '/administrator') {
          await hover(page, '#administrator-menu-container')
          await focus(page, '#administrator-menu-container')
          await wait(1)
        } else {
          await hover(page, step.click)
          await focus(page, step.click)
        }
        if (process.env.GENERATE_SCREENSHOTS) {
          await saveScreenshot(device, page, screenshotNumber, 'click', step.click, req.filename)
          screenshotNumber++
        }
        await click(page, step.click)
        if (req.waitOnSubmit) {
          await wait(10000)
        } else {
          await wait(2000)        
        }
      } else if (step.fill) {
        await fill(page, req.body, req.uploads)
        await hover(page, '#submit-button')
        if (process.env.GENERATE_SCREENSHOTS) {
          await saveScreenshot(device, page, screenshotNumber, 'submit', step.fill, req.filename)
          screenshotNumber++
        }
        await click(page, req.button || '#submit-button')
        if (req.waitOnSubmit) {
          await wait(10000)
        } else {
          await wait(2000)        
        }
      }
    }
    if (process.env.GENERATE_SCREENSHOTS) {
      await saveScreenshot(device, page, screenshotNumber, 'complete', null, req.filename)
    }
  } else {
    await page.goto(`${process.env.DASHBOARD_SERVER}${req.url}`, { waitLoad: true, waitNetworkIdle: true })
    await page.waitForSelector('body')
    if (method === 'POST') {
      await fill(page, req.body, req.uploads)
      await click(page, req.button || '#submit-button')
      if (req.waitOnSubmit) {
        await wait(10000)
      } else {
        await page.waitForSelector('body')
      }
    }
  }
  let html
  while (!html) {
    try {
      html = await page.content()
    } catch (error) {
    }
    if (html) {
      break
    }
    await wait(1)
  }
  await page.close()
  return html
}

async function saveScreenshot(device, page, number, action, identifier, scriptName) {
  let filePath = scriptName.substring(0, scriptName.lastIndexOf('.test.js'))
  filePath = filePath.split('/src/www/account/').join('/screenshots/account/')
  filePath = filePath.split('/src/www/administrator/').join('/screenshots/administrator/')
  if (!fs.existsSync(filePath)) {
    createFolderSync(filePath)
  }
  let title
  if (identifier === '#submit-form') {
    title = 'form'
  } else if (identifier) {
    const element = await getElement(page, identifier)
    title = await getText(page, element)
    title = title.split(' ').join('-').toLowerCase()
  }
  let filename
  if (title) {
    filename = `${number}-${action}-${title}-${device.name}.png`.toLowerCase()
  } else {
    filename = `${number}-${action}-${device.name}.png`.toLowerCase()
  }
  await page.emulate(device)
  await page.screenshot({ path: `${filePath}/${filename}`, type: 'png' })
}

async function focus (page, identifier) {
  const element = await getElement(page, identifier)
  if (element) {
    return focusElement(element)
  }
}

async function hover (page, identifier) {
  const element = await getElement(page, identifier)
  if (element) {
    return hoverElement(element)
  }
}

async function click (page, identifier) {
  const element = await getElement(page, identifier)
  if (element) {
    await hoverElement(element)
    return clickElement(element)
  }
}

async function getText (page, element) {
  return evaluate(page, (el) => {
    if (el.innerText && el.innerHTML.indexOf('>') === -1) {
      return el.innerText
    } 
    if (el.title) {
      return el.title
    }
    for (var i = 0, len = el.children.length; i < len; i++) {
      if (el.children[i].innerText) {
        return el.children[i].innerText
      }
      if (el.children[i].title) {
        return el.children[i].title
      }
    }
  }, element)
}

async function fill (page, body, uploads) {
  if (!body && !uploads) {
    return
  }
  if (uploads) {
    for (const field in uploads) {
      const element = await getElement(page, `#${field}`)
      if (element) {
        await uploadFile(element, uploads[field].path)
      }
      continue
    }
  }
  if (!body) {
    return
  }
  for (const field in body) {
    const element = await getElement(page, `#${field}`)
    if (!element) {
      const checkboxes = await getTags(page, 'input[type=checkbox]')
      if (checkboxes && checkboxes.length) {
        for (const checkbox of checkboxes) {
          const name = await evaluate(page, el => el.name, checkbox)
          if (name !== field) {
            continue
          }
          const value = await evaluate(page, el => el.value, checkbox)
          if (value === body[field]) {
            await evaluate(page, el => { el.checked = true }, checkbox)
          } else if (!body[field]) {
            await evaluate(page, el => { el.checked = false }, checkbox)
          }
        }
      }
      const radios = await getTags(page, 'input[type=radio]')
      if (radios && radios.length) {
        for (const radio of radios) {
          const name = await evaluate(page, el => el.name, radio)
          if (name !== field) {
            continue
          }
          const value = await evaluate(page, el => el.value, radio)
          if (value === body[field]) {
            await evaluate(page, el => { el.checked = true }, radio)
          } else if (!body[field]) {
            await evaluate(page, el => { el.checked = false }, radio)
          }
        }
      }
      continue
    }
    const tagName = await evaluate(page, el => el.tagName, element)
    if (!tagName) {
      throw new Error('unknown tag name')
    }
    await focusElement(element)
    if (tagName === 'TEXTAREA') {
      await evaluate(page, el => { el.value = '' }, element)
      await typeInElement(element, body[field])
    } else if (tagName === 'SELECT') {
      await selectOption(element, body[field])
    } else if (tagName === 'INPUT') {
      const inputType = await evaluate(page, el => el.type, element)
      if (inputType === 'radio' || inputType === 'checkbox') {
        if (body[field]) {
          await evaluate(page, el => { el.checked = true }, element)
        } else {
          await evaluate(page, el => { el.checked = false }, [])
        }
      } else {
        if (body[field]) {
          await evaluate(page, el => { el.value = '' }, element)
          await typeInElement(element, body[field])
        } else {
          await evaluate(page, el => { el.value = '' }, element)
        }
      }
    }
  }
}

async function getElement (page, identifier) {
  const frame = await getOptionalApplicationFrame(page)
  let element
  if (identifier.startsWith('#')) {
    element = await page.$(identifier)
    if (element) {
      return element
    }
    if (frame) {
      element = await frame.$(identifier)
      if (element) {
        return element
      }
    }
    return null
  }
  if (identifier.startsWith('/')) {
    let elements = await getTags(page, 'a')
    if (elements && elements.length) {
      for (element of elements) {
        const href = await evaluate(page, el => el.href, element)
        if (href) {
          if (href === identifier || 
              href.startsWith(`${identifier}?`) || 
              href === `${global.dashboardServer}${identifier}` || 
              href.startsWith(`${global.dashboardServer}${identifier}?`) || 
              href === `${global.dashboardServer}:${global.port}${identifier}` ||
              href.startsWith(`${global.dashboardServer}:${global.port}${identifier}?`)) {
            return element
          }
        }
      }
    }
    if (frame) {
      elements = await getTags(frame, 'a')
      if (elements && elements.length) {
        for (element of elements) {
          const href = await evaluate(page, el => el.href, element)
          if (href) {
            if (href === identifier || 
              href.startsWith(`${identifier}?`) || 
              href === `${global.dashboardServer}${identifier}` || 
              href.startsWith(`${global.dashboardServer}${identifier}?`) || 
              href === `${global.dashboardServer}:${global.port}${identifier}` ||
              href.startsWith(`${global.dashboardServer}:${global.port}${identifier}?`)) {
            return element
            }
          }
        }
      }
    }
  }
  const tags = ['button', 'input', 'select', 'textarea', 'img']
  for (const tag of tags) {
    let elements = await getTags(page, tag)
    if (!elements || !elements.length) {
      continue
    }
    for (element of elements) {
      const text = await getText(element)
      if (text) {
        if (text === identifier || text.indexOf(identifier) > -1) {
          return element
        }
      }
    }
    if (frame) {
      elements = await getTags(frame, tag)
      if (!elements || !elements.length) {
        continue
      }
      for (element of elements) {
        const text = await getText(element)
        if (text) {
          if (text === identifier || text.indexOf(identifier) > -1) {
            return element
          }
        }
      }
    }
  }
}

async function evaluate (page, method, element) {
  let fails = 0
  const active = element || page
  while (true) {
    try {
      const thing = await active.evaluate(method, element)
      return thing
    } catch (error) {
    }
    fails++
    if (fails > 10) {
      throw new Error('evaluate failed ten times')
    }
    await wait(1)
  }
}

async function getOptionalApplicationFrame (page) {
  let fails = 0
  while (true) {
    try {
      const frame = await page.frames().find(f => f.name() === 'application-iframe')
      if (frame) {
        return frame
      }
    } catch (error) {
    }
    fails++
    if (fails > 10) {
      return null
    }
    await wait(1)
  }
}

async function getTags (page, tag) {
  let fails = 0
  while (true) {
    try {
      const links = await page.$$(tag)
      return links
    } catch (error) {
    }
    fails++
    if (fails > 10) {
      throw new Error('getTags failed ten times')
    }
    await wait(1)
  }
}

async function hoverElement (element) {
  let fails = 0
  while (true) {
    try {
      await element.hover()
      return
    } catch (error) {
    }
    fails++
    if (fails > 10) {
      throw new Error('hoverElement failed ten times')
    }
    await wait(1)
  }
}

async function clickElement (element) {
  let fails = 0
  while (true) {
    try {
      await element.click()
      return
    } catch (error) {
    }
    fails++
    if (fails > 10) {
      throw new Error('clickElement failed ten times')
    }
    await wait(1)
  }
}

async function focusElement (element) {
  let fails = 0
  while (true) {
    try {
      await element.focus()
      return
    } catch (error) {
    }
    fails++
    if (fails > 10) {
      throw new Error('focusElement failed ten times')
    }
    await wait(1)
  }
}

async function uploadFile (element, path) {
  let fails = 0
  while (true) {
    try {
      await element.uploadFile(path)
      return
    } catch (error) {
    }
    fails++
    if (fails > 10) {
      throw new Error('uploadFile failed ten times')
    }
    await wait(1)
  }
}

async function typeInElement (element, text) {
  let fails = 0
  while (true) {
    try {
      await element.type(text || '')
      return
    } catch (error) {
    }
    fails++
    if (fails > 10) {
      throw new Error('typeElement failed ten times')
    }
    await wait(1)
  }
}

async function selectOption (element, value) {
  const id = await element.evaluate(element => element.id, element)
  let fails = 0
  while (true) {
    try {
      await element.evaluate((_, data) => {
        var select = document.getElementById(data.id)
        for (var i = 0, len = select.options.length; i < len; i++) {
          if (select.options[i].value === data.value ||
            select.options[i].text === data.value ||
            select.options[i].text.indexOf(data.value) === 0) {
            select.selectedIndex = i
            return
          }
        }
      }, { id, value })
      return
    } catch (error) {
    }
    fails++
    if (fails > 10) {
      throw new Error('selectOption failed ten times')
    }
    await wait(1)
  }
}

function createFolderSync (folderPath) {
  const nested = folderPath.substring(global.applicationPath.length)
  const nestedParts = nested.split('/')
  let nestedPath = global.applicationPath
  for (const part of nestedParts) {
    nestedPath += `/${part}`
    if (!fs.existsSync(nestedPath)) {
      fs.mkdirSync(nestedPath)
    }
  }
}