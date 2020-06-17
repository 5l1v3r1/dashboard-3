const fs = require('fs')

module.exports = mergePackageJSON

function mergePackageJSON (applicationJSON, dashboardJSON) {
  const Log = require(`${__dirname}/log.js`)('dashboard')
  Log.info('setting up package JSON')
  applicationJSON = applicationJSON || loadApplicationJSON(applicationJSON)
  if (applicationJSON && applicationJSON.name === '@userdashboard/dashboard') {
    dashboardJSON = applicationJSON
    applicationJSON = null
  } else {
    dashboardJSON = dashboardJSON || loadDashboardJSON(dashboardJSON)
  }
  const packageJSON = {}
  packageJSON.version = dashboardJSON.version
  packageJSON.dashboard = {}
  packageJSON.dashboard.server = []
  packageJSON.dashboard.serverFilePaths = []
  packageJSON.dashboard.content = []
  packageJSON.dashboard.contentFilePaths = []
  packageJSON.dashboard.proxy = []
  packageJSON.dashboard.proxyFilePaths = []
  packageJSON.dashboard.modules = []
  packageJSON.dashboard.moduleNames = []
  packageJSON.dashboard.moduleVersions = []
  if (applicationJSON && applicationJSON.dashboard) {
    packageJSON.dashboard.title = applicationJSON.dashboard.title
  }
  packageJSON.dashboard.title = packageJSON.dashboard.title || 'Dashboard'
  for (const i in dashboardJSON.dashboard.server) {
    const relativePath = dashboardJSON.dashboard.server[i]
    const filePath = `${global.applicationPath}/${relativePath}`
    packageJSON.dashboard.server[i] = relativePath
    packageJSON.dashboard.serverFilePaths[i] = filePath
  }
  for (const i in dashboardJSON.dashboard.content) {
    const relativePath = dashboardJSON.dashboard.content[i]
    const filePath = `${global.applicationPath}/${relativePath}`
    packageJSON.dashboard.content[i] = relativePath
    packageJSON.dashboard.contentFilePaths[i] = filePath
  }
  for (const i in dashboardJSON.dashboard.proxy) {
    const relativePath = dashboardJSON.dashboard.proxy[i]
    const filePath = `${global.applicationPath}/${relativePath}`
    packageJSON.dashboard.proxy[i] = relativePath
    packageJSON.dashboard.proxyFilePaths[i] = filePath
  }
  for (const i in dashboardJSON.dashboard.modules) {
    packageJSON.dashboard.modules[i] = dashboardJSON.dashboard.modules[i]
  }
  Log.info('setting up application JSON')
  if (applicationJSON && applicationJSON.dashboard) {
    if (applicationJSON.dashboard.modules && applicationJSON.dashboard.modules.length) {
      packageJSON.dashboard.modules = [].concat(applicationJSON.dashboard.modules)
      for (const i in packageJSON.dashboard.modules) {
        const moduleName = packageJSON.dashboard.modules[i]
        if (moduleName === '@userdashboard/dashboard') {
          continue
        }
        if (moduleName === applicationJSON.name) {
          packageJSON.dashboard.modules.push(false)
          packageJSON.dashboard.moduleNames.push(moduleName)
          packageJSON.dashboard.moduleVersions.push(applicationJSON.version)
          continue
        }
        const moduleJSON = loadModuleJSON(moduleName)
        if (!moduleJSON) {
          throw new Error('invalid-module')
        }
        mergeModuleJSON(packageJSON, moduleJSON)
      }
    }
    if (applicationJSON.dashboard.server && applicationJSON.dashboard.server.length) {
      for (const i in applicationJSON.dashboard.server) {
        const relativePath = applicationJSON.dashboard.server[i]
        const filePath = `${global.applicationPath}${relativePath}`
        packageJSON.dashboard.server.push(relativePath)
        packageJSON.dashboard.serverFilePaths.push(filePath)
      }
    }
    if (applicationJSON.dashboard.content && applicationJSON.dashboard.content.length) {
      for (const i in applicationJSON.dashboard.content) {
        const relativePath = applicationJSON.dashboard.content[i]
        const filePath = `${global.applicationPath}${relativePath}`
        packageJSON.dashboard.content.push(relativePath)
        packageJSON.dashboard.contentFilePaths.push(filePath)
      }
    }
    if (applicationJSON.dashboard.proxy && applicationJSON.dashboard.proxy.length) {
      for (const i in applicationJSON.dashboard.proxy) {
        const relativePath = applicationJSON.dashboard.proxy[i]
        const filePath = `${global.applicationPath}${relativePath}`
        packageJSON.dashboard.proxy.push(relativePath)
        packageJSON.dashboard.proxyFilePaths.push(filePath)
      }
    }
  }
  Log.info('setting up modules')
  for (const i in packageJSON.dashboard.modules) {
    const moduleName = packageJSON.dashboard.modules[i]
    if (!moduleName) {
      continue
    }
    packageJSON.dashboard.moduleNames[i] = moduleName
    if (fs.existsSync(`${global.applicationPath}/node_modules/${moduleName}/package.json`)) {
      packageJSON.dashboard.modules[i] = require(moduleName)
      const modulePackageJSON = require(`${global.applicationPath}/node_modules/${moduleName}/package.json`)
      packageJSON.dashboard.moduleVersions[i] = modulePackageJSON.version
    }
  }
  for (const i in packageJSON.dashboard.serverFilePaths) {
    const filePath = packageJSON.dashboard.serverFilePaths[i]
    if (fs.existsSync(filePath)) {
      packageJSON.dashboard.server[i] = require(filePath)
    }
    const moduleName = trimModuleName(filePath)
    if (moduleName) {
      packageJSON.dashboard.serverFilePaths[i] = filePath
    }
  }
  for (const i in packageJSON.dashboard.contentFilePaths) {
    const filePath = packageJSON.dashboard.contentFilePaths[i]
    if (fs.existsSync(filePath)) {
      packageJSON.dashboard.content[i] = require(filePath)
    }
    const moduleName = trimModuleName(filePath)
    packageJSON.dashboard.contentFilePaths[i] = moduleName + trimPath(filePath)
  }
  for (const i in packageJSON.dashboard.proxyFilePaths) {
    const filePath = packageJSON.dashboard.proxyFilePaths[i]
    if (fs.existsSync(filePath)) {
      packageJSON.dashboard.proxy[i] = require(filePath)
    }
    const moduleName = trimModuleName(filePath)
    packageJSON.dashboard.proxyFilePaths[i] = moduleName + trimPath(filePath)
  }
  const firstJSON = (applicationJSON || packageJSON)
  const applicationJSONErrorHTMLPath = firstJSON.dashboard && firstJSON.dashboard['error.html'] ? `${global.applicationPath}${firstJSON.dashboard['error.html']}` : null
  const applicationJSONRedirectHTMLPath = firstJSON.dashboard && firstJSON.dashboard['redirect.html'] ? `${global.applicationPath}${firstJSON.dashboard['redirect.html']}` : null
  const applicationJSONTemplateHTMLPath = firstJSON.dashboard && firstJSON.dashboard['template.html'] ? `${global.applicationPath}${firstJSON.dashboard['template.html']}` : null
  const applicationErrorHTMLPath = `${global.applicationPath}/src/error.html`
  const applicationRedirectHTMLPath = `${global.applicationPath}/src/redirect.html`
  const applicationTemplateHTMLPath = `${global.applicationPath}/src/template.html`
  const dashboardErrorHTMLPath = `${global.applicationPath}/node_modules/@userdashboard/dashboard/src/error.html`
  const dashboardRedirectHTMLPath = `${global.applicationPath}/node_modules/@userdashboard/dashboard/src/redirect.html`
  const dashboardTemplateHTMLPath = `${global.applicationPath}/node_modules/@userdashboard/dashboard/src/template.html`
  if (applicationJSONErrorHTMLPath && fs.existsSync(applicationJSONErrorHTMLPath)) {
    packageJSON.errorHTMLPath = applicationJSONErrorHTMLPath
  } else {
    packageJSON.errorHTMLPath = fs.existsSync(applicationErrorHTMLPath) ? applicationErrorHTMLPath : dashboardErrorHTMLPath
  }
  if (applicationJSONRedirectHTMLPath && fs.existsSync(applicationJSONRedirectHTMLPath)) {
    packageJSON.redirectHTMLPath = applicationJSONRedirectHTMLPath
  } else {
    packageJSON.redirectHTMLPath = fs.existsSync(applicationRedirectHTMLPath) ? applicationRedirectHTMLPath : dashboardRedirectHTMLPath
  }
  if (applicationJSONTemplateHTMLPath && fs.existsSync(applicationJSONTemplateHTMLPath)) {
    packageJSON.templateHTMLPath = applicationJSONTemplateHTMLPath
  } else {
    packageJSON.templateHTMLPath = fs.existsSync(applicationTemplateHTMLPath) ? applicationTemplateHTMLPath : dashboardTemplateHTMLPath
  }
  Log.info('setting up HTML')
  packageJSON.errorHTML = fs.readFileSync(packageJSON.errorHTMLPath).toString()
  packageJSON.redirectHTML = fs.readFileSync(packageJSON.redirectHTMLPath).toString()
  packageJSON.templateHTML = fs.readFileSync(packageJSON.templateHTMLPath).toString()
  packageJSON.dashboard.menus = {
    account: [],
    administrator: []
  }
  Log.info('setting up menus')
  const rootAccountMenuHTMLPath = `${global.applicationPath}/src/menu-account.html`
  if (fs.existsSync(rootAccountMenuHTMLPath)) {
    packageJSON.dashboard.menus.account.push(fs.readFileSync(rootAccountMenuHTMLPath).toString())
  }
  const rootAdministratorMenuHTMLPath = `${global.applicationPath}/src/menu-administrator.html`
  if (fs.existsSync(rootAdministratorMenuHTMLPath)) {
    packageJSON.dashboard.menus.administrator.push(fs.readFileSync(rootAdministratorMenuHTMLPath).toString())
  }
  if (applicationJSON && applicationJSON.dashboard.modules && applicationJSON.dashboard.modules.length) {
    for (const module of applicationJSON.dashboard.modules) {
      const moduleAccountMenuHTMLPath = `${global.applicationPath}/node_modules/${module}/src/menu-account.html`
      if (fs.existsSync(moduleAccountMenuHTMLPath)) {
        packageJSON.dashboard.menus.account.push(fs.readFileSync(moduleAccountMenuHTMLPath).toString())
      }
      const moduleAdministratorMenuHTMLPath = `${global.applicationPath}/node_modules/${module}/src/menu-administrator.html`
      if (fs.existsSync(moduleAdministratorMenuHTMLPath)) {
        packageJSON.dashboard.menus.administrator.push(fs.readFileSync(moduleAdministratorMenuHTMLPath).toString())
      }
    }
  }
  for (const module of packageJSON.dashboard.modules) {
    const moduleAccountMenuHTMLPath = `${global.applicationPath}/node_modules/${module}/src/menu-account.html`
    if (fs.existsSync(moduleAccountMenuHTMLPath)) {
      packageJSON.dashboard.menus.account.push(fs.readFileSync(moduleAccountMenuHTMLPath).toString())
    }
    const moduleAdministratorMenuHTMLPath = `${global.applicationPath}/node_modules/${module}/src/menu-administrator.html`
    if (fs.existsSync(moduleAdministratorMenuHTMLPath)) {
      packageJSON.dashboard.menus.administrator.push(fs.readFileSync(moduleAdministratorMenuHTMLPath).toString())
    }
  }
  const dashboardAccountMenuHTMLPath = `${global.applicationPath}/node_modules/@userdashboard/dashboard/src/menu-account.html`
  if (fs.existsSync(dashboardAccountMenuHTMLPath)) {
    packageJSON.dashboard.menus.account.push(fs.readFileSync(dashboardAccountMenuHTMLPath).toString())
  }
  const dashboardAdministratorMenuHTMLPath = `${global.applicationPath}/node_modules/@userdashboard/dashboard/src/menu-administrator.html`
  if (fs.existsSync(dashboardAdministratorMenuHTMLPath)) {
    packageJSON.dashboard.menus.administrator.push(fs.readFileSync(dashboardAdministratorMenuHTMLPath).toString())
  }
  return packageJSON
}

function mergeModuleJSON (baseJSON, moduleJSON, nested) {
  if (moduleJSON.dashboard.server && moduleJSON.dashboard.server.length) {
    for (const i in moduleJSON.dashboard.server) {
      const relativePath = moduleJSON.dashboard.server[i]
      if (baseJSON.dashboard.server.indexOf(relativePath) > -1) {
        continue
      }
      let filePath
      if (relativePath.indexOf('node_modules/') > -1) {
        filePath = `${global.applicationPath}${relativePath}`
      } else {
        filePath = `${global.applicationPath}/node_modules/${moduleJSON.name}${relativePath}`
      }
      baseJSON.dashboard.server.push(relativePath)
      baseJSON.dashboard.serverFilePaths.push(filePath)
    }
  }
  if (moduleJSON.dashboard.content && moduleJSON.dashboard.content.length) {
    for (const i in moduleJSON.dashboard.content) {
      const relativePath = moduleJSON.dashboard.content[i]
      if (baseJSON.dashboard.content.indexOf(relativePath) > -1) {
        continue
      }
      const filePath = `${global.applicationPath}/node_modules/${moduleJSON.name}/${relativePath}`
      baseJSON.dashboard.content.push(relativePath)
      baseJSON.dashboard.contentFilePaths.push(filePath)
    }
  }
  if (moduleJSON.dashboard.proxy && moduleJSON.dashboard.proxy.length) {
    for (const i in moduleJSON.dashboard.proxy) {
      const relativePath = moduleJSON.dashboard.proxy[i]
      if (baseJSON.dashboard.proxy.indexOf(relativePath) > -1) {
        continue
      }
      const filePath = `${global.applicationPath}/node_modules/${moduleJSON.name}/${relativePath}`
      baseJSON.dashboard.proxy.push(relativePath)
      baseJSON.dashboard.proxyFilePaths.push(filePath)
    }
  }
  if (moduleJSON.dashboard.modules) {
    for (const i in moduleJSON.dashboard.modules) {
      const moduleName = moduleJSON.dashboard.modules[i]
      if (moduleName === '@userdashboard/dashboard') {
        continue
      }
      if (baseJSON.dashboard.modules.indexOf(moduleName) > -1) {
        continue
      }
      baseJSON.dashboard.modules.push(moduleName)
      const nestedModuleJSON = loadModuleJSON(moduleName)
      if (!nestedModuleJSON) {
        throw new Error('invalid-module')
      }
      mergeModuleJSON(baseJSON, nestedModuleJSON, true)
    }
  }
  return baseJSON
}

function loadApplicationJSON () {
  const filePath = `${global.applicationPath}/package.json`
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath))
  }
  return null
}

function loadDashboardJSON () {
  const filePath = `${global.applicationPath}/node_modules/@userdashboard/dashboard/package.json`
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath))
  }
  return null
}

function loadModuleJSON (moduleName) {
  if (global.testModuleJSON && global.testModuleJSON[moduleName]) {
    return global.testModuleJSON[moduleName]
  }
  const filePath = `${global.applicationPath}/node_modules/${moduleName}/package.json`
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath))
  }
  return null
}

function trimPath (str) {
  if (!str) {
    return ''
  }
  if (str.indexOf('/src/') === 0) {
    return str
  }
  return '/src/' + str.split('/src/')[1]
}

function trimModuleName (str) {
  if (str.indexOf('node_modules/') === -1) {
    return ''
  }
  const shortPath = str.split('node_modules/').pop()
  const slashIndex = shortPath.indexOf('/')
  if (shortPath.indexOf('@') !== 0) {
    return shortPath.substring(0, slashIndex)
  }
  const parts = shortPath.split('/')
  return parts[0] + '/' + parts[1]
}
