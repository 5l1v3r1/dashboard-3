const dashboard = require('../../../index.js')

module.exports = {
  before: beforeRequest,
  get: renderPage,
  post: submitForm
}

async function beforeRequest (req) {
  if (!req.query || !req.query.sessionid) {
    throw new Error('invalid-sessionid')
  }
  const session = await global.api.user.Session.get(req)
  session.createdFormatted = dashboard.Timestamp.date(session.created)
  session.expiresFormatted = dashboard.Timestamp.date(session.expires)
  req.data = { session }
}

function renderPage (req, res, messageTemplate) {
  const doc = dashboard.HTML.parse(req.route.html, req.data.session, 'session')
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
    if (messageTemplate === 'success') {
      const submitForm = doc.getElementById('submit-form')
      submitForm.parentNode.removeChild(submitForm)
      const sessionTable = doc.getElementById('sessions-table')
      sessionTable.parentNode.removeChild(sessionTable)
    }
  }
  return dashboard.Response.end(req, res, doc)
}

async function submitForm (req, res) {
  try {
    req.query = req.query || {}
    req.query.sessionid = req.session.sessionid
    req.session = await global.api.user.SetSessionEnded.patch(req)
    return renderPage(req, res, 'success')
  } catch (error) {
    return renderPage(req, res, 'unknown-error')
  }
}
