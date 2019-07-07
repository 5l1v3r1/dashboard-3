const dashboard = require('../../../../index.js')

module.exports = {
  patch: async (req) => {
    if (!req.query || !req.query.accountid) {
      throw new Error('invalid-accountid')
    }
    if (req.account.accountid !== req.query.accountid) {
      throw new Error('invalid-account')
    }
    if (!req.body || !req.body.password) {
      throw new Error('invalid-password')
    }
    if (global.minimumPasswordLength > req.body.password.length ||
      global.maximumPasswordLength < req.body.password.length) {
      throw new Error('invalid-password-length')
    }
    let dashboardEncryptionKey = global.dashboardEncryptionKey
    if (req.server) {
      dashboardEncryptionKey = req.server.dashboardEncryptionKey || dashboardEncryptionKey
    }
    const passwordHash = await dashboard.Hash.randomSaltHash(req.body.password, dashboardEncryptionKey)
    await dashboard.StorageObject.setProperty(`${req.appid}/account/${req.query.accountid}`, 'passwordHash', passwordHash)
    await dashboard.StorageObject.setProperty(`${req.appid}/account/${req.query.accountid}`, 'passwordLastChanged', dashboard.Timestamp.now)
    req.success = true
    return global.api.user.Account._get(req)
  }
}
