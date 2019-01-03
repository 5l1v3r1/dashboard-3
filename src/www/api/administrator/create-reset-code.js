const dashboard = require('../../../../index.js')

module.exports = {
  lock: true,
  before: async (req) => {
    if (!req.query || !req.query.accountid) {
      throw new Error('invalid-accountid')
    }
    if (req.body && req.body.codeHash) {
      return
    }
    if (!req.body || !req.body.code || !req.body.code.length) {
      throw new Error('invalid-reset-code')
    }
    if (global.minimumResetCodeLength > req.body.code.length ||
      global.maximumResetCodeLength < req.body.code.length) {
      throw new Error('invalid-reset-code-length')
    }
    req.body.codeHash = dashboard.Hash.fixedSaltHash(req.body.code, req.alternativeFixedSalt, req.alternativeDashboardEncryptionKey)
    delete (req.body.code)
  },
  post: async (req) => {
    const codeid = `code_${await dashboard.UUID.generateID()}`
    await dashboard.Storage.write(`${req.appid}/resetCode/${codeid}`, {
        object: 'resetCode',
        accountid: req.query.accountid,
        codeid: codeid,
        codeHash: req.body.codeHash,
        created: dashboard.Timestamp.now
      })
    await dashboard.StorageObject.setProperty(`${req.appid}/account/${req.account.accountid}`, 'resetCodeLastCreated', dashboard.Timestamp.now)
    await dashboard.StorageList.add(`${req.appid}/resetCodes`, codeid)
    await dashboard.StorageList.add(`${req.appid}/account/resetCodes/${req.query.accountid}`, codeid)
    await dashboard.Storage.write(`${req.appid}/map/account/resetCodes/${req.query.accountid}/${req.body.codeHash}`, codeid)
    req.success = true
    req.query.codeid = codeid
    return global.api.administrator.ResetCode.get(req)
  }
}
