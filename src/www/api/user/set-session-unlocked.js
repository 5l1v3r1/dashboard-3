const dashboard = require('../../../../index.js')

module.exports = {
  patch: async (req) => {
    if (!req.session.lock) {
      throw new Error('invalid-session')
    }
    if (!req.query || !req.query.sessionid) {
      throw new Error('invalid-sessionid')
    }
    if (req.session.sessionid !== req.query.sessionid) {
      throw new Error('invalid-session')
    }
    if (!req.body) {
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
    const usernameHash = await dashboard.Hash.fixedSaltHash(req.body.username, req.alternativeFixedSalt, req.alternativeDashboardEncryptionKey)
    const accountid = await dashboard.Storage.read(`${req.appid}/map/usernames/${usernameHash}`)
    if (!accountid) {
      throw new Error('invalid-username')
    }
    const query = req.query
    req.query.accountid = accountid
    const account = await global.api.administrator.Account._get(req)
    req.query = query
    if (!account) {
      throw new Error('invalid-account')
    }
    if (account.deleted) {
      throw new Error('invalid-account')
    }
    const passwordHash = await dashboard.StorageObject.getProperty(`${req.appid}/account/${accountid}`, `passwordHash`)
    const validPassword = await dashboard.Hash.randomSaltCompare(req.body.password, passwordHash, req.alternativeDashboardEncryptionKey)
    if (!validPassword) {
      throw new Error('invalid-password')
    }
    if (account.accountid !== req.account.accountid) {
      throw new Error('invalid-account')
    }
    if (req.body.remember === 'minutes') {
      req.session.unlocked = dashboard.Timestamp.now + 1200
    } else {
      req.session.unlocked = 1
    }
    await dashboard.StorageObject.setProperty(`${req.appid}/session/${req.query.sessionid}`, `unlocked`, req.session.unlocked)
    await dashboard.StorageObject.removeProperty(`${req.appid}/session/${req.query.sessionid}`, `lock`)
    req.success = true
    delete (req.session.lock)
    return req.session
  }
}
