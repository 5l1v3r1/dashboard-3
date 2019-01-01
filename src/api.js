const StorageObject = require('./storage-object.js')
const Timestamp = require('./timestamp.js')

module.exports = {
  wrapAPIRequest,
  generate: () => {
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
    nodejsHandler[`_${functionName}`] = originalFunction
    nodejsHandler[functionName] = async (req, res) => {
      if (!req.session && nodejsHandler.auth !== false) {
        if (res) {
          res.statusCode = 511
          res.setHeader('content-type', 'application/json')
          return res.end(`{ "object": "auth", "message": "Sign in required" }`)
        }
        return { 'object': 'auth', 'message': 'Sign in required' }
      }
      if (nodejsHandler.before) {
        try {
          await nodejsHandler.before(req)
        } catch (error) {
          if (process.env.DEBUG_ERRORS) {
            console.log('api.before', error)
          }
          if (res) {
            res.statusCode = 500
            res.setHeader('content-type', 'application/json')
            return res.end(`{ "object": "error", "message": "An error ocurred"}`)
          }
          throw error
        }
      }
      if (nodejsHandler.lock) {
        // lock the session to the API URL
        if (req.session.lockURL !== req.url) {
          // remove old lock data
          if (req.session.unlocked > Timestamp.now) {
            await StorageObject.setProperty(`${req.appid}/${req.session.sessionid}`, `lockURL`, req.url)
            await StorageObject.removeProperties(`${req.appid}/${req.session.sessionid}`, [ `lockStarted`, `lockData` ])
          } else {
            // remove old unlock data
            await StorageObject.setProperties(`${req.appid}/${req.session.sessionid}`, { lock: Timestamp.now, lockURL: req.url })
            await StorageObject.removeProperties(`${req.appid}/${req.session.sessionid}`, [ `unlocked`, `lockStarted`, `lockData` ])
          }
        } 
        if (!req.session.unlocked) {
          await StorageObject.setProperties(`${req.appid}/${req.session.sessionid}`, { 
            lockStarted: Timestamp.now, 
            lockData: req.body ? JSON.stringify(req.body) : '{}',
            lockURL: req.url,
          })
          if (res) {
            res.statusCode = 511
            res.setHeader('content-type', 'application/json')
            return res.end(`{ "object": "lock", "message": "Authorization required" }`)
          }
          return { object: 'lock', message: 'Authorization required' }
        }
        // remove old lock data
        const staleData = ['lockStarted', 'lockData', 'lockURL', 'lock']
        // remove old unlock data
        if (req.session.unlocked <= Timestamp.now) {
          staleData.push('unlocked')
        }
        await StorageObject.removeProperties(`${req.appid}/${req.session.sessionid}`, staleData)
        const sessionReq = { query: { sessionid: req.session.sessionid }, appid: req.appid, account: req.account }
        req.session = await global.api.user.Session._get(sessionReq)
      }
      let result
      try {
        result = await originalFunction(req)
      } catch (error) {
        if (process.env.DEBUG_ERRORS) {
          console.log('api.after', error)
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
  return nodejsHandler
}
