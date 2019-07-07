const dashboard = require('../../../../index.js')

module.exports = {
  patch: async (req) => {
    if (!req.query || !req.query.accountid) {
      throw new Error('invalid-accountid')
    }
    if (req.account.accountid !== req.query.accountid) {
      throw new Error('invalid-account')
    }
    const delay = global.deleteDelay < 1 ? 0 : global.deleteDelay * 24 * 60 * 60
    req.account.deleted = dashboard.Timestamp.now + delay - 1
    await dashboard.StorageObject.setProperty(`${req.appid}/account/${req.query.accountid}`, 'deleted', req.account.deleted)
    await dashboard.StorageList.add(`${req.appid}/deleted/accounts`, req.query.accountid)
    req.success = true
    return req.account
  }
}
