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
    req.data = { account }
  },
  delete: async (req) => {
    await dashboard.Storage.deleteFile(`${req.appid}/${req.query.accountid}`)
    await dashboard.StorageList.remove(`${req.appid}/accounts`, req.query.accountid)
    if (req.data.account.administrator) {
      await dashboard.StorageList.remove(`${req.appid}/administrator/accounts`, req.query.accountid)
    }
    if (req.data.account.deleted) {
      await dashboard.StorageList.remove(`${req.appid}/deleted/accounts`, req.query.accountid)
    }
    req.success = true
  }
}
