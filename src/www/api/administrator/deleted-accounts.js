const dashboard = require('../../../../index.js')

module.exports = {
  get: async (req) => {
    req.query = req.query || {}
    const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
    const accountids = await dashboard.StorageList.list(`${req.appid}/deleted/accounts`, offset)
    if (!accountids || !accountids.length) {
      return null
    }
    req.cacheData = await dashboard.Storage.readMany(`${req.appid}/accounts`, accountids)
    const accounts = []
    for (const accountid of accountids) {
      req.query.accountid = accountid
      const account = await global.api.administrator.Account._get(req)
      accounts.push(account)
    }
    return accounts
  }
}
