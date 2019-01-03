const dashboard = require('../../../../index.js')

module.exports = {
  lock: true,
  before: async (req) => {
    if (!req.query || !req.query.accountid) {
      throw new Error('invalid-accountid')
    }
    if (req.query.accountid !== req.account.accountid) {
      throw new Error('invalid-account')
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
  },
  post: async (req) => {
    const profileid = `profile_${await dashboard.UUID.generateID()}`
    const profileInfo = {
      object: 'profile',
      accountid: req.query.accountid,
      profileid: profileid,
      created: dashboard.Timestamp.now,
      firstName: req.body['first-name'],
      lastName: req.body['last-name'],
      email: req.body.email
    }
    await dashboard.Storage.write(`${req.appid}/profile/${profileid}`, profileInfo)
    await dashboard.StorageList.add(`${req.appid}/profiles`, profileid)
    await dashboard.StorageList.add(`${req.appid}/account/profiles/${req.query.accountid}`, profileid)
    if (req.body.default === 'true') {
      await dashboard.StorageObject.setProperty(`${req.appid}/account/${req.query.accountid}`, 'profileid', profileid)
    }
    req.success = true
    return profileInfo
  }
}
