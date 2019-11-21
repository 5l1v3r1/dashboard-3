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

module.exports = {
  open,
  hover,
  click,
  fill
}

async function open (page, url) {
  await openURL(page, url)
}

async function hover (page, identifier) {
  let active = null
  const frame = await getOptionalApplicationFrame(active)
  if (frame && frame.evaluate) {
    active = frame
  } else {
    active = page
  }
  if (identifier.startsWith('#')) {
    const element = await getElement(active, identifier)
    await hoverElement(element)
    return
  }
  const tags = ['a', 'button', 'input', 'select', 'textarea', 'img']
  for (const tag of tags) {
    const links = await getTags(active, tag)
    for (const link of links) {
      let text = await evaluate(active, el => el.firstChild && el.firstChild.title ? el.firstChild.title : el.innerText, link)
      if (!text) {
        continue
      }
      text = text.trim()
      if (text === identifier || text.indexOf(identifier) > -1) {
        await hoverElement(link)
      }
    }
  }
}

async function click (page, identifier) {
  const frame = await getOptionalApplicationFrame(page)
  let active
  if (frame && frame.evaluate) {
    active = frame
  } else {
    active = page
  }
  if (identifier.startsWith('#')) {
    const element = await getElement(active, identifier)
    await hoverElement(element)
    return clickElement(element)
  }
  const tags = ['a', 'button', 'input', 'select', 'textarea', 'img']
  for (const tag of tags) {
    const links = await getTags(active, tag)
    if (!links || !links.length) {
      continue
    }
    for (const link of links) {
      let text = await evaluate(active, el => el.firstChild && el.firstChild.title ? el.firstChild.title : el.innerText, link)
      if (!text) {
        continue
      }
      text = text.trim()
      if (text === identifier || text.indexOf(identifier) > -1) {
        return clickElement(link)
      }
    }
  }
}

async function fill (page, body, uploads) {
  if (!body && !uploads) {
    return
  }
  const frame = await getOptionalApplicationFrame(page)
  let active
  if (frame && frame.evaluate) {
    active = frame
  } else {
    active = page
  }
  if (uploads) {
    for (const field in uploads) {
      const element = await getElement(active, `#${field}`)
      await uploadFile(element, uploads[field].path)
      continue
    }
  }
  if (!body) {
    return
  }
  for (const field in body) {
    const element = await getOptionalElement(active, `#${field}`)
    if (!element) {
      const checkboxes = await getTags(active, 'input[type=checkbox]')
      if (checkboxes && checkboxes.length) {
        for (const checkbox of checkboxes) {
          const name = await evaluate(active, el => el.name, checkbox)
          if (name !== field) {
            continue
          }
          const value = await evaluate(active, el => el.value, checkbox)
          if (value === body[field]) {
            await evaluate(active, el => { el.checked = true }, checkbox)
          } else if (!body[field]) {
            await evaluate(active, el => { el.checked = false }, checkbox)
          }
        }
      }
      const radios = await getTags(active, 'input[type=radio]')
      if (radios && radios.length) {
        for (const radio of radios) {
          const name = await evaluate(active, el => el.name, radio)
          if (name !== field) {
            continue
          }
          const value = await evaluate(active, el => el.value, radio)
          if (value === body[field]) {
            await evaluate(active, el => { el.checked = true }, radio)
          } else if (!body[field]) {
            await evaluate(active, el => { el.checked = false }, radio)
          }
        }
      }
      continue
    }
    const tagName = await evaluate(active, el => el.tagName, element)
    if (!tagName) {
      throw new Error('unknown tag name')
    }
    await focusElement(element)
    if (tagName === 'TEXTAREA') {
      await evaluate(active, el => { el.value = '' }, element)
      await typeInElement(element, body[field])
    } else if (tagName === 'SELECT') {
      await selectOption(element, body[field])
    } else if (tagName === 'INPUT') {
      const inputType = await evaluate(active, el => el.type, element)
      if (inputType === 'radio' || inputType === 'checkbox') {
        if (body[field]) {
          await evaluate(active, el => { el.checked = true }, element)
        } else {
          await evaluate(active, el => { el.checked = false }, [])
        }
      } else {
        if (body[field]) {
          await evaluate(active, el => { el.value = '' }, element)
          await typeInElement(element, body[field])
        } else {
          await evaluate(active, el => { el.value = '' }, element)
        }
      }
    }
  }
}

async function evaluate (page, method, element) {
  if (process.env.TRACE_PUPPETEER) {
    console.log('evaluate')
  }
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

async function openURL (page, url) {
  if (process.env.TRACE_PUPPETEER) {
    console.log('open url', url)
  }
  let fails = 0
  while (true) {
    try {
      page.goto(url, { waitLoad: true, waitNetworkIdle: true })
      return
    } catch (error) {
    }
    fails++
    if (fails > 10) {
      throw new Error('openURL failed ten times')
    }
    await wait(1)
  }
}

async function getOptionalApplicationFrame (page) {
  if (process.env.TRACE_PUPPETEER) {
    console.log('get optional application frame')
  }
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
  if (process.env.TRACE_PUPPETEER) {
    console.log('get tags', tag)
  }
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
  if (process.env.TRACE_PUPPETEER) {
    console.log('hover element')
  }
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

async function getElement (page, identifier) {
  if (process.env.TRACE_PUPPETEER) {
    console.log('get element', identifier)
  }
  let fails = 0
  while (true) {
    try {
      const element = await page.$(identifier)
      return element
    } catch (error) {
    }
    fails++
    if (fails > 10) {
      throw new Error('getElement failed ten times')
    }
    await wait(1)
  }
}

async function getOptionalElement (page, identifier) {
  if (process.env.TRACE_PUPPETEER) {
    console.log('get optional element', identifier)
  }
  let fails = 0
  while (true) {
    try {
      const element = await page.$(identifier)
      return element
    } catch (error) {
    }
    fails++
    if (fails > 10) {
      return
    }
    await wait(1)
  }
}

async function clickElement (element) {
  if (process.env.TRACE_PUPPETEER) {
    console.log('click element')
  }
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
  if (process.env.TRACE_PUPPETEER) {
    console.log('focus element')
  }
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
  if (process.env.TRACE_PUPPETEER) {
    console.log('upload file', path)
  }
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
  if (process.env.TRACE_PUPPETEER) {
    console.log('type in element', text)
  }
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
  if (process.env.TRACE_PUPPETEER) {
    console.log('select option', value)
  }
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
