let puppeteer, browser
const fs = require('fs')
const path = require('path')
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
  browser = await relaunchBrowser()
  const result = {}
  const page = await launchBrowserPage()
  await emulate(page, devices[0])
  if (process.env.DEBUG_PUPPETEER) {
    page.on('error', msg => console.log('[error]', msg.text()))
    page.on('console', msg => console.log('[console]', msg.text()))
  }
  // these huge timeouts allow webhooks to be received
  await page.setDefaultTimeout(360000)
  await page.setDefaultNavigationTimeout(360000)
  await page.setBypassCSP(true)
  await page.setRequestInterception(true)
  page.on('request', async (request) => {
    await request.continue()
  })
  let html
  page.on('response', async (response) => {
    const status = await response.status()
    if (status === 302) {
      const headers = response.headers()
      result.redirect = headers.location
    }
    return status === 200
  })
  if (req.screenshots) {
    if (req.account) {
      await setCookie(page, req)
      await gotoURL(page, `${global.dashboardServer}/home`)
    } else {
      await gotoURL(page, global.dashboardServer)
    }
    let screenshotNumber = 1
    let lastStep
    for (const step of req.screenshots) {
      if (process.env.DEBUG_PUPPETEER) {
        console.log('screenshot step', JSON.stringify(step))
      }
      if (step.save) {
        if (process.env.GENERATE_SCREENSHOTS && process.env.SCREENSHOT_PATH) {
          for (const device of devices) {
            await emulate(page, device)
            await saveScreenshot(device, page, screenshotNumber, 'index', 'page', req.filename)
          }
        }
        screenshotNumber++
        continue
      }
      if (step.hover) {
        if (process.env.GENERATE_SCREENSHOTS && process.env.SCREENSHOT_PATH) {
          for (const device of devices) {
            await emulate(page, device, req)
            await hover(page, step.hover)
            await saveScreenshot(device, page, screenshotNumber, 'hover', step.hover, req.filename)
          }
        } else {
          await hover(page, step.hover)
        }
        screenshotNumber++
      } else if (step.click) {
        if (process.env.GENERATE_SCREENSHOTS && process.env.SCREENSHOT_PATH) {
          for (const device of devices) {
            await emulate(page, device)
            if (lastStep && lastStep.hover === '#account-menu-container') {
              await hover(page, '#account-menu-container')
            } else if (lastStep && lastStep.hover === '#administrator-menu-container') {
              await hover(page, '#administrator-menu-container')
            }
            await hover(page, step.click)
            await focus(page, step.click)
            await saveScreenshot(device, page, screenshotNumber, 'click', step.click, req.filename)
          }
        } else {
          if (lastStep && lastStep.hover === '#account-menu-container') {
            await hover(page, '#account-menu-container')
          } else if (lastStep && lastStep.hover === '#administrator-menu-container') {
            await hover(page, '#administrator-menu-container')
          }
          await hover(page, step.click)
        }
        screenshotNumber++
        if (step.waitBefore) {
          await step.waitBefore(page)
        }
        html = await getContent(page)
        await click(page, step.click)
        if (step.waitAfter) {
          await step.waitAfter(page)
        } else {
          await page.waitForNavigation((response) => {
            const status = response.status()
            return status === 200
          })
        }
      } else if (step.fill) {
        if (process.env.GENERATE_SCREENSHOTS && process.env.SCREENSHOT_PATH) {
          for (const device of devices) {
            await emulate(page, device, req)
            if (step.waitFormLoad) {
              await step.waitFormLoad(page)
            }
            await fillForm(page, step.fill, step.body || req.body, req.uploads)
            await hover(page, req.button || '#submit-button')
            await saveScreenshot(device, page, screenshotNumber, 'submit', step.fill, req.filename)
          }
        } else {
          if (step.waitFormLoad) {
            await step.waitFormLoad(page)
          }
          await fillForm(page, step.fill, step.body || req.body, step.uploads || req.uploads)
        }
        screenshotNumber++
        await focus(page, req.button || '#submit-button')
        if (step.waitBefore) {
          await step.waitBefore(page)
        }
        html = await getContent(page)
        await click(page, req.button || '#submit-button')
        if (step.waitAfter) {
          await step.waitAfter(page)
        } else {
          await page.waitForResponse((response) => {
            const status = response.status()
            return status === 200
          })
        }
      }
      lastStep = step
    }
    if (process.env.GENERATE_SCREENSHOTS && process.env.SCREENSHOT_PATH) {
      for (const device of devices) {
        await emulate(page, device)
        await saveScreenshot(device, page, screenshotNumber, 'complete', null, req.filename)
      }
    }
    screenshotNumber++
  } else {
    if (req.account) {
      await setCookie(page, req)
    }
    await gotoURL(page, `${global.dashboardServer}${req.url}`)
    if (method === 'POST') {
      if (req.waitBefore) {
        await req.waitBefore(page)
      }
      await fillForm(page, '#submit-form', req.body, req.uploads)
      await hover(page, req.button || '#submit-button')
      html = await getContent(page)
      await click(page, req.button || '#submit-button')
      if (req.waitAfter) {
        await req.waitAfter(page)
      } else {
        await page.waitForResponse((response) => {
          const status = response.status()
          return status === 200
        })
      }
    }
  }
  html = await getContent(page)
  if (html.indexOf('<meta http-equiv="refresh"') > -1) {
    let redirectLocation = html.substring(html.indexOf(';url=') + 5)
    redirectLocation = redirectLocation.substring(0, redirectLocation.indexOf('"'))
    result.redirect = redirectLocation
  }
  if (result.redirect) {
    await gotoURL(page, `${global.dashboardServer}${result.redirect}`)
    html = await getContent(page)
  }
  result.html = html
  await page.close()
  return result
}

async function relaunchBrowser() {
  if (browser && browser.close) {
    await browser.close()
    browser = null
  }
  while (!browser) {
    await wait(100)
    try {
      browser = await puppeteer.launch({
        headless: !(process.env.SHOW_BROWSERS === 'true'),
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--window-size=1920,1080',
          '--incognito',
          '--disable-dev-shm-usage',
          '--disable-features=site-per-process'
        ],
        slowMo: 0
      })
      return browser
    } catch (error) {
      if (process.env.DEBUG_PUPPETEER) {
        console.log('error instantiating browser', error.toString())
      }
    }
  }
}

async function launchBrowserPage () {
  let pages
  while (!pages) {
    await wait(100)
    try {
      pages = await browser.pages()
    } catch (error) {
    }
  }
  if (pages && pages.length) {
    return pages[0]
  }
  let page
  while (!page) {
    await wait(100)
    try {
      page = await browser.newPage()
    } catch (error) {
    }
  }
}

async function gotoURL (page, url) {
  while (true) {
    await wait(100)
    try {
      await page.goto(url, { waitLoad: true, waitNetworkIdle: true })
      let content
      while (!content || !content.length) {
        content = await getContent(page)
      }
      return true
    } catch (error) {
      await wait(100)
      if (process.env.DEBUG_PUPPETEER) {
        console.log('error going to url', error.toString())
      }
    }
  }
}

async function waitForClientLoaded (page) {
  while (true) {
    try {
      const loaded = await page.evaluate(() => {
        return window.loaded
      })
      if (loaded) {
        return true
      }
    } catch (error) {
    }
    await wait(100)
  }
}

async function getContent (page) {
  let html
  while (!html || !html.length) {
    await wait(100)
    try {
      html = await page.content()
    } catch (error) {
      await wait(100)
    }
  }
  return html
}
async function setCookie (page, req) {
  const cookies = await page.cookies()
  if (cookies.length) {
    return
  }
  if (!req.session) {
    return
  }
  const cookie = {
    value: req.session.sessionid,
    session: true,
    name: 'sessionid',
    url: global.dashboardServer
  }
  const cookie2 = {
    value: req.session.token,
    session: true,
    name: 'token',
    url:  global.dashboardServer
  }
  while (true) {
    await wait(100)
    try {
      await page.setCookie(cookie)
      break
    } catch (error) {
    }
    
  }
  while (true) {
    await wait(100)
    try {
      await page.setCookie(cookie2)
      return
    } catch (error) {
      await wait(100)
    }
  }
}

async function emulate (page, device) {
  while (true) {
    await wait(100)
    try {
      await page.emulate(device)
      return
    } catch (error) {
      await wait(100)
    }
  }
}

async function saveScreenshot (device, page, number, action, identifier, scriptName) {
  if (process.env.DEBUG_PUPPETEER) {
    console.log('taking screenshot', number, action, identifier, scriptName)
  }
  let filePath = scriptName.substring(scriptName.indexOf('/src/www/') + '/src/www/'.length)
  filePath = filePath.substring(0, filePath.lastIndexOf('.test.js'))
  filePath = path.join(process.env.SCREENSHOT_PATH, filePath)
  if (!fs.existsSync(filePath)) {
    createFolderSync(filePath)
  }
  let title
  if (identifier === '#submit-form') {
    title = 'form'
  } else if (identifier === '#submit-button') {
    const element = await getElement(page, identifier)
    let text = await getText(page, element)
    if (text.indexOf('_') > -1) {
      text = text.substring(0, text.indexOf('_'))
    } else {
      text = text.split(' ').join('-').toLowerCase()
    }
    title = text
  } else if (identifier && identifier[0] === '/') {
    const element = await getElement(page, identifier)
    let text = await getText(page, element)
    if (text.indexOf('_') > -1) {
      text = text.substring(0, text.indexOf('_'))
    } else {
      text = text.split(' ').join('-').toLowerCase()
    }
    title = text
  } else if (action === 'index') {
    title = 'index'
  } else if (identifier) {
    title = 'form'
  } else {
    title = ''
  }
  let filename
  if (title) {
    filename = `${number}-${action}-${title}-${device.name.split(' ').join('-')}.png`.toLowerCase()
  } else {
    filename = `${number}-${action}-${device.name.split(' ').join('-')}.png`.toLowerCase()
  }
  await page.screenshot({ path: `${filePath}/${filename}`, type: 'png' })
}

async function fillForm (page, fieldContainer, body, uploads) {
  while (true) {
    try {
      await fill(page, fieldContainer, body, uploads)
      break
    } catch (error) {
      await wait(100)
    }
  }
}

async function focus (page, identifier) {
  const element = await getElement(page, identifier)
  if (element) {
    return focusElement(element)
  }
  if (process.env.DEBUG_PUPPETEER) {
    console.log('could not focus element', identifier)
  }
}

async function hover (page, identifier) {
  const element = await getElement(page, identifier)
  if (element) {
    return hoverElement(element)
  }
  if (process.env.DEBUG_PUPPETEER) {
    console.log('could not hover element', identifier)
  }
}

async function click (page, identifier) {
  const element = await getElement(page, identifier)
  if (element) {
    await clickElement(element)
    return
  }
  if (process.env.DEBUG_PUPPETEER) {
    console.log('could not click element', identifier)
  }
}

async function getText (page, element) {
  return evaluate(page, (el) => {
    if (!el) {
      return ''
    }
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

async function fill (page, fieldContainer, body, uploads) {
  if (!body && !uploads) {
    return
  }
  const frame = await getOptionalApplicationFrame(page)
  let formFields = await getElement(page, fieldContainer || '#submit-form')
  if (!formFields && frame) {
    formFields = await getElement(frame, fieldContainer || '#submit-form')
  }
  if (!formFields) {
    formFields = await page.$('form')
    if (!formFields) {
      return
    }
  }
  if (uploads) {
    for (const field in uploads) {
      const element = await getElement(formFields, `#${field}`)
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
    const element = await getElement(formFields, `#${field}`)
    if (!element) {
      const checkboxes = await getTags(formFields, 'input[type=checkbox]')
      if (checkboxes && checkboxes.length) {
        for (const checkbox of checkboxes) {
          const name = await evaluate(formFields, el => el.name, checkbox)
          if (name !== field) {
            continue
          }
          const value = await evaluate(formFields, el => el.value, checkbox)
          if (value === body[field]) {
            await evaluate(formFields, el => { el.checked = true }, checkbox)
          } else if (!body[field]) {
            await evaluate(formFields, el => { el.checked = false }, checkbox)
          }
        }
      }
      const radios = await getTags(formFields, 'input[type=radio]')
      if (radios && radios.length) {
        for (const radio of radios) {
          const name = await evaluate(formFields, el => el.name, radio)
          if (name !== field) {
            continue
          }
          const value = await evaluate(formFields, el => el.value, radio)
          if (value === body[field]) {
            await evaluate(formFields, el => { el.checked = true }, radio)
          } else if (!body[field]) {
            await evaluate(formFields, el => { el.checked = false }, radio)
          }
        }
      }
      continue
    }
    const tagName = await evaluate(formFields, el => el.tagName, element)
    if (!tagName) {
      throw new Error('unknown tag name')
    }
    await focusElement(element)
    if (tagName === 'TEXTAREA') {
      await (frame || page).$eval(`textarea[id=${field}]`, (el, value) => { el.value = value }, body[field])
    } else if (tagName === 'SELECT') {
      await selectOption(element, body[field])
    } else if (tagName === 'INPUT') {
      const inputType = await evaluate(formFields, el => el.type, element)
      if (inputType === 'radio' || inputType === 'checkbox') {
        if (body[field]) {
          await evaluate(formFields, el => { el.checked = true }, element)
        } else {
          await evaluate(formFields, el => { el.checked = false }, element)
        }
      } else {
        if (body[field]) {
          await evaluate(formFields, el => { el.value = '' }, element)
          await typeInElement(element, body[field])
        } else {
          await evaluate(formFields, el => { el.value = '' }, element)
        }
      }
    } else {
      await clickElement(element)
      // For fields in iframes that cannot be read, like 
      // Stripe card information, existing values must 
      // be brute-force cleared or else they get garbled
      for (let i = 0, len = 1000; i < len; i++) {
        let error
        try {
          await page.keyboard.press('Backspace')
        } catch (error) {
          error = true
        }
        if (error) {
          await clickElement(element)
          await wait(1)
        }
      }
      for (const character of body[field]) {
        await page.keyboard.press(character)
        await wait(1)
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
              href.startsWith(`${identifier}&`) ||
              href === `${global.dashboardServer}${identifier}` ||
              href.startsWith(`${global.dashboardServer}${identifier}?`) ||
              href.startsWith(`${global.dashboardServer}${identifier}&`)) {
            if (process.env.DEBUG_PUPPETEER) {
              console.log('found page link', identifier)
            }
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
              href.startsWith(`${identifier}&`) ||
              href === `${global.dashboardServer}${identifier}` ||
              href.startsWith(`${global.dashboardServer}${identifier}?`) ||
              href.startsWith(`${global.dashboardServer}${identifier}&`)) {
              if (process.env.DEBUG_PUPPETEER) {
                console.log('found frame link', identifier)
              }
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
          if (process.env.DEBUG_PUPPETEER) {
            console.log('found page element', identifier)
          }
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
            if (process.env.DEBUG_PUPPETEER) {
              console.log('found frame element', identifier)
            }
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
    await wait(100)
    try {
      const thing = await active.evaluate(method, element)
      return thing
    } catch (error) {
      await wait(100)
      if (process.env.DEBUG_PUPPETEER) {
        console.log('error evaluating method', error.toString())
      }
    }
    fails++
    if (fails > 10) {
      throw new Error('evaluate failed ten times')
    }
  }
}

async function getOptionalApplicationFrame (page) {
  if (!page.frames) {
    return null
  }
  let fails = 0
  while (true) {
    await wait(100)
    try {
      const frame = await page.frames().find(f => f.name() === 'application-iframe')
      if (frame) {
        return frame
      }
    } catch (error) {
      await wait(100)
      if (process.env.DEBUG_PUPPETEER) {
        console.log('error getting application frame', error.toString())
      }
    }
    fails++
    if (fails > 10) {
      return null
    }
  }
}

async function getTags (page, tag) {
  let fails = 0
  while (true) {
    await wait(100)
    try {
      const links = await page.$$(tag)
      return links
    } catch (error) {
      await wait(100)
      if (process.env.DEBUG_PUPPETEER) {
        console.log(`error getting ${tag} tags`, error.toString())
      }
    }
    fails++
    if (fails > 10) {
      throw new Error('getTags failed ten times')
    }
  }
}

async function hoverElement (element) {
  let fails = 0
  while (true) {
    await wait(100)
    try {
      await element.hover()
      return
    } catch (error) {
      await wait(100)
      if (process.env.DEBUG_PUPPETEER) {
        console.log('error hovering element', error.toString())
      }
    }
    fails++
    if (fails > 10) {
      throw new Error('hoverElement failed ten times')
    }
  }
}

async function clickElement (element) {
  let fails = 0
  while (true) {
    if (fails) {
      await wait(100)
    }
    try {
      await element.click()
      return
    } catch (error) {
      await wait(100)
      if (process.env.DEBUG_PUPPETEER) {
        console.log('error clicking element', error.toString())
      }
    }
    fails++
    if (fails > 10) {
      throw new Error('clickElement failed ten times')
    }
  }
}

async function focusElement (element) {
  let fails = 0
  while (true) {
    if (fails) {
      await wait(100)
    }
    try {
      await element.focus()
      return
    } catch (error) {
      await wait(100)
      if (process.env.DEBUG_PUPPETEER) {
        console.log('error focusing element', error.toString())
      }
    }
    fails++
    if (fails > 10) {
      throw new Error('focusElement failed ten times')
    }
  }
}

async function uploadFile (element, path) {
  let fails = 0
  while (true) {
    if (fails) {
      await wait(100)
    }
    try {
      await element.uploadFile(path)
      return
    } catch (error) {
      await wait(100)
      if (process.env.DEBUG_PUPPETEER) {
        console.log('error uploading file', error.toString())
      }
    }
    fails++
    if (fails > 10) {
      throw new Error('uploadFile failed ten times')
    }
  }
}

async function typeInElement (element, text) {
  let fails = 0
  while (true) {
    if (fails) {
      await wait(100)
    }
    try {
      if (!text || !text.length) {
        await element.evaluate(element => element.value = '', element)
        return
      }
      await element.type(text || '')
      return
    } catch (error) {
      await wait(100)
      if (process.env.DEBUG_PUPPETEER) {
        console.log('error typing in element', error.toString())
      }
    }
    fails++
    if (fails > 10) {
      throw new Error('typeElement failed ten times')
    }
  }
}

async function selectOption (element, value) {
  const id = await element.evaluate(element => element.id, element)
  let fails = 0
  while (true) {
    if (fails) {
      await wait(100)
    }
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
      await wait(100)
      if (process.env.DEBUG_PUPPETEER) {
        console.log('error selecting option', error.toString())
      }
    }
    fails++
    if (fails > 10) {
      throw new Error('selectOption failed ten times')
    }
  }
}

function createFolderSync (folderPath) {
  const nestedParts = folderPath.split('/')
  let nestedPath = ''
  for (const part of nestedParts) {
    nestedPath += `/${part}`
    if (!fs.existsSync(nestedPath)) {
      fs.mkdirSync(nestedPath)
    }
  }
}
