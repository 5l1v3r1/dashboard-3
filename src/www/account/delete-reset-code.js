const dashboard = require('../../../index.js')

module.exports = {
  before: beforeRequest,
  get: renderPage,
  post: submitForm
}

async function beforeRequest (req) {
  if (!req.query || !req.query.codeid) {
    throw new Error('invalid-codeid')
  }
  if (req.session.lockURL === req.url && req.session.unlocked) {
    try {
      await global.api.user.DeleteResetCode._delete(req)
    } catch (error) {
      req.error = error.message
    }
  }
  const resetCode = await global.api.user.ResetCode._get(req)
  if (!resetCode) {
    throw new Error('invalid-codeid')
  }
  if (resetCode.accountid !== req.account.accountid) {
    throw new Error('invalid-account')
  }
  resetCode.createdFormatted = dashboard.Timestamp.date(resetCode.created)
  req.data = { resetCode }
}

function renderPage (req, res, messageTemplate) {
  if (req.success) {
    if (req.query && req.query.returnURL) {
      return dashboard.Response.redirect(req, res, req.query.returnURL)
    }
    return dashboard.Response.redirect(req, res, `/account/reset-codes`)
  } else if (req.error) {
    messageTemplate = req.error
  }
  const doc = dashboard.HTML.parse(req.route.html, req.data.resetCode, 'resetCode')
  if (!messageTemplate && req.method === 'GET' && req.query && req.query.returnURL) {
    const submitForm = doc.getElementById('submit-form')
    const divider = submitForm.attr.action.indexOf('?') > -1 ? '&' : '?'
    submitForm.attr.action += `${divider}returnURL=${req.query.returnURL}`
  }
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
    if (messageTemplate === 'success') {
      const submitForm = doc.getElementById('submit-form')
      submitForm.parentNode.removeChild(submitForm)
    }
  }
  return dashboard.Response.end(req, res, doc)
}

async function submitForm (req, res) {
  try {
    await global.api.user.DeleteResetCode._delete(req)
    if (req.success) {
      return renderPage(req, res, 'success')
    }
    return dashboard.Response.redirect(req, res, '/account/authorize')
  } catch (error) {
    return renderPage(req, res, error.message)
  }
}
