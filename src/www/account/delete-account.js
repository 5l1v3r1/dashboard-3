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
      await global.api.user.SetAccountDeleted.patch(req)
    } catch (error) {
      req.error = error.message
    }
  }
}

async function renderPage (req, res, messageTemplate) {
  if (req.success) {
    if (req.query && req.query.returnURL) {
      return dashboard.Response.redirect(req, res, req.query.returnURL)
    }
    return dashboard.Response.redirect(req, res, '/account/delete-account-complete')
  } else if (req.error) {
    messageTemplate = req.error
  }
  const doc = dashboard.HTML.parse(req.route.html)
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
  }
  if (global.deleteDelay) {
    const data = {
      numDays: global.deleteDelay || 7
    }
    dashboard.HTML.renderTemplate(doc, data, 'scheduled-delete', 'message-container')
  } else {
    dashboard.HTML.renderTemplate(doc, null, 'instant-delete', 'message-container')
  }
  return dashboard.Response.end(req, res, doc)
}

async function submitForm (req, res) {
  try {
    req.query = req.query || {}
    req.query.accountid = req.account.accountid
    await global.api.user.SetAccountDeleted.patch(req)
    if (req.success) {
      return renderPage(req, res)
    }
    return dashboard.Response.redirect(req, res, '/account/authorize')
  } catch (error) {
    return renderPage(req, res, error.message)
  }
}
