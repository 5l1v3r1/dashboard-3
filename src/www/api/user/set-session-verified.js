const dashboard = require('../../../../index.js')

module.exports = {
  patch: async (req) => {
    if (!req.query || !req.query.sessionid) {
      throw new Error('invalid-sessionid')
    }
    if (req.query.sessionid !== req.session.sessionid) {
      throw new Error('invalid-session')
    }
    if (!req || !req.body) {
      throw new Error('invalid-username')
    }
    if (!req.body.username || !req.body.username.length) {
      throw new Error('invalid-username')
    }
    if (!req.body.password || !req.body.password.length) {
      throw new Error('invalid-password')
    }
    if (global.minimumUsernameLength > req.body.username.length) {
      throw new Error('invalid-username-length')
    }
    if (global.minimumPasswordLength > req.body.password.length) {
      throw new Error('invalid-password-length')
    }
    let dashboardEncryptionKey = global.dashboardEncryptionKey
    let dashboardSessionKey = global.dashboardSessionKey
    let bcryptFixedSalt = global.bcryptFixedSalt
    if (req.server) {
      dashboardEncryptionKey = req.server.dashboardEncryptionKey || dashboardEncryptionKey
      dashboardSessionKey = req.server.dashboardSessionKey || dashboardSessionKey
      bcryptFixedSalt = req.server.bcryptFixedSalt || bcryptFixedSalt
    }
    const usernameHash = await dashboard.Hash.fixedSaltHash(req.body.username, bcryptFixedSalt, dashboardEncryptionKey)
    const accountid = await dashboard.Storage.read(`${req.appid}/map/usernames/${usernameHash}`)
    if (!accountid || accountid !== req.account.accountid) {
      throw new Error('invalid-username')
    }
    const passwordHash = await dashboard.StorageObject.getProperty(`${req.appid}/account/${accountid}`, 'passwordHash')
    const validPassword = await dashboard.Hash.randomSaltCompare(req.body.password, passwordHash, dashboardEncryptionKey)
    if (!validPassword) {
      throw new Error('invalid-password')
    }
    await dashboard.StorageObject.setProperty(`${req.appid}/session/${req.session.sessionid}`, 'lastVerified', dashboard.Timestamp.now)
    req.session.lastVerified = dashboard.Timestamp.now
    req.success = true
    return req.session
  }
}
