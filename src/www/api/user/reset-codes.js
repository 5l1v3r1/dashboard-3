const dashboard = require('../../../../index.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.accountid) {
      throw new Error('invalid-accountid')
    }
    if (req.query.accountid !== req.account.accountid) {
      throw new Error('invalid-account')
    }
    let codeids
    if (req.query.all) {
      codeids = await dashboard.StorageList.listAll(`${req.appid}/account/resetCodes/${req.query.accountid}`)
    } else {
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
      codeids = await dashboard.StorageList.list(`${req.appid}/account/resetCodes/${req.query.accountid}`, offset)
    }
    if (!codeids || !codeids.length) {
      return null
    }
    req.cacheData = await dashboard.Storage.readMany('resetCode', codeids)
    const resetCodes = []
    for (const codeid of codeids) {
      req.query.codeid = codeid
      const resetCode = await global.api.user.ResetCode._get(req)
      resetCodes.push(resetCode)
    }
    return resetCodes
  }
}
