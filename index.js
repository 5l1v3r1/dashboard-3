const API = require('./src/api.js')
const fs = require('fs')
const mergePackageJSON = require('./src/merge-package-json.js')
const Server = require('./src/server.js')
const Sitemap = require('./src/sitemap.js')
const Timestamp = require('./src/timestamp.js')

// servers
global.host = process.env.IP || 'localhost'
global.port = parseInt(process.env.PORT || '8000', 10)

// sensitive configuration variables
global.applicationServer = process.env.APPLICATION_SERVER
global.applicationServerToken = process.env.APPLICATION_SERVER_TOKEN
if (global.applicationServer && !global.applicationServerToken) {
  throw new Error('Invalid APPLICATION_SERVER_TOKEN')
}

let defaultFixedSalt, defaultSessionKey
if (process.env.NODE_ENV !== 'production') {
  defaultFixedSalt = '$2a$10$uyrNLHlx/gxwbdSowtRP7u'
  defaultSessionKey = 'dashboard-session-key'
}

global.dashboardSessionKey = process.env.DASHBOARD_SESSION_KEY || defaultSessionKey
global.bcryptFixedSalt = process.env.BCRYPT_FIXED_SALT || defaultFixedSalt
if (!global.bcryptFixedSalt) {
  throw new Error('Invalid BCRYPT_FIXED_SALT')
}
if (!global.dashboardSessionKey) {
  throw new Error('Invalid DASHBOARD_SESSION_KEY')
}

if (process.env.ENCRYPTION_SECRET &&
  process.env.ENCRYPTION_SECRET.length !== 32) {
  throw new Error('Invalid ENCRYPTION_SECRET length (32)')
}
if (process.env.ENCRYPTION_SECRET &&
   (!process.env.ENCRYPTION_SECRET_IV ||
  process.env.ENCRYPTION_SECRET_IV.length !== 16)) {
  throw new Error('Invalid ENCRYPTION_SECRET_IV length (16)')
}

// profile fields
global.requireProfile = process.env.REQUIRE_PROFILE === 'true'
global.profileFields = ['display-name', 'display-email', 'contact-email', 'full-name', 'dob', 'phone', 'occupation', 'location', 'company-name', 'website']
if (!process.env.USER_PROFILE_FIELDS) {
  global.userProfileFields = [
    'contact-email',
    'full-name'
  ]
} else {
  global.userProfileFields = process.env.USER_PROFILE_FIELDS.split(',')
}

// optional configuration variables with safe defaults
global.appid = process.env.APPID || process.env.DOMAIN || 'dashboard'
global.allowPublicAPI = process.env.ALLOW_PUBLIC_API === 'true'
global.dashboardServer = process.env.DASHBOARD_SERVER
global.domain = process.env.DOMAIN || ''
global.idLength = parseInt(process.env.ID_LENGTH || '8', 10)
global.minimumUsernameLength = parseInt(process.env.MINIMUM_USERNAME_LENGTH || '1', 6)
global.maximumUsernameLength = parseInt(process.env.MAXIMUM_USERNAME_LENGTH || '50', 10)
global.minimumPasswordLength = parseInt(process.env.MINIMUM_PASSWORD_LENGTH || '1', 6)
global.maximumPasswordLength = parseInt(process.env.MAXIMUM_PASSWORD_LENGTH || '50', 10)
global.minimumResetCodeLength = parseInt(process.env.MINIMUM_RESET_CODE_LENGTH || '10', 6)
global.maximumResetCodeLength = parseInt(process.env.MAXIMUM_RESET_CODE_LENGTH || '50', 10)
global.minimumFirstNameLength = parseInt(process.env.MINIMUM_PROFILE_FIRST_NAME_LENGTH || '1', 10)
global.maximumFirstNameLength = parseInt(process.env.MAXIMUM_PROFILE_FIRST_NAME_LENGTH || '50', 10)
global.minimumLastNameLength = parseInt(process.env.MINIMUM_PROFILE_LAST_NAME_LENGTH || '1', 10)
global.maximumLastNameLength = parseInt(process.env.MAXIMUM_PROFILE_LAST_NAME_LENGTH || '50', 10)
global.minimumDisplayNameLength = parseInt(process.env.MINIMUM_PROFILE_DISPLAY_NAME_LENGTH || '1', 1)
global.maximumDisplayNameLength = parseInt(process.env.MAXIMUM_PROFILE_DISPLAY_NAME_LENGTH || '50', 10)
global.deleteDelay = parseInt(process.env.DELETE_DELAY || '7', 10)
global.pageSize = parseInt(process.env.PAGE_SIZE || '10', 10)

module.exports = {
  Format: require('./src/format.js'),
  Hash: require('./src/hash.js'),
  HTML: require('./src/html.js'),
  Response: require('./src/response.js'),
  Timestamp: require('./src/timestamp.js'),
  UUID: require('./src/uuid.js'),
  start: (applicationPath) => {
    module.exports.setup(applicationPath)
    module.exports.Storage = require('./src/storage.js')
    module.exports.StorageList = require('./src/storage-list.js')
    module.exports.StorageObject = require('./src/storage-object.js')
    if (!process.env.SILENT_START) {
      const configuration = outputConfiguration()
      console.log(configuration)
    }
    return Server.start()
  },
  stop: () => {
    clearInterval(Timestamp.interval)
    delete (Timestamp.interval)
    return Server.stop()
  },
  setup: (applicationPath) => {
    global.applicationPath = applicationPath
    global.rootPath = `${applicationPath}/src/www`
    // the package.json is combined from your application and any
    // modules to define the account and administrator menus and
    // server before/after authentication handlers
    global.packageJSON = mergePackageJSON()
    // the sitemap is a url index of all pages and API endpoints
    // from the combined dashboard, modules you specify and your
    // own application
    global.sitemap = Sitemap.generate()
    // the api is an object structured from sitemap API endpoints
    // global.api.user.UpdateUsername -> global.sitemap['/api/user/update-username']
    global.api = API.generate()
  }
}

function outputConfiguration () {
  let widestURL = 0
  let widestHTML = 0
  let widestJS = 0
  let widestAuth = 0
  let widestTemplate = 0
  let widestVerbs = 0
  const siteMap = global.sitemap
  const httpVerbs = [ 'DELETE', 'HEAD', 'GET', 'OPTIONS', 'PATCH', 'POST', 'PUT' ]
  for (const url in siteMap) {
    if (url.length > widestURL) {
      widestURL = url.length
    }
    const route = siteMap[url]
    if (route.htmlFilePath && trimNodeModulePath(route.htmlFilePath).length + 4 > widestHTML) {
      widestHTML = trimNodeModulePath(route.htmlFilePath).length + 4
    }
    if (route.jsFilePath && trimNodeModulePath(route.jsFilePath).length + 4 > widestJS) {
      widestJS = trimNodeModulePath(route.jsFilePath).length + 4
    }
    route.templateDescription = route.template === false ? 'FULLSCREEN' : ''
    route.verbs = ''
    if (url.startsWith('/api/')) {
      route.authDescription = route.api.auth === false ? 'GUEST' : ''
      const verbs = []
      for (const verb of httpVerbs) {
        if (route.api[verb.toLowerCase()]) {
          verbs.push(verb)
        }
      }
      route.verbs = verbs.join(' ')
      if (route.verbs.length > widestVerbs) {
        widestVerbs = route.verbs.length
      }
    } else {
      route.authDescription = route.auth === false ? 'GUEST' : ''
      const verbs = []
      if (route.jsFilePath === 'static-page') {
        verbs.push('GET')
      } else {
        const pageFile = route.api
        for (const verb of httpVerbs) {
          if (pageFile[verb.toLowerCase()]) {
            verbs.push(verb)
          }
        }
      }
      route.verbs = verbs.join(' ')
      if (route.verbs.length + 4 > widestVerbs) {
        widestVerbs = route.verbs.length + 4
      }
      if (route.templateDescription.length + 4 > widestTemplate) {
        widestTemplate = route.templateDescription.length + 4
      }
      if (route.authDescription.length + 4 > widestAuth) {
        widestAuth = route.authDescription.length + 4
      }
    }
  }
  if ('URL  '.length > widestURL) {
    widestURL = 'URL  '.length
  }
  if ('AUTH  '.length > widestAuth) {
    widestAuth = 'AUTH  '.length
  }
  if ('TEMPLATE    '.length > widestTemplate) {
    widestTemplate = 'TEMPLATE  '.length
  }
  if ('HTTP REQUESTS  '.length > widestVerbs) {
    widestVerbs = 'HTTP REQUESTS  '.length
  }
  if ('NODEJS  '.length > widestJS) {
    widestJS = 'NODEJS  '.length
  }
  if ('HTML  '.length > widestHTML) {
    widestHTML = 'HTML  '.length
  }
  let url = global.dashboardServer
  if (global.applicationServer) {
    url += ' (dashboard)\n'
    url += global.applicationServer + ' (application)'
  }
  const output = [
    `@userdashboard/dashboard ` + global.packageJSON.version,
    url
  ]
  output.push('\nAdministrator menu:')
  for (const item of global.packageJSON.dashboard.menus.administrator) {
    if (item.module) {
      output.push(item.module + '/src/www' + item.href + ' "' + item.text.replace('&amp;', '&') + '"')
    } else {
      output.push(item.href + ' "' + item.text.replace('&amp;', '&') + '"')
    }
  }
  output.push('\nAccount menu:')
  for (const item of global.packageJSON.dashboard.menus.account) {
    if (item.module) {
      output.push(item.module + '/src/www' + item.href + ' "' + item.text.replace('&amp;', '&') + '"')
    } else {
      output.push(item.href + ' "' + item.text.replace('&amp;', '&') + '"')
    }
  }
  output.push('\nSpecial HTML files:',
    trimApplicationPath(global.packageJSON.templateHTMLPath),
    trimApplicationPath(global.packageJSON.errorHTMLPath),
    trimApplicationPath(global.packageJSON.redirectHTMLPath))

  if (global.packageJSON.dashboard.moduleNames.length) {
    output.push('\nDashboard modules:')
    const formatted = []
    for (const i in global.packageJSON.dashboard.moduleNames) {
      const name = global.packageJSON.dashboard.moduleNames[i]
      const version = global.packageJSON.dashboard.moduleVersions[i]
      formatted.push(`${name} (${version})`)
    }
    output.push(formatted.join('\n'))
  }
  if (global.packageJSON.dashboard.contentFilePaths.length) {
    output.push('\nContent handlers:')
    for (const item of global.packageJSON.dashboard.contentFilePaths) {
      output.push(item[0] === '@' ? item : trimApplicationPath(item))
    }
  }
  if (global.packageJSON.dashboard.serverFilePaths.length) {
    output.push('\nServer handlers:')
    for (const item of global.packageJSON.dashboard.serverFilePaths) {
      output.push(item[0] === '@' ? item : trimApplicationPath(item))
    }
  }
  const sortedURLs = []
  for (const url in siteMap) {
    sortedURLs.push(url)
  }
  sortedURLs.sort()
  for (const url of sortedURLs) {
    const route = siteMap[url]
    const routeURL = padRight(url, widestURL)
    const routeHTML = padRight(route.htmlFilePath ? trimNodeModulePath(route.htmlFilePath) : '', widestHTML)
    const routeJS = padRight(trimNodeModulePath(route.jsFilePath), widestJS)
    const routeVerbs = padRight(route.verbs, widestVerbs)
    const routeAuth = padRight(route.authDescription, widestAuth)
    const routeTemplate = padRight(route.templateDescription, widestTemplate)
    output.push(`${routeURL} ${routeAuth} ${routeTemplate} ${routeVerbs} ${routeJS} ${routeHTML}`)
  }
  const routeURL = underlineRight('URL ', widestURL)
  const routeAuth = underlineRight('AUTH ', widestAuth)
  const routeTemplate = underlineRight('TEMPLATE ', widestTemplate)
  const routeVerbs = underlineRight('HTTP REQUESTS ', widestVerbs)
  const routeJS = underlineRight('NODEJS ', widestJS)
  const routeHTML = underlineRight('HTML ', widestHTML)
  output.splice(output.length - sortedURLs.length, 0, `\n${routeURL} ${routeAuth} ${routeTemplate} ${routeVerbs} ${routeJS} ${routeHTML}`)
  fs.writeFileSync('./sitemap.txt', output.join('\n'))
  return output.join('\n')
}

function trimApplicationPath (str) {
  if (!str) {
    return 'static-page'
  }
  if (str.startsWith('/src/www/')) {
    return '/src/www'
  }
  if (!str.startsWith(global.applicationPath)) {
    return str
  }
  const trimmed = str.substring(global.applicationPath.length)
  if (trimmed.startsWith('/node_modules/')) {
    return trimNodeModulePath(trimmed)
  }
  return trimmed
}

function trimNodeModulePath (str) {
  if (!str) {
    return 'static-page'
  }
  if (str.indexOf('/src/www/') === 0) {
    return '/src/www'
  }
  return str.substring('/node_modules/'.length).split('/src/www')[0]
}

function padRight (str, totalSize) {
  let blank = ''
  while (blank.length < totalSize) {
    blank += ' '
  }
  return (str + blank).substring(0, totalSize)
}

function underlineRight (str, totalSize) {
  let blank = ''
  while (blank.length < totalSize) {
    blank += '-'
  }
  return (str + blank).substring(0, totalSize)
}
