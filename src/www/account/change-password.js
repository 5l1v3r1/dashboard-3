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
      await global.api.user.SetAccountPassword.patch(req)
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
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
  }
  return dashboard.Response.end(req, res, doc)
}

async function submitForm (req, res) {
  if (!req.body) {
    return renderPage(req, res, 'invalid-password')
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
  req.body = {
    password: req.body.password,
    passwordHash: 'random'
  }
  try {
    req.query = req.query || {}
    req.query.accountid = req.account.accountid
    await global.api.user.SetAccountPassword.patch(req)
    if (req.success) {
      return renderPage(req, res, 'success')
    }
    return dashboard.Response.redirect(req, res, `/account/authorize`)
  } catch (error) {        
    return renderPage(req, res, error.message)
  }
}
