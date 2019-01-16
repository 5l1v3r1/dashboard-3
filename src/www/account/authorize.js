const dashboard = require('../../../index.js')

module.exports = {
  before: beforeRequest,
  get: renderPage,
  post: submitForm
}

async function beforeRequest (req) {
  if (!req.session.lock) {
    throw new Error('invalid-session')
  } 
}

async function renderPage (req, res, messageTemplate) {
  const doc = dashboard.HTML.parse(req.route.html)
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
  }
  return dashboard.Response.end(req, res, doc)
}

async function submitForm (req, res) {
  if (!req.body) {
    return renderPage(req, res)
  }
  if (req.body.cancel === 'cancel') {
    return dashboard.Response.redirect(req, res, '/signout')
  }
  if (!req.body.username || !req.body.username.length) {
    return renderPage(req, res, 'invalid-username')
  }
  if (!req.body.password || !req.body.password.length) {
    return renderPage(req, res, 'invalid-password')
  }
  if (global.minimumUsernameLength > req.body.username.length ||
    global.maximumUsernameLength < req.body.username.length) {
    return renderPage(req, res, 'invalid-username-length')
  }
  if (global.minimumPasswordLength > req.body.password.length ||
    global.maximumPasswordLength < req.body.password.length) {
    return renderPage(req, res, 'invalid-password-length')
  }
  try {
    req.query = req.query || {}
    req.query.sessionid = req.session.sessionid
    req.session = await global.api.user.SetSessionUnlocked._patch(req)
    return dashboard.Response.redirect(req, res, req.session.lockURL)
  } catch (error) {
    return renderPage(req, res, error.message)
  }
}
