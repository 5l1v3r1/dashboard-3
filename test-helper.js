/* eslint-env mocha */
global.applicationPath = global.applicationPath || __dirname
global.appid = global.appid || 'tests'
global.puppeteer = global.puppeteer || require('puppeteer')

const bcrypt = require('./src/bcrypt.js')
const dashboard = require('./index.js')
const fs = require('fs')
const http = require('http')
const https = require('https')
const querystring = require('querystring')
const testData = require('./test-data.json')
const TestHelperPuppeteer = require('./test-helper-puppeteer.js')
const util = require('util')

const storagePath = process.env.STORAGE_PATH || `${__dirname}/data`
let testDataIndex = 0

if (process.env.STORAGE_ENGINE) {
  require(`${process.env.STORAGE_ENGINE}/test-helper.js`)
}

if (process.env.STORAGE_CACHE) {
  require(`${process.env.STORAGE_CACHE}/test-helper.js`)
}

let browser
let packageJSON

before(async () => {
  await dashboard.start(global.applicationPath || __dirname)
  packageJSON = global.packageJSON
  // await cycleBrowserObject()
})

beforeEach(async () => {
  global.packageJSON = packageJSON
  global.appid = `tests_${dashboard.Timestamp.now}`
  global.testNumber = dashboard.Timestamp.now
  global.testModuleJSON = null
  global.requireProfile = false
  global.userProfileFields = ['full-name', 'contact-email']
  global.apiDependencies = []
  global.minimumUsernameLength = 1
  global.maximumUsernameLength = 100
  global.minimumPasswordLength = 1
  global.maximumPasswordLength = 100
  global.minimumResetCodeLength = 1
  global.maximumResetCodeLength = 100
  global.minimumProfileFirstNameLength = 1
  global.maximumProfileFirstNameLength = 100
  global.minimumProfileLastNameLength = 1
  global.maximumProfileLastNameLength = 100
  global.minimumProfileDisplayNameLength = 1
  global.maximumProfileDisplayNameLength = 100
  global.minimumProfileCompanyNameLength = 1
  global.maximumProfileCompanyNameLength = 100
  global.deleteDelay = 7
  global.pageSize = 2
  global.allowPublicAPI = true
  global.delayDiskWrites = false
  global.bcryptFixedSalt = bcrypt.genSaltSync(4)
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
  delete (global.apiDependencies)
  if (browser && browser.close) {
    browser.close()
    browser = null
  }
  return callback()
})

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
  createAdministrator,
  createOwner,
  createProfile,
  createRequest,
  createSession,
  createResetCode,
  createUser,
  cycleBrowserObject,
  deleteResetCode,
  endSession,
  nextIdentity,
  setDeleted,
  extractDoc,
  extractRedirectURL,
  wait
}

async function cycleBrowserObject () {
  while (!browser) {
    try {
      browser = await global.puppeteer.launch({
        headless: !(process.env.SHOW_BROWSERS === 'true'),
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080', '--incognito', '--disable-dev-shm-usage'],
        slowMo: 0
      })
    } catch (error) {
    }
    if (browser) {
      return browser
    }
    await wait(1)
  }
}

function createRequest (rawURL) {
  const req = {
    appid: global.appid,
    url: rawURL,
    urlPath: rawURL.split('?')[0]
  }
  req.route = global.sitemap[req.urlPath]
  if (global.applicationServer && !req.route) {
    req.route = {}
  }
  req.query = querystring.parse(rawURL.split('?')[1])
  for (const verb of ['get', 'post', 'patch', 'delete', 'put']) {
    req[verb] = async () => {
      req.method = verb.toUpperCase()
      if (req.url.startsWith('/api/')) {
        delete (global.apiResponse)
        global.apiDependencies = []
        while (true) {
          let errorMessage
          try {
            const result = await proxy(verb, rawURL, req)
            if (!result || result.object !== 'error') {
              global.apiResponse = result
              return result
            }
            errorMessage = result ? result.message : null
          } catch (error) {
            errorMessage = error.message
          }
          if (!req.retry || req.retries === 3) {
            throw new Error(errorMessage || 'api proxying failed')
          }
          req.retries = req.retries || 0
          req.retries++
          await wait(100)
        }
      }
      while (true) {
        let result
        try {
          result = await fetchWithPuppeteer(req.method, req)
        } catch (error) {
        }
        if (!result) {
          await wait(1)
          continue
        }
        try {
          result = dashboard.HTML.parse(result)
        } catch (error) {
        }
        return result
      }
    }
  }
  return req
}

function extractDoc (str) {
  if (!str) {
    return null
  }
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

function extractRedirectURL (doc) {
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

function nextIdentity () {
  testDataIndex++
  if (testDataIndex >= testData.length) {
    testDataIndex = 0
  }
  return testData[testDataIndex]
}

async function createAdministrator (owner) {
  const administrator = await createUser('administrator-' + dashboard.Timestamp.now + '-' + Math.ceil(Math.random() * 100000))
  if (!administrator.account.administrator) {
    if (!owner) {
      throw new Error('created a user with no owner to elevate permissions')
    }
    const credentials = administrator.account
    const req2 = createRequest(`/api/administrator/set-account-administrator?accountid=${administrator.account.accountid}`)
    req2.account = owner.account
    req2.session = owner.session
    administrator.account = await req2.patch(req2)
    administrator.account.username = credentials.username
    administrator.account.password = credentials.password
  }
  return administrator
}

async function createOwner () {
  const owner = await createUser('owner-' + dashboard.Timestamp.now + '-' + Math.ceil(Math.random() * 100000))
  if (!owner.account.administrator) {
    await dashboard.StorageObject.setProperty(`${global.appid}/account/${owner.account.accountid}`, 'administrator', dashboard.Timestamp.now)
    await dashboard.StorageList.add(`${global.appid}/administrator/accounts`, owner.account.accountid)
    owner.account.administrator = dashboard.Timestamp.now
  }
  if (!owner.account.owner) {
    await dashboard.StorageObject.setProperty(`${global.appid}/account/${owner.account.accountid}`, 'owner', dashboard.Timestamp.now)
    owner.account.owner = dashboard.Timestamp.now
  }
  return owner
}

async function createUser (username) {
  if (testDataIndex >= testData.length) {
    testDataIndex = 0
  }
  username = username || 'user-' + dashboard.Timestamp.now + '-' + Math.ceil(Math.random() * 100000)
  const password = username
  const req = createRequest('/api/user/create-account')
  const requireProfileWas = global.requireProfile
  const profileFieldsWere = global.userProfileFields
  global.requireProfile = true
  global.userProfileFields = ['full-name', 'contact-email']
  req.body = {
    username,
    password,
    'first-name': testData[testDataIndex].firstName,
    'last-name': testData[testDataIndex].lastName,
    'contact-email': testData[testDataIndex].email
  }
  testDataIndex++
  let account = await req.post()
  account.username = username
  account.password = password
  const req2 = createRequest(`/api/user/create-session?accountid=${account.accountid}`)
  req2.body = {
    username,
    password
  }
  let session = await req2.post()
  const req4 = createRequest(`/api/user/account?accountid=${account.accountid}`)
  req4.account = account
  req4.session = session
  account = await req4.get()
  const req3 = createRequest(`/api/user/profile?profileid=${account.profileid}`)
  req3.account = account
  req3.session = session
  const profile = await req3.get()
  const req5 = createRequest(`/api/user/session?sessionid=${session.sessionid}`)
  req5.account = account
  req5.session = session
  const token = session.token
  session = await req5.get()
  const user = { profile, account, session }
  user.session.token = token
  user.account.username = username
  user.account.password = password
  global.requireProfile = requireProfileWas
  global.userProfileFields = profileFieldsWere
  return user
}

async function createSession (user, remember) {
  const req = createRequest(`/api/user/create-session?accountid=${user.account.accountid}`)
  req.body = {
    username: user.account.username,
    password: user.account.password,
    remember: remember || ''
  }
  user.session = await req.post()
  return user.session
}

async function endSession (user) {
  const req = createRequest(`/api/user/end-session?sessionid=${user.session.sessionid}`)
  user.session = await req.patch()
  return user.session
}

async function setDeleted (user) {
  const req = createRequest(`/api/user/set-account-deleted?accountid=${user.account.accountid}`)
  req.account = user.account
  req.session = user.session
  req.body = {
    password: user.account.password
  }
  user.account = await req.patch()
  user.account.username = req.account.username
  user.account.password = req.account.password
  return user.account
}

async function createResetCode (user) {
  const code = 'resetCode-' + dashboard.Timestamp.now + '-' + Math.ceil(Math.random() * 100000)
  const req = createRequest(`/api/user/create-reset-code?accountid=${user.account.accountid}`)
  req.account = user.account
  req.session = user.session
  req.body = {
    'secret-code': code
  }
  user.resetCode = await req.post()
  user.resetCode.code = code
  return user.resetCode
}

async function deleteResetCode (user) {
  const req = createRequest(`/api/user/delete-reset-code?codeid=${user.resetCode.codeid}`)
  req.account = user.account
  req.session = user.session
  await req.delete()
}

async function createProfile (user, properties) {
  testDataIndex++
  if (testDataIndex >= testData.length) {
    testDataIndex = 0
  }
  const req = createRequest(`/api/user/create-profile?accountid=${user.account.accountid}`)
  req.account = user.account
  req.session = user.session
  req.body = properties
  testDataIndex++
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
    if (req.body.write) {
      postData = req.body
      requestOptions.headers = req.headers
    } else {
      postData = querystring.stringify(req.body)
      requestOptions.headers['content-length'] = postData.length
    }
  }
  if (req.session && req.session.expires) {
    const expires = dashboard.Timestamp.date(req.session.expires)
    requestOptions.headers.cookie = `sessionid=${req.session.sessionid}; token=${req.session.token}; expires=${expires.toUTCString()}; path=/`
  }
  let delayedCallback
  if (!process.env.STORAGE_ENGINE && global.delayDiskWrites) {
    // when testing with disk-storage a delay is
    // needed so lists return objects in the same
    // order they were written
    delayedCallback = (error, result) => {
      return setTimeout(() => {
        callback(error, result)
      }, 10)
    }
  } else {
    delayedCallback = callback
  }
  const protocol = baseURLParts[0] === 'https' ? https : http
  const proxyRequest = protocol.request(requestOptions, (proxyResponse) => {
    let body = ''
    proxyResponse.on('data', (chunk) => {
      body += chunk
    })
    return proxyResponse.on('end', () => {
      if (!body) {
        return delayedCallback()
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
        if (proxyResponse.headers['content-type'].startsWith('application/json')) {
          body = JSON.parse(body.toString())
          if (body.object === 'error') {
            return delayedCallback(new Error(body.message))
          }
          return delayedCallback(null, body)
        }
      }
      return delayedCallback(null, body)
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

async function fetchWithPuppeteer (method, req) {
  browser = browser || await cycleBrowserObject()
  let pages
  while (!pages) {
    try {
      pages = await browser.pages()
    } catch (error) {
    }
    if (pages) {
      break
    }
    await wait(1)
  }
  let page
  if (pages && pages.length) {
    page = pages[0]
  } else {
    while (true) {
      pages = await browser.pages()
      if (pages && pages.length) {
        page = pages[0]
      } else {
        try {
          page = await browser.newPage()
          page.on('error', () => { })
        } catch (error) {
        }
      }
      if (page) {
        break
      }
      await wait(1)
    }
  }
  while (true) {
    try {
      await page.emulate({
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
      })
      break
    } catch (error) {
      await wait(1)
      continue
    }
  }
  if (req.session) {
    await page.setCookie({
      value: req.session.sessionid,
      domain: process.env.DOMAIN,
      expires: Date.now() / 1000 + 10,
      name: 'sessionid'
    })
    await page.setCookie({
      value: req.session.token,
      domain: process.env.DOMAIN,
      expires: Date.now() / 1000 + 10,
      name: 'token'
    })
  }
  await page.goto(`${process.env.DASHBOARD_SERVER}${req.url}`, { waitLoad: true, waitNetworkIdle: true })
  await page.waitForSelector('body')
  if (method === 'POST') {
    await TestHelperPuppeteer.fill(page, req.body, req.uploads)
    await TestHelperPuppeteer.click(page, req.button || '#submit-button')
    if (req.clientside) {
      await wait(10000)
    } else {
      await page.waitForSelector('body')
    }
  }
  let html
  while (!html) {
    try {
      html = await page.evaluate(_ => document.body.parentNode.outerHTML)
    } catch (error) {
    }
    if (html) {
      break
    }
    await wait(1)
  }
  await page.close()
  return html
}
