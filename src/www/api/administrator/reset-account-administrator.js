const dashboard = require('../../../../index.js')

module.exports = {
  /**
   * Revoke an user by DELETEing the accountid, then
   * completing an authorization and DELETEing again to apply
   * the queued change
   */
  lock: true,
  before: async (req) => {
    if (!req.query || !req.query.accountid) {
      throw new Error('invalid-accountid')
    }
    const account = await global.api.administrator.Account._get(req)
    if (!account) {
      throw new Error('invalid-accountid')
    }
    if (account.deleted || !account.administrator) {
      throw new Error('invalid-account')
    }
  },
  patch: async (req) => {
    await dashboard.StorageObject.removeProperty(`${req.appid}/account/${req.query.accountid}`, `administrator`)
    await dashboard.StorageList.remove(`${req.appid}/administrator/accounts`, req.query.accountid)
    req.success = true

    return global.api.administrator.Account._get(req)
  }
}
