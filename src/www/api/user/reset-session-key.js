const dashboard = require('../../../../index.js')

module.exports = {
  lock: true,
  patch: async (req) => {
    if (!req.query || !req.query.accountid) {
      throw new Error('invalid-accountid')
    }
    if (req.query.accountid !== req.account.accountid) {
      throw new Error('invalid-session')
    }
    await dashboard.StorageObject.setProperty(`${req.appid}/account/${req.query.accountid}`, 'sessionKey', dashboard.UUID.random(64))
    await dashboard.StorageObject.setProperty(`${req.appid}/account/${req.query.accountid}`, 'sessionKeyLastReset', dashboard.Timestamp.now)
    await dashboard.StorageObject.setProperty(`${req.appid}/account/${req.query.accountid}`, 'sessionKeyNumber', req.account.sessionKeyNumber + 1)
    req.success = true
    return global.api.user.Account._get(req)
  }
}
