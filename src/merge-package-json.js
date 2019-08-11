const fs = require('fs')

module.exports = mergePackageJSON

/**
 * mergePackageJSON combines the dashboard, module and project
 * account and administration menus in package.json files into
 * a single JSON object
 */
function mergePackageJSON (applicationJSON, dashboardJSON) {
  applicationJSON = applicationJSON || loadApplicationJSON(applicationJSON)
  if (applicationJSON && applicationJSON.name === '@userdashboard/dashboard') {
    dashboardJSON = applicationJSON
    applicationJSON = null
  } else {
    dashboardJSON = dashboardJSON || loadDashboardJSON(dashboardJSON)
  }
  // compose a single {} from each relevant file
  const packageJSON = {}
  packageJSON.version = dashboardJSON.version
  packageJSON.dashboard = {}
  packageJSON.dashboard.server = []
  packageJSON.dashboard.serverFilePaths = []
  packageJSON.dashboard.content = []
  packageJSON.dashboard.contentFilePaths = []
  packageJSON.dashboard.modules = []
  packageJSON.dashboard.moduleNames = []
  packageJSON.dashboard.menus = {
    account: [],
    administrator: []
  }
  // title comes from application or dashboard
  if (applicationJSON && applicationJSON.dashboard) {
    packageJSON.dashboard.title = applicationJSON.dashboard.title
  }
  packageJSON.dashboard.title = packageJSON.dashboard.title || 'Dashboard'
  // remap server and content handlers to the Dashboard as a module
  if (applicationJSON) {
    for (const i in dashboardJSON.dashboard.server) {
      const relativePath = dashboardJSON.dashboard.server[i]
      const filePath = `${global.applicationPath}/node_modules/@userdashboard/dashboard/${relativePath}`
      packageJSON.dashboard.server[i] = relativePath
      packageJSON.dashboard.serverFilePaths[i] = filePath
    }
    for (const i in dashboardJSON.dashboard.content) {
      const relativePath = dashboardJSON.dashboard.content[i]
      const filePath = `${global.applicationPath}/node_modules/@userdashboard/dashboard/${relativePath}`
      packageJSON.dashboard.content[i] = relativePath
      packageJSON.dashboard.contentFilePaths[i] = filePath
    }
  } else {
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
  }
  // apply any modules imported by the application
  if (applicationJSON && applicationJSON.dashboard) {
    if (applicationJSON.dashboard.modules && applicationJSON.dashboard.modules.length) {
      packageJSON.dashboard.modules = [].concat(applicationJSON.dashboard.modules)
      for (const i in packageJSON.dashboard.modules) {
        const moduleName = packageJSON.dashboard.modules[i]
        if (moduleName === '@userdashboard/dashboard') {
          continue
        }
        const moduleJSON = loadModuleJSON(moduleName)
        if (!moduleJSON) {
          throw new Error('invalid-module')
        }
        mergeModuleJSON(packageJSON, moduleJSON)
      }
    }
    // add the application server handlers to the end
    if (applicationJSON.dashboard.server && applicationJSON.dashboard.server.length) {
      for (const i in applicationJSON.dashboard.server) {
        const relativePath = applicationJSON.dashboard.server[i]
        const filePath = `${global.applicationPath}${relativePath}`
        packageJSON.dashboard.server.push(relativePath)
        packageJSON.dashboard.serverFilePaths.push(filePath)
      }
    }
    // add the application content handlers to the end
    if (applicationJSON.dashboard.content && applicationJSON.dashboard.content.length) {
      for (const i in applicationJSON.dashboard.content) {
        const relativePath = applicationJSON.dashboard.content[i]
        const filePath = `${global.applicationPath}${relativePath}`
        packageJSON.dashboard.content.push(relativePath)
        packageJSON.dashboard.contentFilePaths.push(filePath)
      }
    }
    // add the application menus to the start
    if (applicationJSON.dashboard.menus) {
      if (applicationJSON.dashboard.menus.administrator && applicationJSON.dashboard.menus.administrator.length) {
        packageJSON.dashboard.menus.administrator = applicationJSON.dashboard.menus.administrator.concat(packageJSON.dashboard.menus.administrator)
      }
      if (applicationJSON.dashboard.menus.account && applicationJSON.dashboard.menus.account.length) {
        packageJSON.dashboard.menus.account = applicationJSON.dashboard.menus.account.concat(packageJSON.dashboard.menus.account)
      }
    }
  }
  // add the dashboard menus to the end
  if (dashboardJSON.dashboard.menus) {
    if (dashboardJSON.dashboard.menus.administrator && dashboardJSON.dashboard.menus.administrator.length) {
      packageJSON.dashboard.menus.administrator = packageJSON.dashboard.menus.administrator.concat(dashboardJSON.dashboard.menus.administrator)
    }
    if (dashboardJSON.dashboard.menus.account && dashboardJSON.dashboard.menus.account.length) {
      packageJSON.dashboard.menus.account = packageJSON.dashboard.menus.account.concat(dashboardJSON.dashboard.menus.account)
    }
  }
  // load the complete module list
  for (const i in packageJSON.dashboard.modules) {
    const moduleName = packageJSON.dashboard.modules[i]
    packageJSON.dashboard.moduleNames[i] = moduleName
    if (fs.existsSync(`${global.applicationPath}/node_modules/${moduleName}/package.json`)) {
      packageJSON.dashboard.modules[i] = require(moduleName)
    }
  }
  // load the complete server handler list
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
  // load the complete content handler list
  for (const i in packageJSON.dashboard.contentFilePaths) {
    const filePath = packageJSON.dashboard.contentFilePaths[i]
    if (fs.existsSync(filePath)) {
      packageJSON.dashboard.content[i] = require(filePath)
    }
    const moduleName = trimModuleName(filePath)
    packageJSON.dashboard.contentFilePaths[i] = moduleName + trimPath(filePath)
  }
  // load the special HTML files
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
  packageJSON.errorHTML = fs.readFileSync(packageJSON.errorHTMLPath).toString('utf-8')
  packageJSON.redirectHTML = fs.readFileSync(packageJSON.redirectHTMLPath).toString('utf-8')
  packageJSON.templateHTML = fs.readFileSync(packageJSON.templateHTMLPath).toString('utf-8')
  return packageJSON
}

function mergeModuleJSON (baseJSON, moduleJSON, nested) {
  // prepend account and administrator menu links, when nested they go underneath the prior
  // when not nested they go at the top
  if (moduleJSON.dashboard.menus && moduleJSON.dashboard.menus.account.length) {
    if (nested) {
      baseJSON.dashboard.menus.account = baseJSON.dashboard.menus.account.concat(moduleJSON.dashboard.menus.account)
    } else {
      baseJSON.dashboard.menus.account = moduleJSON.dashboard.menus.account.concat(baseJSON.dashboard.menus.account)
    }
  }
  if (moduleJSON.dashboard.menus && moduleJSON.dashboard.menus.administrator.length) {
    if (nested) {
      baseJSON.dashboard.menus.administrator = baseJSON.dashboard.menus.administrator.concat(moduleJSON.dashboard.menus.administrator)
    } else {
      baseJSON.dashboard.menus.administrator = moduleJSON.dashboard.menus.administrator.concat(baseJSON.dashboard.menus.administrator)
    }
  }
  // remap server handlers
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
  // remap content handlers
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
  // add nested module dependencies
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
  return `/src/` + str.split('/src/')[1]
}

function trimModuleName (str) {
  if (str.indexOf('node_modules/') === -1) {
    return ''
  }
  let shortPath = str.split('node_modules/').pop()
  const slashIndex = shortPath.indexOf('/')
  if (shortPath.indexOf('@') !== 0) {
    return shortPath.substring(0, slashIndex)
  }
  const parts = shortPath.split('/')
  return parts[0] + '/' + parts[1]
}
