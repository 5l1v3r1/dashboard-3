const dashboard = require('../../../../index.js')

module.exports = {
  lock: true,
  before: async (req) => {
    if (!req.query || !req.query.profileid) {
      throw new Error('invalid-profileid')
    }
    const profile = await global.api.user.Profile._get(req)
    if (!profile) {
      throw new Error('invalid-profileid')
    }
    if (!req.body || !req.body.email || !req.body.email.length || !req.body.email.indexOf('@') > 0) {
      throw new Error('invalid-profile-email')
    }
    if (!req.body['first-name'] || !req.body['first-name'].length) {
      throw new Error('invalid-profile-first-name')
    }
    if (global.minimumProfileFirstNameLength > req.body['first-name'].length ||
        global.maximumProfileFirstNameLength < req.body['first-name'].length) {
      throw new Error('invalid-profile-first-name-length')
    }
    if (!req.body['last-name'] || !req.body['last-name'].length) {
      throw new Error('invalid-profile-last-name')
    }
    if (global.minimumProfileLastNameLength > req.body['last-name'].length ||
        global.maximumProfileLastNameLength < req.body['last-name'].length) {
      throw new Error('invalid-profile-last-name-length')
    }
    req.data = { profile }
  },
  patch: async (req) => {
    await dashboard.StorageObject.setProperties(`${req.appid}/profile/${req.query.profileid}`, {
      firstName: req.body['first-name'],
      lastName: req.body['last-name'],
      email: req.body.email
    })
    if (req.query.profileid === req.account.profileid) {
      await dashboard.StorageObject.setProperties(`${req.appid}/account/${req.query.accountid}`, {
        firstName: req.body['first-name'],
        lastName: req.body['last-name'],
        email: req.body.email
      })
    }
    req.success = true
    req.data.profile.firstName = req.body['first-name']
    req.data.profile.lastName = req.body['last-name']
    req.data.profile.email = req.body.email
    return req.data.profile
  }
}
