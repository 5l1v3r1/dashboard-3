module.exports = {
  open,
  hover,
  click,
  fill
}

async function open (page, url) {
  const bodyWas = await page.evaluate(() => document.innerHTML)
  while (true) {
    await page.waitFor(10)
    try {
      await page.goto(url, { waitLoad: true, waitNetworkIdle: true })
      await completeRequest(page, bodyWas)
      break
    } catch (error) {
    }
  }
}

async function hover (page, identifier) {
  const tags = ['a', 'button', 'input', 'select', 'textarea', 'img']
  while (true) {
    await page.waitFor(10)
    let active = null
    try {
      const frame = await page.frames().find(f => f.name() === 'application-iframe')
      if (frame && frame.evaluate) {
        active = frame
      }
    } catch (error) {
    }
    active = active || page
    if (!active.evaluate) {
      continue
    }
    if (identifier.startsWith('#')) {
      while (true) {
        let element
        try {
          element = await active.$(identifier)
        } catch (error) {
        }
        if (!element || !element.click) {
          break
        }
        try {
          await element.hover()
        } catch (error) {
          break
        }
        return
      }
      continue
    }
    for (const tag of tags) {
      let links
      try {
        links = await active.$$(tag)
      } catch (error) {
        break
      }
      for (const link of links) {
        let text
        try {
          text = await active.evaluate(el => el.firstChild && el.firstChild.title ? el.firstChild.title : el.innerText, link)
        } catch (error) {
          break
        }
        if (!text) {
          continue
        }
        text = text.trim()
        if (text === identifier || text.indexOf(identifier) > -1) {
          try {
            await link.hover()
            return
          } catch (error) {
            break
          }
        }
      }
    }
  }
}

async function click (page, identifier) {
  const tags = ['a', 'button', 'input', 'select', 'textarea', 'img']
  const bodyWas = await page.evaluate(() => document.innerHTML)
  while (true) {
    await page.waitFor(10)
    let active = null
    try {
      const frame = await page.frames().find(f => f.name() === 'application-iframe')
      if (frame && frame.evaluate) {
        active = frame
      }
    } catch (error) {
      continue
    }
    active = active || page
    if (!active.evaluate) {
      continue
    }
    if (identifier.startsWith('#')) {
      while (true) {
        let element
        try {
          element = await active.$(identifier)
        } catch (error) {
        }
        if (!element || !element.click) {
          break
        }
        try {
          await element.hover()
        } catch (error) {
          break
        }
        try {
          await element.click()
          return completeRequest(page, bodyWas)
        } catch (error) {
          break
        }
      }
      continue
    }
    for (const tag of tags) {
      let links
      try {
        links = await active.$$(tag)
      } catch (error) {
        break
      }
      for (const link of links) {
        let text
        try {
          text = await active.evaluate(el => el.firstChild && el.firstChild.title ? el.firstChild.title : el.innerText, link)
        } catch (error) {
        }
        if (!text) {
          continue
        }
        text = text.trim()
        if (text === identifier || text.indexOf(identifier) > -1) {
          try {
            await link.click()
          } catch (error) {
            continue
          }
          return completeRequest(page, bodyWas)
        }
      }
    }
  }
}

async function fill (page, body, uploads) {
  if (!body && !uploads) {
    return
  }
  while (true) {
    await page.waitFor(10)
    let active = null
    try {
      const frame = await page.frames().find(f => f.name() === 'application-iframe')
      if (frame && frame.evaluate) {
        active = frame
      }
    } catch (error) {
      continue
    }
    active = active || page
    let completed = true
    if (uploads) {
      for (const field in uploads) {
        let element
        try {
          element = await active.$(`#${field}`)
        } catch (error) {
        }
        if (!element) {
          continue
        }
        try {
          await element.uploadFile(uploads[field].path)
        } catch (error) {
          completed = false
          break
        }
        continue
      }
    }
    if (!completed) {
      continue
    }
    if (!body) {
      return
    }
    for (const field in body) {
      let element
      try {
        element = await active.$(`#${field}`)
      } catch (error) {
      }
      if (!element) {
        const checkboxes = await active.$$('input[type=checkbox]')
        let finished = false
        if (checkboxes && checkboxes.length) {
          for (const checkbox of checkboxes) {
            const name = await active.evaluate(el => el.name, checkbox)
            if (name !== field) {
              continue
            }
            const value = await active.evaluate(el => el.value, checkbox)
            if (value === body[field]) {
              await active.evaluate((el) => { el.checked = true }, checkbox)
              finished = true
              break
            }
            if (!body[field]) {
              finished = true
              await active.evaluate((el) => { el.checked = false }, checkbox)
            }
          }
        }
        if (finished) {
          continue
        }
        const radios = await active.$$('input[type=radio]')
        if (radios && radios.length) {
          for (const radio of radios) {
            const name = await active.evaluate(el => el.name, radio)
            if (name !== field) {
              continue
            }
            const value = await active.evaluate(el => el.value, radio)
            if (value === body[field]) {
              await active.evaluate((el) => { el.checked = true }, radio)
              finished = true
              break
            }
            if (!body[field]) {
              finished = true
              await active.evaluate((el) => { el.checked = false }, radio)
            }
          }
        }
        if (finished) {
          continue
        }
      }
      if (!element) {
        completed = false
        break
      }
      let type
      try {
        type = await active.evaluate((el) => el.tagName, element)
      } catch (error) {
      }
      if (!type) {
        completed = false
        break
      }
      try {
        await element.focus()
      } catch (error) {
      }
      if (type === 'TEXTAREA') {
        try {
          await active.evaluate((el) => { el.value = '' }, element)
        } catch (error) {
        }
        await element.type(body[field])
      } else if (type === 'SELECT') {
        await active.evaluate((el, value) => {
          for (var i = 0, len = el.options.length; i < len; i++) {
            if (el.options[i].text.indexOf(value) === 0 ||
              el.options[i].value === value) {
              el.selectedIndex = i
              return
            }
          }
        }, element, body[field])
      } else if (type === 'INPUT') {
        const inputType = await active.evaluate((el) => el.type, element)
        if (inputType === 'radio' || inputType === 'checkbox') {
          try {
            if (body[field]) {
              await active.evaluate((el) => { el.checked = true }, element)
            } else {
              await active.evaluate((el) => { el.checked = false }, element)
            }
          } catch (error) {
          }
        } else {
          try {
            await active.evaluate((el, value) => { el.value = value }, element, body[field])
          } catch (error) {
          }
        }
      }
    }
    if (completed) {
      return
    }
  }
}

async function completeRequest (page, previousContents) {
  while (true) {
    await page.waitFor(10)
    let bodyNow
    try {
      bodyNow = await page.evaluate(() => document.body.innerHTML)
    } catch (error) {
      continue
    }
    if (!bodyNow || bodyNow === previousContents) {
      continue
    }
    return
  }
}
