const dashboard = require('../../../../index.js')

module.exports = {
  patch: async (req) => {
    if (!req.query || !req.query.accountid) {
      throw new Error('invalid-accountid')
    }
    const account = await global.api.administrator.Account.get(req)
    if (!account) {
      throw new Error('invalid-accountid')
    }
    if (account.deleted || !account.administrator) {
      throw new Error('invalid-account')
    }
    await dashboard.StorageObject.removeProperty(`${req.appid}/account/${req.query.accountid}`, `administrator`)
    await dashboard.StorageList.remove(`${req.appid}/administrator/accounts`, req.query.accountid)
    req.success = true
    return global.api.administrator.Account.get(req)
  }
}
