const dashboard = require('../../../../index.js')

module.exports = {
  /**
   * Returns a list of administrators bound to profile information
   */
  get: async (req) => {
    req.query = req.query || {}
    let accountids
    if (req.query.all) {
      accountids = await dashboard.StorageList.listAll(`${req.appid}/administrator/accounts`)
    } else {
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
      accountids = await dashboard.StorageList.list(`${req.appid}/administrator/accounts`, offset)
    }
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
