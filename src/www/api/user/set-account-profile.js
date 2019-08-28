const dashboard = require('../../../../index.js')

module.exports = {
  patch: async (req) => {
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
    const profile = await global.api.user.Profile.get(req)
    if (!profile) {
      throw new Error('invalid-profileid')
    }
    await dashboard.StorageObject.setProperties(`${req.appid}/account/${req.query.accountid}`, {
      profileid: profile.profileid,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.contactEmail
    })
    req.success = true
    return global.api.user.Account.get(req)
  }
}
