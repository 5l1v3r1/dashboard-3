const dashboard = require('../../index.js')

module.exports = {
  template: sessionUnlockedHeader
}

function sessionUnlockedHeader (req, res, templateDoc) {
  if (!req.session || !req.session.unlocked || dashboard.Timestamp.now > req.session.unlocked) {
    return
  }
  dashboard.HTML.renderTemplate(templateDoc, req.session, 'session-unlocked', 'notifications-container')
}
