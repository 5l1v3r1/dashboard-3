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
      await global.api.user.ResetSessionKey._patch(req)
    } catch (error) {
      req.error = error.message
    }
  }
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
    req.query = req.query || {}
    req.query.accountid = req.account.accountid
    await global.api.user.ResetSessionKey._patch(req)
    if (req.success) {
      req.query = {}
      req.url = req.urlPath = '/home'
      return dashboard.Response.redirectToSignIn(req, res)
    }
    return dashboard.Response.redirect(req, res, '/account/authorize')
  } catch (error) {
    return renderPage(req, res, error.message)
  }
}
