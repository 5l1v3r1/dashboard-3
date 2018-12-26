const dashboard = require('../../../../index.js')

module.exports = {
  lock: true,
  before: async (req) => {
    if (!req.query || !req.query.accountid) {
      throw new Error('invalid-accountid')
    }
    const account = await global.api.administrator.Account.get(req)
    if (!account) {
      throw new Error('invalid-accountid')
    }
    if (account.deleted) {
      throw new Error('invalid-account')
    }
  },
  patch: async (req) => {
    const delay = global.deleteDelay < 1 ? 0 : global.deleteDelay * 24 * 60 * 60
    await dashboard.StorageObject.setProperty(`${req.appid}/${req.query.accountid}`, 'deleted', dashboard.Timestamp.now + delay - 1)
    await dashboard.StorageList.add(`${req.appid}/deleted/accounts`, req.query.accountid)
    req.success = true
    return global.api.administrator.Account.get(req)
  }
}
