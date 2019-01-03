const dashboard = require('../../../../index.js')

module.exports = {
  patch: async (req) => {
    if (!req.query || !req.query.sessionid) {
      throw new Error('invalid-sessionid')
    }
    if (req.query.sessionid !== req.session.sessionid) {
      throw new Error('invalid-session')
    }
    const session = await global.api.user.Session.get(req)
    if (!session.unlocked) {
      throw new Error('invalid-session')
    }
    await dashboard.StorageObject.removeProperty(`${req.appid}/session/${req.query.sessionid}`, 'unlocked')
    return global.api.user.Session.get(req)
  }
}
