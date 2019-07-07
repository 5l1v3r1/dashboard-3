const dashboard = require('../../../../index.js')

module.exports = {
  patch: async (req) => {
    if (!req.query || !req.query.accountid) {
      throw new Error('invalid-accountid')
    }
    if (req.account.accountid !== req.query.accountid) {
      throw new Error('invalid-account')
    }
    if (!req.body || !req.body.username) {
      throw new Error('invalid-username')
    }
    if (global.minimumUsernameLength > req.body.username.length ||
      global.maximumUsernameLength < req.body.username.length) {
      throw new Error('invalid-username-length')
    }
    let dashboardEncryptionKey = global.dashboardEncryptionKey
    let bcryptFixedSalt = global.bcryptFixedSalt
    if (req.server) {
      dashboardEncryptionKey = req.server.dashboardEncryptionKey || dashboardEncryptionKey
      bcryptFixedSalt = req.server.bcryptFixedSalt || bcryptFixedSalt
    }
    const usernameHash = await dashboard.Hash.fixedSaltHash(req.body.username, bcryptFixedSalt, dashboardEncryptionKey)
    const oldUsernameHash = await dashboard.StorageObject.getProperty(`${req.appid}/account/${req.query.accountid}`, 'usernameHash')
    await dashboard.Storage.deleteFile(`${req.appid}/map/usernames/${oldUsernameHash}`)
    await dashboard.Storage.write(`${req.appid}/map/usernames/${usernameHash}`, req.query.accountid)
    await dashboard.StorageObject.setProperty(`${req.appid}/account/${req.query.accountid}`, 'usernameHash', usernameHash)
    req.account.usernameLastChanged = dashboard.Timestamp.now
    await dashboard.StorageObject.setProperty(`${req.appid}/account/${req.query.accountid}`, 'usernameLastChanged', dashboard.Timestamp.now)
    req.success = true
    return req.account
  }
}
