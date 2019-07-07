const dashboard = require('../../../../index.js')

module.exports = {
  /**
   * Transfer the ownership by PATCHing the session, then
   * completing an authorization and PATCHing again to apply
   * the queued change
   */
  patch: async (req) => {
    if (!req.query || !req.query.accountid) {
      throw new Error('invalid-accountid')
    }
    if (!req.account.owner || req.query.accountid === req.account.accountid) {
      throw new Error('invalid-account')
    }
    const account = await global.api.administrator.Account._get(req)
    if (!account) {
      throw new Error('invalid-accountid')
    }
    if (account.deleted) {
      throw new Error('invalid-account')
    }
    await dashboard.StorageObject.setProperty(`${req.appid}/account/${req.query.accountid}`, 'owner', dashboard.Timestamp.now)
    await dashboard.StorageObject.removeProperty(`${req.appid}/account/${req.account.accountid}`, 'owner')
    req.success = true
    return global.api.administrator.Account._get(req)
  }
}
