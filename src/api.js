let StorageObject
const Timestamp = require('./timestamp.js')

module.exports = {
  wrapAPIRequest,
  generate: () => {
    StorageObject = require('./storage-object.js')
    const api = {}
    for (const url in global.sitemap) {
      if (url.indexOf('/api/') !== 0) {
        continue
      }
      const pathParts = url.substring(5).split('/')
      const prior = []
      for (const partRaw of pathParts) {
        let part = partRaw
        if (!prior.length) {
          api[part] = api[part] || {}
          prior.push(part)
          continue
        }
        let obj = api
        for (const priorPart of prior) {
          obj = obj[priorPart]
        }
        prior.push(part)
        if (prior.length === pathParts.length) {
          if (partRaw.indexOf('-') === -1) {
            part = partRaw.charAt(0).toUpperCase() + partRaw.substring(1)
          } else {
            const segments = partRaw.split('-')
            part = ''
            for (const segment of segments) {
              part += segment.charAt(0).toUpperCase() + segment.substring(1)
            }
          }
          obj[part] = global.sitemap[url].api
        } else {
          obj[part] = obj[part] || {}
        }
      }
      wrapAPIRequest(global.sitemap[url].api, url)
    }
    return api
  }
}

/**
 * wrapAPIRequest takes each of the HTTP-or-not API routes and wraps
 * a function that verifies access is allowed and the user allowed and
 * optionally ends a ClientResponse with JSON of returned data
 * @param {*} nodejsHandler an API endpoint
 */
function wrapAPIRequest (nodejsHandler, filePath) {
  for (const functionName of ['get', 'post', 'patch', 'delete', 'put', 'head', 'option']) {
    const originalFunction = nodejsHandler[functionName]
    if (!originalFunction) {
      continue
    }
    if (nodejsHandler[`_${functionName}`]) {
      continue
    }
    if (nodejsHandler.lock) {
      nodejsHandler[`_${functionName}`] = wrapSessionLocking(nodejsHandler, originalFunction)
    } else if (nodejsHandler.before) {
      nodejsHandler[`_${functionName}`] = wrapBeforeHandling(nodejsHandler, originalFunction)
    } else {
      nodejsHandler[`_${functionName}`] = originalFunction
    }
    nodejsHandler[functionName] = wrapResponseHandling(nodejsHandler[`_${functionName}`])
  }
  return nodejsHandler
}

function wrapBeforeHandling (nodejsHandler, method) {
  return async (req) => {
    try {
      await nodejsHandler.before(req)
    } catch (error){
      if (process.env.DEBUG_ERRORS) {
        console.log('api.before', error)
      }
      throw error
    }
    try {
      return method(req)
    } catch (error) {
      if (process.env.DEBUG_ERRORS) {
        console.log('api.method', error)
      }
      throw error
    }
  }
}

function wrapSessionLocking (nodejsHandler, method) {
  return async (req) => {
    if (!req.session) {
      return { 'object': 'auth', 'message': 'Sign in required' }
    }
    if (nodejsHandler.before) {
      try {
        await nodejsHandler.before(req)
      } catch (error) {
        if (process.env.DEBUG_ERRORS) {
          console.log('api.before', error)
        }
        throw error
      }
    }
    // lock the session to the API URL
    if (req.session.lockURL !== req.url) {
      // remove old lock data
      const oldData = []
      if (req.session.unlocked > Timestamp.now) {
        oldData.push(`lock`, `lockData`)
      } else {
        oldData.push(`unlocked`, `lock`, `lockData`)
      }
      await StorageObject.removeProperties(`${req.appid}/session/${req.session.sessionid}`, oldData)
      for (const property of oldData) {
        delete (req.session[property])
      }
    }
    // update the lock data and wait for authorization
    if (!req.session.unlocked) {
      req.session.lock = Timestamp.now
      req.session.lockData = req.body ? JSON.stringify(req.body) : '{}'
      req.session.lockURL = req.url
      await StorageObject.setProperties(`${req.appid}/session/${req.session.sessionid}`, {
        lock: req.session.lock,
        lockData: req.session.lockData,
        lockURL: req.session.lockURL,
      })
      return { object: 'lock', message: 'Authorization required' }
    }
    // remove old lock and unlock data
    const staleData = ['lockData', 'lockURL', 'lock']
    if (req.session.unlocked <= Timestamp.now) {
      staleData.push('unlocked')
    }
    await StorageObject.removeProperties(`${req.appid}/session/${req.session.sessionid}`, staleData)
    for (const property of staleData) {
      delete (req.session[property])
    }
    const query = req.query
    req.query = { sessionid: req.session.sessionid }
    req.session = await global.api.user.Session._get(req)
    req.query = query
    // complete the operation
    try {
      return method(req)
    } catch (error) {
      if (process.env.DEBUG_ERRORS) {
        console.log('api.method', error)
      }
      throw error
    }
  }
}

function wrapResponseHandling (method) {
  return async (req, res) => {
    let result
    try {
      result = await method(req)
    } catch (error) {
      if (process.env.DEBUG_ERRORS) {
        console.log('api.method', error)
      }
      if (res) {
        res.statusCode = 500
        res.setHeader('content-type', 'application/json')
        return res.end(`{ "object": "error", "message": "${error.message || 'An error ocurred'}" }`)
      }
      throw error
    }
    if (res) {
      res.statusCode = 200
      res.setHeader('content-type', 'application/json')
      return res.end(result ? JSON.stringify(result) : '')
    }
    return result
  }
}
