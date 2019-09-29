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
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
  }
  return dashboard.Response.end(req, res, doc)
}

async function submitForm (req, res) {
  if (!req.body) {
    return renderPage(req, res)
  }
  req.body['new-password'] = req.body['new-password'] && req.body['new-password'].trim ? req.body['new-password'].trim() : req.body['new-password']
  if (!req.body['new-password'] || !req.body['new-password'].length) {
    return renderPage(req, res, 'invalid-new-password')
  }
  if (global.minimumPasswordLength > req.body['new-password'].length) {
    return renderPage(req, res, 'invalid-new-password-length')
  }
  if (req.body['new-password'] !== req.body['confirm-password']) {
    return renderPage(req, res, 'invalid-confirm-password')
  }
  if (!req.body.password || !req.body.password.length) {
    return renderPage(req, res, 'invalid-password')
  }
  try {
    req.query = req.query || {}
    req.query.accountid = req.account.accountid
    await global.api.user.SetAccountPassword.patch(req)
    if (req.success) {
      return renderPage(req, res, 'success')
    }
    return renderPage(req, res, 'unknown-error')
  } catch (error) {
    return renderPage(req, res, error.message)
  }
}
