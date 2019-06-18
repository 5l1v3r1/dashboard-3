const dashboard = require('../../../../index.js')

module.exports = {
  patch: async (req) => {
    if (!req.query || !req.query.sessionid) {
      throw new Error('invalid-sessionid')
    }
    if (req.query.sessionid !== req.session.sessionid) {
      throw new Error('invalid-session')
    }
    const session = await global.api.user.Session._get(req)
    if (!session.lock) {
      throw new Error('invalid-session')
    }
    await dashboard.StorageObject.removeProperties(`${req.appid}/session/${req.query.sessionid}`, ['lockData', 'lockURL', 'lock'])
    return global.api.user.Session._get(req)
  }
}
