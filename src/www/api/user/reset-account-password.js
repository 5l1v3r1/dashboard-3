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
    const usernameHash = await dashboard.Hash.fixedSaltHash(req.body.username, req.alternativeFixedSalt, req.alternativeDashboardEncryptionKey)
    const accountid = await dashboard.Storage.read(`${req.appid}/map/usernames/${usernameHash}`)
    if (!accountid) {
      throw new Error('invalid-username')
    }
    const query = req.query
    req.query = { accountid }
    const account = await global.api.administrator.Account._get(req)
    if (!account) {
      throw new Error('invalid-username')
    }
    if (account.deleted) {
      throw new Error('invalid-account')
    }
    if (account.deleted < dashboard.Timestamp.now) {
      throw new Error('invalid-account')
    }
    const codeHash = await dashboard.Hash.fixedSaltHash(req.body.code, req.alternativeFixedSalt, req.alternativeDashboardEncryptionKey)
    const codeid = await dashboard.Storage.read(`${req.appid}/map/account/resetCodes/${account.accountid}/${codeHash}`)
    if (!codeid) {
      throw new Error('invalid-reset-code')
    }
    req.query.codeid = codeid
    const code = await global.api.administrator.ResetCode._get(req)
    req.query = query
    if (!code || code.accountid !== accountid) {
      throw new Error('invalid-reset-code')
    }
    const passwordHash = await dashboard.Hash.randomSaltHash(req.body.password, req.alternativeWorkloadFactor, req.alternativeDashboardEncryptionKey)
    await dashboard.StorageObject.setProperties(`${req.appid}/account/${accountid}`, {
      passwordHash,
      resetCodeLastUsed: dashboard.Timestamp.now,
      sessionKey: dashboard.UUID.random(64),
      sessionKeyLastReset: dashboard.Timestamp.now,
      passwordLastChanged: dashboard.Timestamp.now,
      sessionKeyNumber: account.sessionKeyNumber + 1
    })
    await dashboard.Storage.deleteFile(`${req.appid}/resetCode/${code.codeid}`)
    await dashboard.StorageList.remove(`${req.appid}/resetCodes`, codeid)
    await dashboard.StorageList.remove(`${req.appid}/account/resetCodes/${accountid}`, codeid)
    await dashboard.Storage.deleteFile(`${req.appid}/map/account/resetCodes/${accountid}/${codeHash}`)
    req.success = true
    account.sessionKeyLastReset = dashboard.Timestamp.now
    account.passwordLastChanged = dashboard.Timestamp.now
    return account
  }
}
