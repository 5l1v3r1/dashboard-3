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
    try {
      await global.api.administrator.SetAccountAdministrator._patch(req)
    } catch (error) {
      req.error = error.message
    }
  }
  const account = await global.api.administrator.Account._get(req)
  if (!account || account.deleted) {
    throw new Error('invalid-account')
  }
  account.created = dashboard.Timestamp.date(account.created)
  account.lastSignedInFormatted = dashboard.Timestamp.date(account.lastSignedIn)
  req.data = { account }
}

async function renderPage (req, res, messageTemplate) {
  if (req.success) {
    if (req.query && req.query.returnURL && req.query.returnURL.indexOf('/') === 0) {
      return dashboard.Response.redirect(req, res, decodeURI(req.query.returnURL))
    }
    messageTemplate = 'success'
  } else if(req.error) {
    messageTemplate = req.error
  }
  const doc = dashboard.HTML.parse(req.route.html, req.data.account, 'account')
  if (!messageTemplate && req.method === 'GET' && req.query && req.query.returnURL) {
    const submitForm = doc.getElementById('submit-form')
    const divider = submitForm.attr.action.indexOf('?') > -1 ? '&' : '?'
    submitForm.attr.action += `${divider}returnURL=${encodeURI(req.query.returnURL).split('?').join('%3F')}`
  }
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
  }
  return dashboard.Response.end(req, res, doc)
}

async function submitForm (req, res) {
  try {
    await global.api.administrator.SetAccountAdministrator._patch(req)
    if (req.success) {
      return renderPage(req, res, 'success')
    }
    return dashboard.Response.redirect(req, res, '/account/authorize')
  } catch (error) {
    return renderPage(req, res, error.message)
  }
}
