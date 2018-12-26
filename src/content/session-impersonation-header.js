const dashboard = require('../../index.js')

module.exports = {
  template: sessionImpersonationHeader
}

function sessionImpersonationHeader (req, res, templateDoc) {
  if (!req.session || !req.session.administratorid) {
    return
  }
  dashboard.HTML.renderTemplate(templateDoc, req.session, 'session-impersonate', 'notifications-container')
}
