const bcrypt = require('bcrypt-node')
const http = require('http')
const https = require('https')
const HTML = require('./html.js')
const Response = require('./response.js')

module.exports = { pass }

function pass(req, res) {
  let baseURL = global.applicationServer.split('://')[1]
  const baseSlash = baseURL.indexOf('/')
  if (baseSlash > -1) {
    baseURL = baseURL.substring(0, baseSlash)
  }
  let port
  const portColon = baseURL.indexOf(':')
  if (portColon > -1) {
    port = baseURL.substring(portColon + 1)
    baseURL = baseURL.substring(0, portColon)
  } else {
    port = global.applicationServer.startsWith('https') ? 443 : 80
  }
  const requestOptions = {
    host: baseURL,
    path: req.url,
    method: req.method,
    port,
    headers: {
      'referer': `${global.dashboardServer}${req.url}`,
      'x-dashboard-server': global.dashboardServer
    }
  }
  if (req.account) {
    const token = `${global.applicationServerToken}/${req.account.accountid}/${req.session.sessionid}`
    const salt = bcrypt.genSaltSync(1)
    const tokenHash = bcrypt.hashSync(token, salt)
    requestOptions.headers['x-accountid'] = req.account.accountid
    requestOptions.headers['x-sessionid'] = req.session.sessionid
    requestOptions.headers['x-dashboard-token'] = tokenHash
  } else {
    const token = global.applicationServerToken
    const salt = bcrypt.genSaltSync(1)
    const tokenHash = bcrypt.hashSync(token, salt)
    requestOptions.headers['x-dashboard-token'] = tokenHash
  }
  if (req.body) {
    requestOptions.headers['content-length'] = req.headers['content-length']
    requestOptions.headers['content-type'] = req.headers['content-type']
  }
  const protocol = global.applicationServer.startsWith('https') ? https : http
  const proxyReq = protocol.request(requestOptions, (proxyRes) => {
    let body
    proxyRes.on('data', (chunk) => {
      body = body ? Buffer.concat([body, chunk]) : chunk
    })
    proxyRes.on('end', () => {
      switch (proxyRes.statusCode) {
        case 200:
          if (proxyRes.headers['content-type'].indexOf('text/html') > 1) {
            body = body.toString('utf-8')
            if (body.indexOf('<html') > -1) {
              let doc
              try {
                doc = HTML.parse(body)
              } catch (error) {
              }
              const htmlTags = doc.getElementsByTagName('html')
              if (htmlTags && htmlTags.length) {
                const htmlTag = htmlTags[0]
                if (htmlTag.attr && (htmlTag.attr.template === false || htmlTag.attr.template === 'false')) {
                  return res.end(body)
                }
              }
              return Response.end(req, res, doc)
            }
          }
          if (proxyRes.headers['content-type']) {
            res.setHeader('content-type', proxyRes.headers['content-type'])
          }
          return res.end(body)
        case 302:
          return Response.redirect(req, res, proxyRes.headers['location'])
        case 404:
          return Response.throw404(req, res)
        case 511:
          return Response.redirectToSignIn(req, res)
        case 500:
        default:
          return Response.throw500(req, res)
      }
    })
  })
  if (req.body) {
    proxyReq.write(req.bodyRaw)
  }
  return proxyReq.end()
}