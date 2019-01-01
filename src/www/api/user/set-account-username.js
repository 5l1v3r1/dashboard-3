const dashboard = require('../../../../index.js')

module.exports = {
  lock: true,
  before: async (req) => {
    if (!req.query || !req.query.accountid) {
      throw new Error('invalid-accountid')
    }
    if (req.account.accountid !== req.query.accountid) {
      throw new Error('invalid-account')
    }
    if (req.body && req.body.usernameHash) {
      return
    }
    if (!req.body || !req.body.username) {
      throw new Error('invalid-username')
    }
    if (global.minimumUsernameLength > req.body.username.length ||
      global.maximumUsernameLength < req.body.username.length) {
      throw new Error('invalid-username-length')
    }
    req.body.usernameHash = dashboard.Hash.fixedSaltHash(req.body.username, req.alternativeFixedSalt, req.alternativeEncryptionKey)
    delete (req.body.username)
  },
  patch: async (req) => {
    const oldUsernameHash = await dashboard.StorageObject.getProperty(`${req.appid}/${req.query.accountid}`, 'usernameHash')
    await dashboard.Storage.deleteFile(`${req.appid}/map/usernames/${oldUsernameHash}`)
    await dashboard.Storage.write(`${req.appid}/map/usernames/${req.body.usernameHash}`, req.query.accountid)
    await dashboard.StorageObject.setProperty(`${req.appid}/${req.query.accountid}`, 'usernameHash', req.body.usernameHash)
    req.account.usernameLastChanged = dashboard.Timestamp.now
    await dashboard.StorageObject.setProperty(`${req.appid}/${req.query.accountid}`, 'usernameLastChanged', dashboard.Timestamp.now)
    req.success = true
    return req.account
  }
}
