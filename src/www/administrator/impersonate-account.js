const dashboard = require('../../../index.js')

module.exports = {
  before: beforeRequest,
  get: renderPage,
  post: submitForm
}

async function beforeRequest (req) {
  if (!req.query || !req.query.accountid) {
    throw new Error('invalid-accountid')
  }
  if (req.session.lockURL === req.url && req.session.unlocked) {
    req.query.sessionid = req.session.sessionid
    try {
      const zz = await global.api.administrator.SetSessionImpersonate.patch(req)
    } catch (error) {
      req.error = error.message
    }
  }
  const account = await global.api.administrator.Account.get(req)
  if (!account) {
    throw new Error('invalid-accountid')
  }
  account.created = dashboard.Timestamp.date(account.created)
  account.lastSignedIn = dashboard.Timestamp.date(account.lastSignedIn)
  req.data = { account }
}

async function renderPage (req, res, messageTemplate) {
  if (req.success) {
    if (req.query && req.query.returnURL) {
      return dashboard.Response.redirect(req, res, req.query.returnURL)
    }
    return dashboard.Response.redirect(req, res, '/home')
  } else if (req.error) {
    messageTemplate = req.error
  }
  const doc = dashboard.HTML.parse(req.route.html, req.data.account, 'account')
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
  }
  return dashboard.Response.end(req, res, doc)
}

async function submitForm (req, res) {
  try {
    req.query.sessionid = req.session.sessionid
    req.body = {
      accountid: req.query.accountid
    }
    const session = await global.api.administrator.SetSessionImpersonate.patch(req)
    if (req.success) {
      req.session = session
      return renderPage(req, res, 'success')
    }
    return dashboard.Response.redirect(req, res, '/account/authorize')
  } catch (error) {
    return renderPage(req, res, error.message)
  }
}
