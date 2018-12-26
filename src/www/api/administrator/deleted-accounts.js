const dashboard = require('../../../../index.js')

module.exports = {
  get: async (req) => {
    req.query = req.query || {}
    const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
    const accountids = await dashboard.StorageList.list(`${req.appid}/deleted/accounts`, offset)
    if (!accountids || !accountids.length) {
      return null
    }
    const accounts = []
    for (const accountid of accountids) {
      req.query.accountid = accountid
      const account = await global.api.administrator.Account.get(req)
      accounts.push(account)
    }
    return accounts
  }
}
