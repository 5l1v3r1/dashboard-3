const dashboard = require('../../../index.js')

module.exports = {
  get: renderPage,
  post: submitForm
}

function renderPage (req, res, messageTemplate) {
  if (req.success) {
    if (req.query && req.query.returnURL && req.query.returnURL.indexOf('/') === 0) {
      return dashboard.Response.redirect(req, res, decodeURI(req.query.returnURL))
    }
    messageTemplate = 'success'
  } else if (req.error) {
    messageTemplate = req.error
  }
  const doc = dashboard.HTML.parse(req.route.html)
  if (!messageTemplate && req.method === 'GET' && req.query && req.query.returnURL) {
    const submitForm = doc.getElementById('submit-form')
    const divider = submitForm.attr.action.indexOf('?') > -1 ? '&' : '?'
    submitForm.attr.action += `${divider}returnURL=${encodeURI(req.query.returnURL).split('?').join('%3F')}`
  }
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
    return renderPage(req, res, 'unknown-error')
  } catch (error) {
    return renderPage(req, res, error.message)
  }
}
