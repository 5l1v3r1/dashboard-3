const dashboard = require('../../../index.js')

module.exports = {
  get: renderPage,
  post: submitForm
}

function renderPage (req, res, messageTemplate) {
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
  if (!req.body.code || !req.body.code.length) {
    return renderPage(req, res, 'invalid-reset-code')
  }
  if (global.minimumResetCodeLength > req.body.code.length) {
    return renderPage(req, res, 'invalid-reset-code-length')
  }
  if (!req.body.username || !req.body.username.length) {
    return renderPage(req, res, 'invalid-username')
  }
  if (global.minimumUsernameLength > req.body.username.length) {
    return renderPage(req, res, 'invalid-username-length')
  }
  if (!req.body.password || !req.body.password.length) {
    return renderPage(req, res, 'invalid-password')
  }
  if (global.minimumPasswordLength > req.body.password.length) {
    return renderPage(req, res, 'invalid-password-length')
  }
  if (req.body.password !== req.body.confirm) {
    return renderPage(req, res, 'invalid-confirm')
  }
  try {
    await global.api.user.ResetAccountPassword.patch(req)
  } catch (error) {
    return renderPage(req, res, error.message)
  }
  req.route = global.sitemap['/account/signin']
  return req.route.api.post(req)
}
