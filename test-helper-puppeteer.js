module.exports = {
  hover,
  click,
  fill
}

async function hover (tab, identifier) {
  const tags = ['a', 'button', 'input', 'select', 'textarea', 'img']
  while (true) {
    await tab.waitFor(100)
    let active = null
    try {
      const frame = await tab.frames().find(f => f.name() === 'application-iframe')
      if (frame && frame.evaluate) {
        active = frame
      }
    } catch (error) {
    }
    active = active || tab
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

async function click (tab, identifier) {
  const tags = ['a', 'button', 'input', 'select', 'textarea', 'img']
  const bodyWas = await tab.evaluate(() => document.innerHTML)
  while (true) {
    await tab.waitFor(100)
    let active = null
    try {
      const frame = await tab.frames().find(f => f.name() === 'application-iframe')
      if (frame && frame.evaluate) {
        active = frame
      }
    } catch (error) {
      continue
    }
    active = active || tab
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
          return completeRequest(tab, bodyWas)
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
          return completeRequest(tab, bodyWas)
        }
      }
    }
  }
}

async function fill (tab, body) {
  while (true) {
    await tab.waitFor(100)
    let active = null
    try {
      const frame = await tab.frames().find(f => f.name() === 'application-iframe')
      if (frame && frame.evaluate) {
        active = frame
      }
    } catch (error) {
      continue
    }
    active = active || tab
    let completed = true
    for (const field in body) {
      if (!body[field]) {
        continue
      }
      let element
      try {
        element = await active.$(`#${field}`)
      } catch (error) {
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
        await element.click()
      } catch (error) {
        completed = false
        break
      }
      try {
        await element.type(body[field])
      } catch (error) {
        completed = false
        break
      }
      // if (type === 'TEXTAREA') {
      //   await element.type(body[field])
      // } else if (type === 'SELECT') {
      //   await element.type(body[field])
      // } else if (type === 'INPUT') {
      //   await element.type(body[field])
      // }
    }
    if (completed) {
      return
    }
  }
}

async function completeRequest (tab, previousContents) {
  await tab.waitForNavigation({
    waitUntil: ['load', 'domcontentloaded', 'networkidle0']
  })
  while (true) {
    await tab.waitFor(100)
    let bodyNow
    try {
      bodyNow = await tab.evaluate(() => document.body.innerHTML)
    } catch (error) {
      continue
    }
    if (!bodyNow || bodyNow === previousContents) {
      continue
    }
    if (bodyNow.indexOf('Redirecting') > -1) {
      await tab.waitForNavigation({
        waitUntil: ['load']
      })
    }
    return
  }
}
