const dashboard = require('../../../../index.js')

module.exports = {
  auth: false,
  patch: async (req) => {
    if (!req.body) {
      throw new Error('invalid-username')
    }
    if (!req.body.username) {
      throw new Error('invalid-username')
    }
    if (!req.body.username || !req.body.username.length) {
      throw new Error('invalid-username')
    }
    if (global.minimumUsernameLength > req.body.username.length) {
      throw new Error('invalid-username-length')
    }
    if (!req.body.password || !req.body.password.length) {
      throw new Error('invalid-password')
    }
    if (global.minimumPasswordLength > req.body.password.length) {
      throw new Error('invalid-password-length')
    }
    const usernameHash = dashboard.Hash.fixedSaltHash(req.body.username, req.alternativeFixedSalt, req.alternativeEncryptionKey)
    const accountid = await dashboard.Storage.read(`${req.appid}/map/usernames/${usernameHash}`)
    if (!accountid) {
      throw new Error('invalid-username')
    }
    const accountReq = { query: { accountid }, appid: req.appid, account: { accountid }}
    const account = await global.api.user.Account._get(accountReq)
    if (!account) {
      throw new Error('invalid-account')
    }
    if (!account.deleted) {
      throw new Error('invalid-account')
    }
    if (account.deleted < dashboard.Timestamp.now) {
      throw new Error('invalid-account')
    }
    await dashboard.StorageObject.removeProperty(`${req.appid}/${account.accountid}`, 'deleted')
    await dashboard.StorageList.remove(`${req.appid}/deleted/accounts`, account.accountid)
    req.success = true
    req.query = req.query || {}
    req.query.accountid = account.accountid
    return global.api.user.Account.get(req)
  }
}
