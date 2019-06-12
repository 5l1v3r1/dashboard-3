const dashboard = require('../../../index.js')

module.exports = {
  before: beforeRequest,
  get: renderPage,
  post: submitForm
}

async function beforeRequest (req) {
  if (req.session.lockURL === req.url && req.session.unlocked) {
    req.query = req.query || {}
    req.query.accountid = req.account.accountid
    try { 
      await global.api.user.CreateProfile._post(req)
    } catch (error) {
      req.error = error.message
    }
  }
}

function renderPage (req, res, messageTemplate) {
  if (req.success) {
    if (req.query && req.query.returnURL) {
      return dashboard.Response.redirect(req, res, req.query.returnURL)
    }
    messageTemplate = 'success'
  } else if (req.error) {
    messageTemplate = req.error
  }
  const doc = dashboard.HTML.parse(req.route.html)
  if (!messageTemplate && req.method === 'GET' && req.query && req.query.returnURL) {
    const submitForm = doc.getElementById('submit-form')
    const divider = submitForm.attr.action.indexOf('?') > -1 ? '&' : '?'
    submitForm.attr.action += `${divider}returnURL=${encodeURI(req.query.returnURL).split('?').join('%3E')}`
  }
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
  }
  return dashboard.Response.end(req, res, doc)
}

async function submitForm (req, res) {
  if (!req || !req.body) {
    return renderPage(req, res)
  }
  if (!req.body.email || !req.body.email.length || !req.body.email.indexOf('@') > 0) {
    return renderPage(req, res, 'invalid-profile-email')
  }
  if (!req.body['first-name'] || !req.body['first-name'].length) {
    return renderPage(req, res, 'invalid-profile-first-name')
  }
  if (global.minimumProfileFirstNameLength > req.body['first-name'].length ||
    global.maximumProfileFirstNameLength < req.body['first-name'].length) {
    return renderPage(req, res, 'invalid-profile-first-name-length')
  }
  if (!req.body['last-name'] || !req.body['last-name'].length) {
    return renderPage(req, res, 'invalid-profile-last-name')
  }
  if (global.minimumProfileLastNameLength > req.body['last-name'].length ||
    global.maximumProfileLastNameLength < req.body['last-name'].length) {
    return renderPage(req, res, 'invalid-profile-last-name-length')
  }
  try {
    req.query = req.query || {}
    req.query.accountid = req.account.accountid
    await global.api.user.CreateProfile._post(req)
    if (req.success) {
      return renderPage(req, res, 'success')
    }
    return dashboard.Response.redirect(req, res, `/account/authorize`)
  } catch (error) {
    return renderPage(req, res, error.message)
  }
}
