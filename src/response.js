const crypto = require('crypto')
const HTML = require('./html.js')
const zlib = require('zlib')
const eightDays = 8 * 24 * 60 * 60 * 1000
const eTagCache = {}
const mimeTypes = {
  js: 'text/javascript',
  css: 'text/css',
  txt: 'text/plain',
  html: 'text/html',
  jpg: 'image/jpeg',
  png: 'image/png',
  ico: 'image/x-icon',
  svg: 'image/svg+xml'
}

module.exports = {
  end,
  redirect,
  redirectToSignIn,
  throw404,
  throw500,
  throw511,
  throwError,
  compress,
  wrapTemplateWithSrcDoc,
  eTag
}

async function end (req, res, doc, blob) {
  res.statusCode = res.statusCode || 200
  if (!doc && !blob) {
    return res.end('')
  }
  const mimeType = mimeTypes[req.extension === 'jpeg' ? 'jpg' : req.extension] || mimeTypes.html
  res.setHeader('content-type', mimeType)
  if (blob) {
    const tag = eTagCache[req.urlPath] = eTagCache[req.urlPath] || eTag(blob, req.urlPath)
    res.setHeader('expires', new Date(Date.now() + eightDays).toUTCString())
    res.setHeader('etag', tag)
    res.setHeader('vary', 'accept-encoding')
    if (mimeTypes[req.extension]) {
      res.setHeader('content-type', mimeTypes[req.extension])
    }
    if (req.extension === 'jpg' || req.extension === 'jpeg') {
      return res.end(blob, 'binary')
    } else {
      return compress(req, res, blob)
    }
  }
  if (doc.substring) {
    doc = HTML.parse(doc)
  }
  if (!req.route || req.route.template !== false) {
    const framedPage = await wrapTemplateWithSrcDoc(req, res, doc)
    return compress(req, res, framedPage)
  } else {
    return compress(req, res, doc.toString())
  }
}

function redirect (req, res, url) {
  if (!url || !url.length || !url.startsWith('/')) {
    throw new Error('invalid-url')
  }
  res.setHeader('content-type', mimeTypes.html)
  return res.end(global.packageJSON.redirectHTML.split('{url}').join(url))
}

function throw404 (req, res) {
  return throwError(req, res, 404, 'Unknown URL or page')
}

function throw500 (req, res, error) {
  return throwError(req, res, 500, error || 'An error ocurred')
}

function throw511 (req, res) {
  return throwError(req, res, 511, 'Sign in required')
}

async function throwError (req, res, code, error) {
  const doc = HTML.parse(global.packageJSON.errorHTML)
  const heading = doc.getElementById('error-title')
  heading.child = [{
    node: 'text',
    text: `Error ${code}, ${error}`
  }]
  heading.attr.code = code
  heading.attr.error = error.message
  res.statusCode = code || 500
  res.setHeader('content-type', mimeTypes.html)
  if (req.session) {
    const combinedPages = await wrapTemplateWithSrcDoc(req, res, doc)
    const templateDoc = HTML.parse(combinedPages)
    return compress(req, res, templateDoc.toString())
  }
  return compress(req, res, doc.toString())
}

function compress (req, res, data) {
  if (!req.headers) {
    return res.end(data)
  }
  const acceptEncoding = req.headers['accept-encoding'] || ''
  if (!acceptEncoding) {
    return res.end(data)
  }
  if (acceptEncoding.match(/\bdeflate\b/)) {
    return zlib.deflate(data, (error, result) => {
      if (error) {
        throw500(req, res)
      }
      res.setHeader('content-encoding', 'deflate')
      return res.end(result)
    })
  } else if (acceptEncoding.match(/\bgzip\b/)) {
    return zlib.gzip(data, (error, result) => {
      if (error) {
        throw500(req, res)
      }
      res.setHeader('content-encoding', 'gzip')
      return res.end(result)
    })
  }
  return res.end(data)
}

function eTag (buffer) {
  if (buffer.length === 0) {
    return '"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk"'
  }
  const hash = crypto.createHash('sha1').update(buffer, 'utf-8').digest('base64').replace(/=+$/, '')
  return '"' + buffer.length.toString(16) + '-' + hash + '"'
}

async function wrapTemplateWithSrcDoc (req, res, doc) {
  const templateDoc = HTML.parse(global.packageJSON.templateHTML)
  if (!templateDoc) {
    throw new Error()
  }
  // display the session unlocked header
  if (req.session && req.session.unlocked) {
    HTML.renderTemplate(templateDoc, req.session, 'session-unlocked', 'notifications-container')
  }
  // embed additional CSS, JS etc by placing the code within
  // your own HTML in a <template id="head" />
  const embedTemplate = doc.getElementById('head')
  if (embedTemplate && embedTemplate.child && embedTemplate.child.length) {
    const head = templateDoc.getElementsByTagName('head')[0]
    if (head) {
      head.child = head.child || []
      head.child = head.child.concat(embedTemplate.child)
    }
  }
  // navbar can be set by making <template id="navbar" />
  // in your own HTML and putting the links you desire in it.
  //
  // it may have to be parsed as HTML because it is stored as
  // text, that way it isn't preemptively parsed with broken
  // string ${} templates in the HTML waiting for
  // querystring variables in many cases
  const navbarTemplate = doc.getElementById('navbar')
  const navigation = templateDoc.getElementById('navigation')
  if (navbarTemplate && navbarTemplate.child && navbarTemplate.child.length) {
    if (navbarTemplate.child[0].node === 'text') {
      navigation.child = HTML.parse(`<div>` + navbarTemplate.child[0].text + `</div>`).child
    } else {
      navigation.child = navbarTemplate.child
    }
  } else {
    navigation.setAttribute('style', 'display: none')
  }
  // <title> is copied from the page to the template <title>
  const pageTitles = doc.getElementsByTagName('title')
  const templateTitles = templateDoc.getElementsByTagName('title')
  if (pageTitles && pageTitles.length && templateTitles && templateTitles.length) {
    templateTitles[0].child = pageTitles[0].child
  }
  // heading title link
  let newTitle = global.packageJSON.dashboard.title
  if (newTitle.indexOf(' ') > -1) {
    newTitle = newTitle.split(' ').join('&nbsp;')
  }
  const headingLink = {
    object: 'link',
    href: global.dashboardServer || '/',
    text: newTitle
  }
  HTML.renderTemplate(templateDoc, headingLink, 'heading-link', 'heading')
  // account menu for users
  if (!req.account) {
    const accountMenuContainer = templateDoc.getElementById('account-menu-container')
    accountMenuContainer.parentNode.removeChild(accountMenuContainer)
  } else {
    if (global.packageJSON.dashboard.menus.account && global.packageJSON.dashboard.menus.account.length) {
      HTML.renderList(templateDoc, global.packageJSON.dashboard.menus.account, 'menu-link', 'account-menu')
    } else {
      const accountMenuContainer = templateDoc.getElementById('account-menu-container')
      accountMenuContainer.parentNode.removeChild(accountMenuContainer)
    }
  }
  // administrator menu for owner and administrators
  if (!req.account.administrator || req.session.administratorid) {
    const administratorMenuContainer = templateDoc.getElementById('administrator-menu-container')
    administratorMenuContainer.setAttribute('style', 'display: none')
  } else {
    if (global.packageJSON.dashboard.menus.administrator && global.packageJSON.dashboard.menus.administrator.length) {
      HTML.renderList(templateDoc, global.packageJSON.dashboard.menus.administrator, 'menu-link', 'administrator-menu')
    } else {
      const administratorMenuContainer = templateDoc.getElementById('administrator-menu-container')
      administratorMenuContainer.setAttribute('style', 'display: none')
    }
  }
  // forms in the page content need to have an action mapped to
  // their URL and a method of POST
  const forms = doc.getElementsByTagName('form')
  for (const form of forms) {
    form.attr = form.attr || {}
    form.attr.method = form.attr.method || 'POST'
    form.attr.action = form.attr.action || req.url
  }
  // configured template and page content handlers can perform
  // modifications upon the completed docs
  if (global.packageJSON.dashboard.content.length) {
    for (const contentHandler of global.packageJSON.dashboard.content) {
      if (contentHandler.page) {
        await contentHandler.page(req, res, doc)
      }
      if (contentHandler.template) {
        await contentHandler.template(req, res, templateDoc)
      }
    }
  }
  highlightCurrentPage(req.urlPath, templateDoc)
  // page content is injected into the template using a srcdoc
  // so the user does not need an additional HTTP request, that means
  // it must be formatted for compatibility with srcdoc="..."
  const iframe = templateDoc.getElementById('application-iframe')
  iframe.attr.srcdoc = doc.toString().split("'").join('&#39;').split('"').join("'")
  return templateDoc.toString()
}

function highlightCurrentPage (urlPath, doc) {
  const groups = doc.getElementsByTagName('menu').concat(doc.getElementsByTagName('nav'))
  const pageURL = urlPath.split('/').pop()
  for (const group of groups) {
    const links = group.getElementsByTagName('a')
    for (const link of links) {
      if (!link.attr || !link.attr.href) {
        continue
      }
      const linkPath = link.attr.href.split('?')[0]
      if (linkPath === urlPath || linkPath === pageURL) {
        link.classList.add('current-page')
      }
    }
  }
}

function redirectToSignIn (req, res) {
  let returnURL = req.urlPath
  if (req.query) {
    const variables = []
    for (const field in req.query) {
      if (field !== 'returnURL') {
        const value = encodeURI(req.query[field])
        variables.push(`${field}=${value}`)
      }
    }
    if (variables.length) {
      returnURL = `${req.urlPath}%3F${variables.join('&')}`
    }
  }
  return redirect(req, res, `/account/signin?returnURL=${returnURL}`)
}
