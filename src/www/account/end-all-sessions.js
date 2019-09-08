const dashboard = require('../../../index.js')

module.exports = {
  get: renderPage,
  post: submitForm
}

function renderPage (req, res, messageTemplate) {
  if (req.success) {
    req.url = req.urlPath = '/home'
    req.query = {}
    return dashboard.Response.redirectToSignIn(req, res)
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
  try {
    req.query = req.query || {}
    req.query.accountid = req.account.accountid
    await global.api.user.ResetSessionKey.patch(req)
    if (req.success) {
      req.query = {}
      req.url = req.urlPath = '/home'
      return dashboard.Response.redirectToSignIn(req, res)
    }
    return renderPage(req, res, 'unknown-error')
  } catch (error) {
    return renderPage(req, res, error.message)
  }
}
