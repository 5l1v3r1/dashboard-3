const dashboard = require('../../../../index.js')

module.exports = {
  post: async (req) => {
    if (!req.query || !req.query.accountid) {
      throw new Error('invalid-accountid')
    }
    const account = await global.api.administrator.Account.get(req)
    if (!account) {
      throw new Error('invalid-account')
    }
    if (!req.body || !req.body.code || !req.body.code.length) {
      throw new Error('invalid-reset-code')
    }
    if (global.minimumResetCodeLength > req.body.code.length ||
      global.maximumResetCodeLength < req.body.code.length) {
      throw new Error('invalid-reset-code-length')
    }
    let dashboardEncryptionKey = global.dashboardEncryptionKey
    let bcryptFixedSalt = global.bcryptFixedSalt
    if (req.server) {
      dashboardEncryptionKey = req.server.dashboardEncryptionKey || dashboardEncryptionKey
      bcryptFixedSalt = req.server.bcryptFixedSalt || bcryptFixedSalt
    }
    const codeHash = await dashboard.Hash.fixedSaltHash(req.body.code, bcryptFixedSalt, dashboardEncryptionKey)
    const codeid = `code_${await dashboard.UUID.generateID()}`
    await dashboard.Storage.write(`${req.appid}/resetCode/${codeid}`, {
      object: 'resetCode',
      accountid: req.query.accountid,
      codeid,
      codeHash,
      created: dashboard.Timestamp.now
    })
    await dashboard.StorageObject.setProperty(`${req.appid}/account/${req.account.accountid}`, 'resetCodeLastCreated', dashboard.Timestamp.now)
    await dashboard.StorageList.add(`${req.appid}/resetCodes`, codeid)
    await dashboard.StorageList.add(`${req.appid}/account/resetCodes/${req.query.accountid}`, codeid)
    await dashboard.Storage.write(`${req.appid}/map/account/resetCodes/${req.query.accountid}/${codeHash}`, codeid)
    req.success = true
    req.query.codeid = codeid
    return global.api.administrator.ResetCode.get(req)
  }
}
