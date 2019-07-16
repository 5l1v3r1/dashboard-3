const dashboard = require('../../../index.js')

module.exports = {
  get: renderPage,
  post: submitForm
}

function renderPage(req, res, messageTemplate) {
  const doc = dashboard.HTML.parse(req.route.html)
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
  }
  if (req.body) {
    const usernameField = doc.getElementById('username')
    usernameField.setAttribute('value', req.body.username || '')
  }
  return dashboard.Response.end(req, res, doc)
}

async function submitForm(req, res) {
  if (!req || !req.body) {
    return renderPage(req, res, 'invalid-username')
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
  req.query = req.query || {}
  req.query.sessionid = req.session.sessionid
  try {
    await global.api.user.SetSessionVerified.patch(req)
    if (req.success) {
      return dashboard.Response.redirect(req, res, req.query.returnURL)
    }
    return renderPage(req, res, 'unknown-error')
  } catch (error) {
    return renderPage(req, res, error.message)
  }
}
