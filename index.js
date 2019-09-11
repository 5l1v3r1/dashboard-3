const API = require('./src/api.js')
const fs = require('fs')
const mergePackageJSON = require('./src/merge-package-json.js')
const Server = require('./src/server.js')
const Sitemap = require('./src/sitemap.js')
const Timestamp = require('./src/timestamp.js')

let defaultFixedSalt, defaultSessionKey
if (process.env.NODE_ENV !== 'production') {
  defaultFixedSalt = '$2a$10$uyrNLHlx/gxwbdSowtRP7u'
  defaultSessionKey = 'dashboard-session-key'
}

global.host = process.env.IP || 'localhost'
global.port = parseInt(process.env.PORT || '8000', 10)
global.applicationServer = process.env.APPLICATION_SERVER
global.applicationServerToken = process.env.APPLICATION_SERVER_TOKEN
if (global.applicationServer && !global.applicationServerToken) {
  throw new Error('Invalid APPLICATION_SERVER_TOKEN')
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
global.requireProfile = process.env.REQUIRE_PROFILE === 'true'
global.profileFields = ['display-name', 'display-email', 'contact-email', 'full-name', 'dob', 'phone', 'occupation', 'location', 'company-name', 'website']
global.profileFieldMap = {}
for (const field of global.profileFields) {
  if (field === 'full-name') {
    global.profileFieldMap['first-name'] = 'firstName'
    global.profileFieldMap['last-name'] = 'lastName'
    continue
  }
  let displayName = field
  if (displayName.indexOf('-') > -1) {
    displayName = displayName.split('-')
    if (displayName.length === 1) {
      displayName = displayName[0]
    } else if (displayName.length === 2) {
      displayName = displayName[0] + displayName[1].substring(0, 1).toUpperCase() + displayName[1].substring(1)
    } else if (displayName.length === 3) {
      displayName = displayName[0] + displayName[1].substring(0, 1).toUpperCase() + displayName[1].substring(1) + displayName[2].substring(0, 1).toUpperCase() + displayName[2].substring(1)
    }
  }
  global.profileFieldMap[field] = displayName
}

if (!process.env.USER_PROFILE_FIELDS) {
  global.userProfileFields = [
    'contact-email',
    'full-name'
  ]
} else {
  global.userProfileFields = process.env.USER_PROFILE_FIELDS.split(',')
}
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
global.minimumProfileFirstNameLength = parseInt(process.env.MINIMUM_PROFILE_FIRST_NAME_LENGTH || '1', 10)
global.maximumProfileFirstNameLength = parseInt(process.env.MAXIMUM_PROFILE_FIRST_NAME_LENGTH || '50', 10)
global.minimumProfileLastNameLength = parseInt(process.env.MINIMUM_PROFILE_LAST_NAME_LENGTH || '1', 10)
global.maximumProfileLastNameLength = parseInt(process.env.MAXIMUM_PROFILE_LAST_NAME_LENGTH || '50', 10)
global.minimumProfileDisplayNameLength = parseInt(process.env.MINIMUM_PROFILE_DISPLAY_NAME_LENGTH || '1', 1)
global.maximumProfileDisplayNameLength = parseInt(process.env.MAXIMUM_PROFILE_DISPLAY_NAME_LENGTH || '50', 10)
global.minimumProfileCompanyNameLength = parseInt(process.env.MINIMUM_PROFILE_COMPANY_NAME_LENGTH || '1', 1)
global.maximumProfileCompanyNameLength = parseInt(process.env.MAXIMUM_PROFILE_COMPANY_NAME_LENGTH || '50', 10)
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
      const configuration = parseDashboardConfiguration()
      writeSitemap(configuration)
    }
    if (process.env.NODE_ENV === 'sitemap') {
      const apiStructure = parseAPIConfiguration()
      writeAPI(apiStructure)
    }
    if (process.env.NODE_ENV === 'sitemap') {
      return process.exit(0)
    }
    Server.start()
  },
  stop: () => {
    clearInterval(Timestamp.interval)
    delete (Timestamp.interval)
    return Server.stop()
  },
  setup: (applicationPath) => {
    global.applicationPath = applicationPath
    global.rootPath = `${applicationPath}/src/www`
    global.packageJSON = mergePackageJSON()
    global.sitemap = Sitemap.generate()
    global.api = API.generate()
  }
}

function parseAPIConfiguration () {
  let tests = fs.readFileSync('./tests.txt').toString()
  tests = tests.substring(tests.indexOf('/api/'))
  while (true) {
    const lastTick = tests.lastIndexOf('✓')
    const lastLineBreak = tests.lastIndexOf('\n')
    if (lastLineBreak > lastTick) {
      tests = tests.substring(0, lastLineBreak)
    } else {
      break
    }
  }
  tests = tests.split('\n\n')
  const api = {}
  const categories = ['exceptions', 'receives', 'configuration', 'returns', 'redacts', 'override']
  const verbs = ['get', 'post', 'patch', 'pull', 'delete', 'options', 'head']
  for (const test of tests) {
    const item = {
      url: '',
      verb: '',
      auth: '',
      receives: [],
      exceptions: {},
      redacts: [],
      returns: [],
      configuration: [],
      override: []
    }
    const lines = test.split('\n')
    const done = []
    let exception
    for (let line of lines) {
      line = line.trim()
      if (!line) {
        continue
      }
      if (!done.length) {
        item.url = line
        if (!global.sitemap[line]) {
          throw new Error('invalid something ' + line)
        }
        item.auth = global.sitemap[item.url].auth === false ? false : true
        for (const verb of verbs) {
          if (global.sitemap[line].api[verb]) {
            item.verb = verb
            break
          }
        }
        done.push('url')
        continue
      }
      const type = done[done.length - 1]
      if (!line.startsWith('✓')) {
        if (categories.indexOf(line) > -1) {
          done.push(line)
          continue
        } 
        exception = line
        continue
      } else {
        line = line.substring(2)
      }
      if (type === 'exceptions') {
        item.exceptions[exception] = item.exceptions[exception] || []
        item.exceptions[exception].push(line)
        continue
      }
      item[type].push(line)
    }    
    api[item.url] = item
  }
  return api
}

function writeAPI(configuration) {
  const sortedURLs = []
  for (const url in configuration) {
    sortedURLs.push(url)
  }
  sortedURLs.sort()
  let url = global.dashboardServer
  if (global.applicationServer) {
    url += ' (dashboard)\n'
    url += global.applicationServer + ' (application)'
  }
  const output = [
    `@userdashboard/dashboard ` + global.packageJSON.version,
    '\n',
    url,
    '\n'
  ]
  const groups = ['receives', 'returns', 'redacts', 'exceptions', 'configuration', 'override']
  for (const url of sortedURLs) {
    const columns = {}
    const route = configuration[url]
    if (route.exceptions) {
      const exceptions = []
      for (const key in route.exceptions) {
        exceptions.push(key)
        for (const i in route.exceptions[key]) {
          const reason = route.exceptions[key][i]
          exceptions.push(` * ${reason}`)
          if (reason.startsWith('missing')) {
            const receives = reason.replace('missing', 'required')
            const optional = reason.replace('missing', 'optional')
            if (route.receives.indexOf(optional) === -1) {
              route.receives.unshift(receives)
            }
          }
        }
      }
      route.exceptions = exceptions
    }
    for (category of groups) {
      if (!route[category] || !route[category].length) {
        continue
      }
      columns[category] = category.length + 4
      for (const entry of route[category]) {
        if (entry.length + 4 > columns[category]) {
          columns[category] = entry.length + 4
        }
      }
    }
    const groupData = {}
    let totalWidth = 0
    for (const key of groups) {
      if (!route[key] || !route[key].length) {
        continue
      }
      groupData[key] = route[key]
      totalWidth += columns[key]
    }
    if (url.length > totalWidth) {
      for (const key of groups) {
        if (!columns[key]) {
          continue
        }
        columns[key] = totalWidth = url.length + 4
        break
      }
    }
    let largestGroup = 0
    for (const key in groupData) {
      if (groupData[key].length > largestGroup) {
        largestGroup = groupData[key].length
      }
    }
    let precursor = ''
    while (precursor.length < totalWidth) {
      precursor += '-'
    }
    let after = url
    while (after.length < totalWidth - 2) {
      after += ' '
    }
    output.push('\n' + precursor + '|\n| ' + after + '|\n')
    for (const key in groupData) {
      let segment = '|'
      while (segment.length < columns[key]) {
        segment += '-'
      }
      output.push(segment)
    }
    output.push('|\n')
    for (const key in groupData) {
      let title = '| ' + key.toUpperCase()
      while (title.length < columns[key]) {
        title += ' '
      }
      output.push(title)
    }
    output.push('|\n')
    for (let i = 0, len = largestGroup; i < len; i++) {
      const line = []
      for (const key in groupData) {
        const groupData = route[key]
        if (!groupData || !groupData.length || groupData.length < i || !groupData[i]) {
          let segment = '|'
          while (segment.length < columns[key]) {
            segment += ' '
          }
          line.push(segment)
          continue
        }
        let title = '| ' + groupData[i]
        while (title.length < columns[key]) {
          title += ' '
        }
        line.push(title)
      }
      output.push(line.join('') + '|\n')
    }
    for (const key in groupData) {
      let segment = '|'
      while (segment.length < columns[key]) {
        segment += '-'
      }
      output.push(segment)
    }
    output.push('|\n')
  } 
  fs.writeFileSync('./api.txt', output.join(''))
}


function writeSitemap (configuration) {
  let widestURL = 0
  let widestHTML = 0
  let widestJS = 0
  let widestAuth = 0
  let widestTemplate = 0
  let widestVerbs = 0
  const sortedURLs = []
  for (const url in configuration.urls) {
    sortedURLs.push(url)
    if (url.length > widestURL) {
      widestURL = url.length
    }
    const route = configuration.urls[url]
    if (route.htmlFilePath && trimNodeModulePath(route.htmlFilePath).length + 4 > widestHTML) {
      widestHTML = trimNodeModulePath(route.htmlFilePath).length + 4
    }
    if (route.jsFilePath && trimNodeModulePath(route.jsFilePath).length + 4 > widestJS) {
      widestJS = trimNodeModulePath(route.jsFilePath).length + 4
    }
  }
  sortedURLs.sort()
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
  for (const item of configuration.administrator) {
    output.push(item)
  }
  output.push('\nAccount menu:')
  for (const item of configuration.account) {
    output.push(item)
  }
  output.push('\nSpecial HTML files:',
    trimApplicationPath(configuration.templateHTMLPath),
    trimApplicationPath(configuration.errorHTMLPath),
    trimApplicationPath(configuration.redirectHTMLPath))

  if (configuration.modules.length) {
    output.push('\nDashboard modules:')
    const formatted = []
    for (const item of configuration.modules) {
      formatted.push(`${item.name} (${item.version})`)
    }
    output.push(formatted.join('\n'))
  }
  if (configuration.content.length) {
    output.push('\nContent handlers:')
    for (const item of configuration.content) {
      output.push(item)
    }
  }
  if (configuration.server.length) {
    output.push('\nServer handlers:')
    for (const item of configuration.server) {
      output.push(item)
    }
  }
  for (const url of sortedURLs) {
    const route = configuration.urls[url]
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

function parseDashboardConfiguration() {
  const configuration = {
    administrator: [],
    account: [],
    modules: [],
    content: [],
    server: [],
    urls: {},
    templateHTMLPath: trimApplicationPath(global.packageJSON.templateHTMLPath),
    errorHTMLPath: trimApplicationPath(global.packageJSON.errorHTMLPath),
    redirectHTMLPath: trimApplicationPath(global.packageJSON.redirectHTMLPath)
  }
  for (const item of global.packageJSON.dashboard.menus.administrator) {
    if (item.module) {
      configuration.administrator.push(item.module + '/src/www' + item.href + ' "' + item.text.replace('&amp;', '&') + '"')
    } else {
      configuration.administrator.push(item.href + ' "' + item.text.replace('&amp;', '&') + '"')
    }
  }
  for (const item of global.packageJSON.dashboard.menus.account) {
    if (item.module) {
      configuration.account.push(item.module + '/src/www' + item.href + ' "' + item.text.replace('&amp;', '&') + '"')
    } else {
      configuration.account.push(item.href + ' "' + item.text.replace('&amp;', '&') + '"')
    }
  }
  if (global.packageJSON.dashboard.moduleNames.length) {
    for (const i in global.packageJSON.dashboard.moduleNames) {
      const name = global.packageJSON.dashboard.moduleNames[i]
      const version = global.packageJSON.dashboard.moduleVersions[i]
      configuration.modules.push({ name, version })
    }
  }
  if (global.packageJSON.dashboard.contentFilePaths.length) {
    for (const item of global.packageJSON.dashboard.contentFilePaths) {
      configuration.content.push(item[0] === '@' ? item : trimApplicationPath(item))
    }
  }
  if (global.packageJSON.dashboard.serverFilePaths.length) {
    for (const item of global.packageJSON.dashboard.serverFilePaths) {
      configuration.server.push(item[0] === '@' ? item : trimApplicationPath(item))
    }
  }
  const httpVerbs = ['DELETE', 'HEAD', 'GET', 'OPTIONS', 'PATCH', 'POST', 'PUT']
  for (const url in global.sitemap) {
    const route = global.sitemap[url]
    const item = configuration.urls[url] = {}
    item.htmlFilePath = route.htmlFilePath
    item.jsFilePath = route.jsFilePath
    item.templateDescription = route.template === false ? 'FULLSCREEN' : ''
    item.verbs = ''
    if (url.startsWith('/api/')) {
      item.authDescription = route.api.auth === false ? 'GUEST' : ''
      const verbs = []
      for (const verb of httpVerbs) {
        if (route.api[verb.toLowerCase()]) {
          verbs.push(verb)
        }
      }
      item.verbs = verbs.join(' ')
    } else {
      item.authDescription = route.auth === false ? 'GUEST' : ''
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
      item.verbs = verbs.join(' ')
    }
  }
  return configuration
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
