const bcrypt = require('./bcrypt.js')
const fs = require('fs')
const Hash = require('./hash.js')
const HTML = require('./html.js')
const http = require('http')
const Multiparty = require('multiparty')
const Proxy = require('./proxy.js')
const querystring = require('querystring')
const Response = require('./response.js')
const Timestamp = require('./timestamp.js')
const util = require('util')
let StorageObject
const languageCache = {}

const parsePostData = util.promisify((req, callback) => {
  if (req.headers &&
      req.headers['content-type'] &&
      req.headers['content-type'].indexOf('multipart/form-data') > -1) {
    return callback()
  }
  let body = ''
  req.on('data', (data) => {
    body += data
  })
  return req.on('end', () => {
    if (!body) {
      return callback()
    }
    return callback(null, body)
  })
})

const parseMultiPartData = util.promisify((req, callback) => {
  const form = new Multiparty.Form()
  return form.parse(req, async (error, fields, files) => {
    if (error) {
      return callback(error)
    }
    req.body = {}
    for (const field in fields) {
      req.body[field] = fields[field][0]
    }
    req.uploads = {}
    for (const field in files) {
      const file = files[field][0]
      if (!file.size) {
        continue
      }
      const extension = file.originalFilename.toLowerCase().split('.').pop()
      const type = extension === 'png' ? 'image/png' : 'image/jpeg'
      req.uploads[field] = {
        type,
        buffer: fs.readFileSync(file.path),
        name: file.originalFilename
      }
      fs.unlinkSync(file.path)
    }
    return callback()
  })
})

let server
const fileCache = {}
const hashCache = {}
const hashCacheItems = []

module.exports = {
  authenticateRequest,
  parsePostData,
  parseMultiPartData,
  receiveRequest,
  start,
  stop,
  staticFile
}

function start () {
  StorageObject = require('./storage-object.js')
  server = http.createServer(receiveRequest)
  server.listen(global.port, global.host)
  return server
}

function stop () {
  if (server) {
    server.close()
  }
}

async function receiveRequest (req, res) {
  if (process.env.DEBUG_REQUESTS) {
    console.log('server.receive', req.method, req.url)
  }
  const question = req.url.indexOf('?')
  req.appid = global.appid
  req.urlPath = question === -1 ? req.url : req.url.substring(0, question)
  const dot = req.urlPath.lastIndexOf('.')
  req.route = global.sitemap[`${req.urlPath}/index`] || global.sitemap[req.urlPath]
  req.extension = dot > -1 ? req.urlPath.substring(dot + 1) : null
  if (question !== -1) {
    req.query = querystring.parse(req.url.substring(question + 1), '&', '=')
  }
  if (req.method === 'POST' || req.method === 'PATCH' || req.method === 'PUT' || req.method === 'DELETE') {
    if (req.headers['content-type'] && req.headers['content-type'].indexOf('multipart/form-data;') > -1) {
      try {
        await parseMultiPartData(req)
      } catch (error) {
        if (process.env.DEBUG_ERRORS) {
          console.log('server.parseMultiPartData', error)
        }
        return Response.throw500(req, res)
      }
    }
    if (!req.body) {
      try {
        req.bodyRaw = await parsePostData(req)
      } catch (error) {
        if (process.env.DEBUG_ERRORS) {
          console.log('server.parsePostData', error)
        }
        return Response.throw500(req, res)
      }
      if (req.bodyRaw) {
        req.body = querystring.parse(req.bodyRaw, '&', '=')
      }
    }
  }
  if (req.urlPath.startsWith('/public/') || req.urlPath === '/favicon.ico') {
    if (req.method === 'GET') {
      return staticFile(req, res)
    } else {
      return Response.throw404(req, res)
    }
  }
  try {
    await executeHandlers(req, res, 'before', global.packageJSON.dashboard.server, global.packageJSON.dashboard.serverFilePaths)
  } catch (error) {
    if (process.env.DEBUG_ERRORS) {
      console.log('server.before', error)
    }
    if (error.message === 'invalid-route') {
      return Response.throw404(req, res)
    }
    return Response.throw500(req, res)
  }
  if (res.ended) {
    return
  }
  let applicationServer = global.applicationServer
  if (req.server) {
    applicationServer = req.server.applicationServer || applicationServer
  }
  if (req.headers['x-application-server'] && req.headers['x-application-server'] === applicationServer) {
    const receivedToken = req.headers['x-dashboard-token']
    const tokenWorkload = bcrypt.getRounds(receivedToken)
    if (tokenWorkload === 4) {
      let applicationServerToken = global.applicationServerToken
      if (req.server) {
        applicationServerToken = req.server.applicationServerToken || applicationServerToken
      }
      let expectedText
      if (req.headers['x-accountid']) {
        const accountid = req.headers['x-accountid']
        const sessionid = req.headers['x-sessionid']
        expectedText = `${applicationServerToken}/${accountid}/${sessionid}`
      } else {
        expectedText = applicationServerToken
      }
      if (hashCache[expectedText] === receivedToken) {
        req.applicationServer = true
      } else {
        req.applicationServer = bcrypt.compareSync(expectedText, receivedToken)
        if (req.applicationServer) {
          hashCache[expectedText] = receivedToken
          hashCacheItems.unshift(expectedText)
          if (hashCacheItems.length > 100000) {
            hashCacheItems.pop()
          }
        }
      }
    }
  }
  if (!req.applicationServer && req.headers['x-application-server']) {
    return Response.throw500(req, res)
  }
  if (req.urlPath.startsWith('/api/') && !global.allowPublicAPI && !req.applicationServer && !req.allowAPIRequest) {
    return Response.throw404(req, res)
  }
  if (req.route && req.route.api !== 'static-page') {
    const methodHandler = req.route.api[req.method.toLowerCase()]
    if (!methodHandler) {
      return Response.throw404(req, res)
    }
  }
  let user
  if (req.applicationServer) {
    if (req.headers['x-accountid']) {
      const query = req.query
      req.query = { accountid: req.headers['x-accountid'] }
      let account
      try {
        account = await global.api.administrator.Account.get(req)
      } catch (error) {
      }
      if (!account) {
        return Response.throw500(req, res)
      }
      req.query.sessionid = req.headers['x-sessionid']
      let session
      try {
        session = await global.api.administrator.Session.get(req)
      } catch (error) {
      }
      if (!session) {
        return Response.throw500(req, res)
      }
      req.query = query
      user = { account, session }
    }
  } else {
    try {
      user = await authenticateRequest(req)
      if (process.env.DEBUG_MESSAGES) {
        if (user) {
          if (user.account.administrator) {
            if (user.account.ownerid) {
              console.log('server.authenticate (owner)', user.account.accountid, user.session.sessionid)
            } else {
              console.log('server.authenticate (administrator)', user.account.accountid, user.session.sessionid)
            }
          } else {
            console.log('server.authenticate (user)', user.account.accountid, user.session.sessionid)
          }
        } else {
          console.log('server.authenticate', 'guest')
        }
      }
    } catch (error) {
      if (process.env.DEBUG_MESSAGES) {
        console.log('server.authenticate', error)
      }
    }
  }
  if (user) {
    req.session = user.session
    req.account = user.account
    req.language = global.language || req.account.language || 'en-US'
  } else {
    req.language = global.language || 'en-US'
  }
  if (!req.account && req.route && req.route.auth !== false) {
    if (req.urlPath.startsWith('/api/')) {
      res.statusCode = 511
      res.setHeader('content-type', 'application/json')
      return res.end('{ "object": "auth", "message": "Sign in required" }')
    }
    return Response.redirectToSignIn(req, res)
  }
  try {
    await executeHandlers(req, res, 'after', global.packageJSON.dashboard.server, global.packageJSON.dashboard.serverFilePaths)
  } catch (error) {
    if (process.env.DEBUG_ERRORS) {
      console.log('server.after', error)
    }
    if (error.message === 'invalid-route') {
      return Response.throw404(req, res)
    }
    return Response.throw500(req, res)
  }
  if (res.ended) {
    return
  }
  if (req.language !== 'en-US' && req.route && req.route.htmlFilePath) {
    const newRoute = {}
    for (const x in req.route) {
      newRoute[x] = req.route[x]
    }
    const htmlFilePath = req.route.htmlFilePath.replace('/src/www', '/languages/' + req.language)
    if (languageCache[htmlFilePath]) {
      newRoute.html = languageCache[htmlFilePath]
    } else if (fs.existsSync(htmlFilePath)) {
      newRoute.html = languageCache[htmlFilePath] = fs.readFileSync(htmlFilePath)
    }
    req.route = newRoute
  }
  if (req.urlPath === '/administrator' || req.urlPath.startsWith('/administrator/') || req.urlPath.startsWith('/api/administrator/')) {
    if (!req.account) {
      return Response.redirectToSignIn(req, res)
    }
    if (!req.account.administrator) {
      return Response.throw500(req, res)
    }
  }
  if (req.session) {
    req.session.lastVerified = req.session.lastVerified || req.session.created
    if (Timestamp.now - req.session.lastVerified > 86400) {
      delete (req.session.lastVerified)
    }
    if (req.session.lastSeen && Timestamp.now - req.session.lastSeen > 3600) {
      delete (req.session.lastVerified)
    }
    if (!req.session.lastSeen) {
      if (Timestamp.now - req.session.created > 3600) {
        delete (req.session.lastVerified)
      }
    }
    if (!req.session.lastVerified) {
      await StorageObject.removeProperty(`${req.appid}/session/${req.session.sessionid}`, 'lastVerified')
    }
    await StorageObject.setProperty(`${req.appid}/session/${req.session.sessionid}`, 'lastSeen', Timestamp.now)
    if (req.urlPath === '/administrator' || req.urlPath.startsWith('/administrator/') ||
        req.urlPath === '/account' || req.urlPath.startsWith('/account/')) {
      if (!req.session.lastVerified &&
          req.urlPath !== '/account/signout' &&
          req.urlPath !== '/account/end-all-sessions' &&
          req.urlPath !== '/account/verify') {
        return Response.redirectToVerify(req, res)
      }
    }
  }
  if (!req.route) {
    if (global.applicationServer) {
      return Proxy.pass(req, res)
    } else {
      return Response.throw404(req, res)
    }
  }
  if (process.env.HOT_RELOAD && req.route.reload) {
    req.route.reload()
  }
  if (req.route.api === 'static-page') {
    const doc = HTML.parse(req.route.html)
    return Response.end(req, res, doc)
  }
  if (req.route.iframe) {
    return Response.end(req, res)
  }
  if (req.urlPath.startsWith('/api/')) {
    return req.route.api[req.method.toLowerCase()](req, res)
  }
  try {
    if (req.route.api.before) {
      await req.route.api.before(req)
    }
    await req.route.api[req.method.toLowerCase()](req, res)
  } catch (error) {
    if (process.env.DEBUG_ERRORS) {
      console.log('server.route', error)
    }
    return Response.throw500(req, res)
  }
}

async function executeHandlers (req, res, method, handlers) {
  if (!handlers || !handlers.length) {
    return
  }
  for (const handler of handlers) {
    if (!handler || !handler[method]) {
      continue
    }
    await handler[method](req, res)
    if (res.ended) {
      return
    }
  }
}

async function staticFile (req, res) {
  let filePath = `${global.rootPath}${req.urlPath}`
  if (!fs.existsSync(filePath)) {
    filePath = `${global.applicationPath}/node_modules/@userdashboard/dashboard/src/www${req.urlPath}`
    if (!fs.existsSync(filePath)) {
      for (const moduleName of global.packageJSON.dashboard.moduleNames) {
        filePath = `${global.applicationPath}/node_modules/${moduleName}/src/www${req.urlPath}`
        if (fs.existsSync(filePath)) {
          break
        }
      }
    }
  }
  if (fs.existsSync(filePath)) {
    const stat = fs.statSync(filePath)
    if (stat.isDirectory()) {
      return Response.throw404(req, res)
    }
    if (process.env.HOT_RELOAD) {
      delete (fileCache[filePath])
    }
    const blob = fileCache[filePath] || fs.readFileSync(filePath)
    fileCache[filePath] = fileCache[filePath] || blob
    const browserCached = req.headers['if-none-match']
    req.eTag = Response.eTag(blob)
    if (browserCached && browserCached === req.eTag) {
      res.statusCode = 304
      return res.end()
    }
    return Response.end(req, res, null, blob)
  }
  if (global.applicationServer) {
    return Proxy.pass(req, res)
  }
  return Response.throw404(req, res)
}

async function authenticateRequest (req) {
  if (!req.headers.cookie || !req.headers.cookie.length) {
    return
  }
  const segments = req.headers.cookie.split(';')
  const cookie = {}
  for (const segment of segments) {
    if (!segment || segment.indexOf('=') === -1) {
      continue
    }
    const parts = segment.split('=')
    const key = parts.shift().trim()
    const value = parts.join('=')
    cookie[key] = decodeURI(value)
  }
  if (!cookie.sessionid || !cookie.token) {
    return
  }
  const query = req.query
  req.query = { sessionid: cookie.sessionid }
  let session
  try {
    session = await global.api.administrator.Session.get(req)
  } catch (error) {
  }
  if (!session || session.ended) {
    return
  }
  req.query.accountid = session.accountid
  let account
  try {
    account = await global.api.administrator.Account.get(req)
  } catch (error) {
  }
  req.query = query
  if (!account || account.deleted) {
    return
  }
  const sessionToken = await StorageObject.getProperty(`${req.appid}/session/${session.sessionid}`, 'tokenHash')
  const sessionKey = await StorageObject.getProperty(`${req.appid}/account/${account.accountid}`, 'sessionKey')
  let dashboardEncryptionKey = global.dashboardEncryptionKey
  let dashboardSessionKey = global.dashboardSessionKey
  let bcryptFixedSalt = global.bcryptFixedSalt
  if (req.server) {
    dashboardEncryptionKey = req.server.dashboardEncryptionKey || dashboardEncryptionKey
    dashboardSessionKey = req.server.dashboardSessionKey || dashboardSessionKey
    bcryptFixedSalt = req.server.bcryptFixedSalt || bcryptFixedSalt
  }
  const tokenHash = await Hash.fixedSaltHash(`${account.accountid}/${cookie.token}/${sessionKey}/${dashboardSessionKey}`, bcryptFixedSalt, dashboardEncryptionKey)
  if (sessionToken !== tokenHash) {
    return
  }
  return { session, account }
}
