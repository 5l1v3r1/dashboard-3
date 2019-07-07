const dashboard = require('../../../../index.js')

module.exports = {
  delete: async (req) => {
    if (!req.query || !req.query.codeid) {
      throw new Error('invalid-codeid')
    }
    const code = await global.api.user.ResetCode._get(req)
    if (code.accountid !== req.account.accountid) {
      throw new Error('invalid-account')
    }
    const codeHash = await dashboard.StorageObject.getProperty(`${req.appid}/resetCode/${req.query.codeid}`, 'codeHash')
    await dashboard.Storage.deleteFile(`${req.appid}/resetCode/${req.query.codeid}`)
    await dashboard.StorageObject.setProperty(`${req.appid}/account/${req.account.accountid}`, 'resetCodeLastDeleted', dashboard.Timestamp.now)
    await dashboard.StorageList.remove(`${req.appid}/resetCodes`, req.query.codeid)
    await dashboard.StorageList.remove(`${req.appid}/account/resetCodes/${req.account.accountid}`, req.query.codeid)
    await dashboard.Storage.deleteFile(`${req.appid}/map/account/resetCodes/${req.account.accountid}/${codeHash}`)
    req.success = true
    req.query.accountid = req.account.accountid
    return global.api.user.Account._get(req)
  }
}
