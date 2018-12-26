const dashboard = require('../../../../index.js')

module.exports = {
  patch: async (req) => {
    if (!req.query || !req.query.sessionid) {
      throw new Error('invalid-sessionid')
    }
    if (!req.session.administratorid) {
      throw new Error('invalid-session')
    }
    if (req.query.sessionid == req.session.sessionid) {
      throw new Error('invalid-session')
    }
    const session = await global.api.administrator.Session.get(req)
    if (session.ended) {
      throw new Error('invalid-session')
    }
    await dashboard.StorageObject.setProperty(`${req.appid}/${req.session.sessionid}`, 'ended', dashboard.Timestamp.now)
    await dashboard.StorageObject.removeProperty(`${req.appid}/${req.session.impersonator}`, 'impersonate')
    req.success = true
    delete (req.session.impersonate)
    return req.session
  }
}
