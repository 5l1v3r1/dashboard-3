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
    nodejsHandler[functionName] = wrapResponseHandling(nodejsHandler[`_${functionName}`])
  }
  return nodejsHandler
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
        res.setHeader('content-type', 'application/json; charset=utf-8')
        return res.end(`{ "object": "error", "message": "${error.message || 'An error ocurred'}" }`)
      }
      throw error
    }
    if (res) {
      res.statusCode = 200
      res.setHeader('content-type', 'application/json; charset=utf-8')
      return res.end(result ? JSON.stringify(result) : '')
    }
    return result
  }
}
