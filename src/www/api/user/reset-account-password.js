const dashboard = require('../../../../index.js')

module.exports = {
  auth: false,
  patch: async (req) => {
    if (!req.body || !req.body.code) {
      throw new Error('invalid-reset-code')
    }
    if (!req.body.username) {
      throw new Error('invalid-username')
    }
    if (!req.body.username || !req.body.username.length ||
      global.minimumUsernameLength > req.body.username.length) {
      throw new Error('invalid-username')
    }
    if (!req.body.password || !req.body.password.length) {
      throw new Error('invalid-password')
    }
    if (global.minimumPasswordLength > req.body.password.length) {
      throw new Error('invalid-password-length')
    }
    if (!req.body.code || !req.body.code.length) {
      throw new Error('invalid-reset-code')
    }
    if (global.minimumResetCodeLength > req.body.code.length) {
      throw new Error('invalid-reset-code-length')
    }
    const usernameHash = dashboard.Hash.fixedSaltHash(req.body.username, req.alternativeFixedSalt, req.alternativeEncryptionKey)
    const accountid = await dashboard.Storage.read(`${req.appid}/map/usernames/${usernameHash}`)
    if (!accountid) {
      throw new Error('invalid-username')
    }
    const accountReq = { query: { accountid }, appid: req.appid, account: { accountid } }
    const account = await global.api.user.Account._get(accountReq)
    if (!account) {
      throw new Error('invalid-username')
    }
    if (account.deleted) {
      throw new Error('invalid-account')
    }
    if (account.deleted < dashboard.Timestamp.now) {
      throw new Error('invalid-account')
    }
    const codeHash = dashboard.Hash.fixedSaltHash(req.body.code, req.alternativeFixedSalt, req.alternativeEncryptionKey)
    const codeid = await dashboard.Storage.read(`${req.appid}/map/account/resetCodes/${account.accountid}/${codeHash}`)
    if (!codeid) {
      throw new Error('invalid-reset-code')
    }
    req.query = req.query || {}
    req.query.codeid = codeid
    const code = await global.api.user.ResetCode.get(req)
    if (!code) {
      throw new Error('invalid-reset-code')
    }
    const passwordHash = dashboard.Hash.randomSaltHash(req.body.password, req.alternativeWorkloadFactor, req.alternativeEncryptionKey)
    await dashboard.StorageObject.setProperty(`${req.appid}/${accountid}`,'passwordHash', passwordHash)
    await dashboard.StorageObject.setProperty(`${req.appid}/${accountid}`,'resetCodeLastUsed', dashboard.Timestamp.now)
    await dashboard.StorageObject.setProperty(`${req.appid}/${accountid}`, 'sessionKey', dashboard.UUID.random(64))
    await dashboard.StorageObject.setProperty(`${req.appid}/${accountid}`, 'sessionKeyLastReset', dashboard.Timestamp.now)
    await dashboard.StorageObject.setProperty(`${req.appid}/${accountid}`, 'passwordLastChanged', dashboard.Timestamp.now)
    await dashboard.StorageObject.setProperty(`${req.appid}/${accountid}`, 'sessionKeyNumber', account.sessionKeyNumber + 1)
    await dashboard.Storage.deleteFile(`${req.appid}/${code.codeid}`)
    await dashboard.StorageList.remove(`${req.appid}/resetCodes`, codeid)
    await dashboard.StorageList.remove(`${req.appid}/account/resetCodes/${accountid}`, codeid)
    await dashboard.Storage.deleteFile(`${req.appid}/map/account/resetCodes/${accountid}/${codeHash}`)
    req.success = true
    account.sessionKeyLastReset = dashboard.Timestamp.now
    account.passwordLastChanged = dashboard.Timestamp.now
    return account
  }
}
