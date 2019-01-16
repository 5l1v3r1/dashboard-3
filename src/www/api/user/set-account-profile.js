const dashboard = require('../../../../index.js')

module.exports = {
  lock: true,
  before: async (req) => {
    if (!req.query || !req.query.accountid) {
      throw new Error('invalid-accountid')
    }
    if (req.account.accountid !== req.query.accountid) {
      throw new Error('invalid-account')
    }
    if (!req.body || !req.body.profileid) {
      throw new Error('invalid-profileid')
    }
    req.query.profileid = req.body.profileid
    const profile = await global.api.user.Profile._get(req)
    if (!profile) {
      throw new Error('invalid-profileid')
    }
    if (profile.accountid !== req.account.accountid) {
      throw new Error('invalid-account')
    }
    if (req.account.profileid === profile.profileid) {
      throw new Error('invalid-profile')
    }
  },
  patch: async (req) => {
    await dashboard.StorageObject.setProperty(`${req.appid}/account/${req.query.accountid}`, 'profileid', req.body.profileid)
    req.success = true
    return global.api.user.Account._get(req)
  }
}
