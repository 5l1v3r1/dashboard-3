const dashboard = require('../../../../index.js')

module.exports = {
  lock: true,
  before: async (req) => {
    if (!req.query || !req.query.profileid) {
      throw new Error('invalid-profileid')
    }
    if (req.query.profileid === req.account.profileid) {
      throw new Error('invalid-profile')
    }
    const profile = await global.api.user.Profile.get(req)
    if (profile.accountid !== req.account.accountid) {
      throw new Error('invalid-account')
    }
  },
  delete: async (req) => {
    await dashboard.Storage.deleteFile(`${req.appid}/profile/${req.query.profileid}`)
    await dashboard.StorageObject.setProperty(`${req.appid}/account/${req.account.accountid}`, 'profileLastDeleted', dashboard.Timestamp.now)
    await dashboard.StorageList.remove(`${req.appid}/profiles`, req.query.profileid)
    await dashboard.StorageList.remove(`${req.appid}/account/profiles/${req.account.accountid}`, req.query.profileid)
    req.success = true
    req.query.accountid = req.account.accountid
    return global.api.user.Account.get(req)
  }
}
