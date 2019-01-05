/* eslint-env mocha */
const bcrypt = require('bcrypt-node')
const dashboard = require('./index.js')
const fs = require('fs')
const http = require('http')
const https = require('https')
const querystring = require('querystring')
const testData = require('./test-data.json')
const url = require('url')
const util = require('util')

const storagePath = process.env.STORAGE_PATH || `${__dirname}/data`
let testDataIndex = 0

if (process.env.STORAGE_ENGINE) {
  require(`${process.env.STORAGE_ENGINE}/test-helper.js`)
}

if (process.env.STORAGE_CACHE) {
  require(`${process.env.STORAGE_CACHE}/test-helper.js`)
}

before(async () => {
  await dashboard.start(global.applicationPath || __dirname)
})

beforeEach(async () => {
  global.appid = `tests_${dashboard.Timestamp.now}`
  global.allowPublicAPI = true
  global.testNumber = dashboard.Timestamp.now
  global.testModuleJSON = null
  global.minimumUsernameLength = 1
  global.maximumUsernameLength = 100
  global.minimumPasswordLength = 1
  global.maximumPasswordLength = 100
  global.minimumResetCodeLength = 1
  global.maximumResetCodeLength = 100
  global.requireProfileEmail = false
  global.requireProfileName = false
  global.minimumProfileFirstNameLength = 1
  global.maximumProfileFirstNameLength = 100
  global.minimumProfileLastNameLength = 1
  global.maximumProfileLastNameLength = 100
  global.bcryptWorkloadFactor = 1
  global.deleteDelay = 7
  global.maximumProfileFieldLength = 50
  global.pageSize = 2
  global.allowPublicAPI = true
  global.bcryptFixedSalt = bcrypt.genSaltSync(1)
  if (!process.env.STORAGE_ENGINE) {
    if (fs.existsSync(storagePath)) {
      deleteLocalData(storagePath)
    }
    fs.mkdirSync(storagePath)
    await wait()
  }
})

afterEach(() => {
  if (!process.env.STORAGE_ENGINE) {
    if (fs.existsSync(storagePath)) {
      deleteLocalData(storagePath)
    }
  }
})


after((callback) => {
  dashboard.stop()
  global.testEnded = true
  return callback()
})

module.exports = {
  createAdministrator,
  createOwner,
  createProfile,
  createRequest,
  createSession,
  createResetCode,
  deleteResetCode,
  createUser,
  setDeleted,
  lockSession,
  unlockSession,
  useResetCode,
  extractDoc,
  extractRedirectURL
}

// this delay is used to pad file creation / modification
// times so list orders isn't jumbled due to nearly
// instant sequential writes
const wait = util.promisify(function(callback) {
  if (!process.env.STORAGE_ENGINE) {
    return setTimeout(callback, 1)
  }
  return callback()
})

function createRequest(rawURL) {
  const req = {
    appid: global.appid,
    url: rawURL,
    urlPath: rawURL.split('?')[0]
  }
  if (req.url !== req.urlPath) {
    req.query = url.parse(rawURL, true).query
  }
  req.route = global.sitemap[req.urlPath]
  if (req.route) {
    for (const verb of ['get', 'post', 'patch', 'delete', 'put']) {
      if (!req.route.api[verb]) {
        continue
      }
      req[verb] = async () => {
        req.method = verb.toUpperCase()
        await wait()
        // perform the operation
        let result
        try {
          result = await proxy(verb, rawURL, req)
        } catch (error) {
          return error
        }
        if (req.authorize === false) {
          return result
        }
        await wait()
        let redirectURL
        // check if it requires authorization
        if (result && result.node === 'element') {
          redirectURL = extractRedirectURL(result)
        } else if (result && result.message === 'Authorization required') {
          redirectURL = '/account/authorize'
        }
        if (redirectURL === '/account/authorize') {
          const bodyWas = req.body
          req.body = {
            username: req.account.username,
            password: req.account.password
          }
          if (process.env.UNLOCK_SESSION) {
            req.body.remember = 'minutes'
          }
          try {
            if (rawURL.startsWith('/api/')) {
              await proxy('PATCH', `/api/user/set-session-unlocked?sessionid=${req.session.sessionid}`, req)
            } else {
              await proxy('POST', '/account/authorize', req)
            }            
          } catch (error) {
            return error
          }
          let result3
          req.body = bodyWas
          try {
            if (rawURL.startsWith('/api/')) {
              result3 = await proxy(verb.toUpperCase(), rawURL, req)
            } else {
              result3 = await proxy('GET', rawURL, req)
            }
          } catch (error) {
            return error
          }
          return result3
        }
        return result
      }
    }
  }
  return req
}

function extractDoc(str) {
  let doc
  const templateDoc = str.node ? str : dashboard.HTML.parse(str)
  const applicationIframe = templateDoc.getElementById('application-iframe')
  if (applicationIframe) {
    const pageSource = applicationIframe.attr.srcdoc.join(' ')
    doc = dashboard.HTML.parse(pageSource)
  } else {
    doc = templateDoc
  }
  return doc
}

function extractRedirectURL(doc) {
  const metaTags = doc.getElementsByTagName('meta')
  if (metaTags && metaTags.length) {
    for (const metaTag of metaTags) {
      if (!metaTag.attr || !metaTag.attr.content || metaTag.attr['http-equiv'] !== 'refresh') {
        continue
      }
      return metaTag.attr.content.split(';url=')[1]
    }
  }
  return null
}

async function createAdministrator(owner) {
  const administrator = await createUser('administrator-' + dashboard.Timestamp.now + '-' + Math.ceil(Math.random() * 100000))
  if (!administrator.account.administrator) {
    if (!owner) {
      throw new Error('created a user with no owner to elevate permissions')
    }
    const req2 = createRequest(`/api/administrator/set-account-administrator?accountid=${administrator.account.accountid}`)
    req2.account = owner.account
    req2.session = owner.session
    const credentials = administrator.account
    administrator.account = await req2.patch()
    administrator.account.username = credentials.username
    administrator.account.password = credentials.password
  }
  return administrator
}

async function createOwner() {
  const owner = await createUser('owner-' + dashboard.Timestamp.now + '-' + Math.ceil(Math.random() * 100000))
  if (!owner.account.administrator) {
    const req2 = createRequest(`/api/administrator/set-account-administrator?accountid=${owner.account.accountid}`)
    owner.account = await req2.route.api._patch(req2)
  }
  if (!owner.account.owner) {
    const req2 = createRequest(`/api/administrator/set-owner-account?accountid=${owner.account.accountid}`)
    owner.account = await req2.route.api._patch(req2)
  }
  return owner
}

async function createUser(username) {
  username = username || 'user-' + dashboard.Timestamp.now + '-' + Math.ceil(Math.random() * 100000)
  const password = username
  const req = createRequest('/api/user/create-account')
  req.body = { 
    username, 
    password,
    [`first-name`]: testData[testDataIndex].firstName,
    [`last-name`]: testData[testDataIndex].lastName,
    email: testData[testDataIndex].email
  }
  testDataIndex++
  if (testDataIndex === testData.length) {
    testDataIndex = 0
  }
  const account = await req.post()
  account.username = username
  account.password = password
  const req2 = createRequest(`/api/user/create-session?accountid=${account.accountid}`)
  req2.body = { 
    username,
    password
  }
  const session = await req2.post()
  const req3 = createRequest(`/api/user/profile?profileid=${account.profileid}`)
  req3.account = account
  req3.session = session
  const req4 = createRequest(`/api/user/account?accountid=${account.accountid}`)
  req4.account = account
  req4.session = session
  const req5 = createRequest(`/api/user/session?sessionid=${session.sessionid}`)
  req5.account = account
  req5.session = session
  const user = { 
    profile: await req3.get(),
    account: await req4.get(), 
    session: await req5.get()
  }
  user.session.token = session.token
  user.account.username = username
  user.account.password = password
  return user
}

async function createSession(user, expires) {
  const req = createRequest(`/api/user/create-session?accountid=${user.account.accountid}`)
  req.body = {
    username: user.account.username,
    password: user.account.password,
    expires: expires || ''
  }
  user.session = await req.post()
  return user.session
}

async function lockSession(user, impersonatingid) {
  const req = createRequest(`/api/user/set-account-password?accountid=${impersonatingid || user.account.accountid}`)
  req.account = user.account
  req.session = user.session
  req.body = {
    password: 'new-password',
    confirm: 'new-password'
  }
  req.authorize = false
  await req.patch()
  user.password = 'new-password'
  return user.session
}

async function unlockSession(user, long) {
  const req = createRequest(`/api/user/set-session-unlocked?sessionid=${user.session.sessionid}`)
  req.account = user.account
  req.session = user.session
  req.body = {
    username: user.account.username,
    password: user.account.password,
    remember: long ? 'minutes' : ''
  }
  await req.patch()
  return user.session
}

async function setDeleted(user) {
  const req = createRequest(`/api/user/set-account-deleted?accountid=${user.account.accountid}`)
  req.account = user.account
  req.session = user.session
  user.account = await req.patch()
  user.account.username = req.account.username
  user.account.password = req.account.password
  return user.account
}

async function createResetCode(user) {
  const code = 'resetCode-' + dashboard.Timestamp.now + '-' + Math.ceil(Math.random() * 100000)
  const req = createRequest(`/api/user/create-reset-code?accountid=${user.account.accountid}`)
  req.account = user.account
  req.session = user.session
  req.body = { code }
  user.resetCode = await req.post()
  user.resetCode.code = code
  return user.resetCode
}

async function deleteResetCode(user) {
  const req = createRequest(`/api/user/delete-reset-code?codeid=${user.resetCode.codeid}`)
  req.account = user.account
  req.session = user.session
  await req.delete()
}

async function useResetCode(user) {
  const req = createRequest(`/api/user/reset-account-password?accountid=${user.account.accountid}`)
  req.account = user.account
  req.session = user.session
  req.body = {
    username: user.account.username,
    password: 'new password',
    confirm: 'new password',
    code: user.resetCode.code
  }
  user.account = await req.patch()
  user.account.username = req.body.username
  user.account.password = req.body.password
  return user.account
}

async function createProfile(user) {
  const req = createRequest(`/api/user/create-profile?accountid=${user.account.accountid}`)
  req.account = user.account
  req.session = user.session
  req.body = {
    ['first-name']: user.profile.firstName,
    ['last-name']: user.profile.lastName,
    email: testData[testDataIndex].email,
    default: 'true'
  }
  testDataIndex++
  if (testDataIndex === testData.length) {
    testDataIndex = 0
  }
  user.profile = await req.post()
  return user.profile
}

const proxy = util.promisify((method, path, req, callback) => {
  const baseURLParts = process.env.DASHBOARD_SERVER.split('://')
  let host, port
  const colon = baseURLParts[1].indexOf(':')
  if (colon > -1) {
    port = baseURLParts[1].substring(colon + 1)
    host = baseURLParts[1].substring(0, colon)
  } else if (baseURLParts[0] === 'https') {
    port = 443
    host = baseURLParts[1]
  } else if (baseURLParts[0] === 'http') {
    port = 80
    host = baseURLParts[1]
  }
  const requestOptions = {
    host,
    path,
    port,
    method: method.toUpperCase(),
    headers: {
      'user-agent': 'integration tests'
    }
  }
  let postData
  if (req.body) {
    // multipart payloads where req.body is a buffer
    if (req.body.write) {
      postData = req.body
      requestOptions.headers = req.headers
      requestOptions.headers['user-agent'] = 'integration tests'
    } else {
      // req.body = { key: value }
      postData = querystring.stringify(req.body)
      requestOptions.headers['content-length'] = postData.length
    }
  }
  if (req.session && req.session.expires) {
    const expires = dashboard.Timestamp.date(req.session.expires)
    requestOptions.headers.cookie = `sessionid=${req.session.sessionid}; token=${req.session.token}; expires=${expires.toUTCString()}; path=/`
  }
  const protocol = baseURLParts[0] === 'https' ? https : http
  const proxyRequest = protocol.request(requestOptions, (proxyResponse) => {
    let body = ''
    proxyResponse.on('data', (chunk) => {
      body += chunk
    })
    return proxyResponse.on('end', () => {
      if (!body) {
        return callback()
      }
      if (proxyResponse.headers['set-cookie']) {
        const cookie = proxyResponse.headers['set-cookie']
        const sessionid = cookie[0].substring(cookie[0].indexOf('=') + 1)
        const expires = cookie[0].substring(cookie[0].indexOf('expires=') + 'expires='.length)
        const token = cookie[1].substring(cookie[1].indexOf('=') + 1)
        req.session = {
          sessionid: sessionid.split(';')[0],
          token: token.split(';')[0],
          expires: dashboard.Timestamp.create(dashboard.Format.parseDate(expires))
        }
      }
      if (proxyResponse.headers['content-type']) {
        if (proxyResponse.headers['content-type'].startsWith('text/html')) {
          const doc = dashboard.HTML.parse(body)
          return callback(null, doc)
        }
        if (proxyResponse.headers['content-type'].startsWith('application/json')) {
          body = JSON.parse(body)
          return callback(null, body)
        }
      }
      return callback(null, body)
    })
  })
  proxyRequest.on('error', (error) => {
    return callback(error)
  })
  if (postData) {
    proxyRequest.write(postData)
  }
  return proxyRequest.end()
})

// via https://stackoverflow.com/questions/18052762/remove-directory-which-is-not-empty
function deleteLocalData (currentPath) {
  if (!fs.existsSync(currentPath)) {
    return
  }
  const contents = fs.readdirSync(currentPath)
  for (const item of contents) {
    var itemPath = `${currentPath}/${item}`
    const stat = fs.lstatSync(itemPath)
    if (stat.isDirectory()) {
      deleteLocalData(itemPath)
    } else {
      fs.unlinkSync(itemPath)
    }
  }
  fs.rmdirSync(currentPath)
}