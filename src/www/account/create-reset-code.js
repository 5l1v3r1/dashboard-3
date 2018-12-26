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
      await global.api.user.CreateResetCode.post(req)
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
  if (messageTemplate === 'success') {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
    return dashboard.Response.end(req, res, doc)
  }
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
  }
  const codeField = doc.getElementById('code')
  if (req.body && req.body.code) {
    codeField.setAttribute('value', req.body.code)
  } else {
    codeField.setAttribute('value', dashboard.UUID.random(10))
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
  try {
    req.query = req.query || {}
    req.query.accountid = req.account.accountid
    await global.api.user.CreateResetCode.post(req)
    if (req.success) {
      return renderPage(req, res, 'success')
    }
    return dashboard.Response.redirect(req, res, '/account/authorize')
  } catch (error) {
    return renderPage(req, res, error.message)
  }
}
