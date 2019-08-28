const dashboard = require('../../../../index.js')

module.exports = {
  patch: async (req) => {
    if (!req.query || !req.query.profileid) {
      throw new Error('invalid-profileid')
    }
    const profile = await global.api.user.Profile.get(req)
    if (!profile) {
      throw new Error('invalid-profileid')
    }
    const profileInfo = {}
    for (const field of global.userProfileFields) {
      switch (field) {
        case 'full-name':
          if (!req.body || !req.body['first-name'] || !req.body['first-name'].length) {
            throw new Error('invalid-first-name')
          }
          if (global.minimumFirstNameLength > req.body['first-name'].length ||
            global.maximumFirstNameLength < req.body['first-name'].length) {
            throw new Error('invalid-first-name-length')
          }
          if (!req.body['last-name'] || !req.body['last-name'].length) {
            throw new Error('invalid-last-name')
          }
          if (global.minimumLastNameLength > req.body['last-name'].length ||
            global.maximumLastNameLength < req.body['last-name'].length) {
            throw new Error('invalid-last-name-length')
          }
          profileInfo.firstName = req.body['first-name']
          profileInfo.lastName = req.body['last-name']
          continue
        case 'contact-email':
          if (!req.body || !req.body[field] || req.body[field].indexOf('@') === -1) {
            throw new Error(`invalid-${field}`)
          }
          profileInfo.contactEmail = req.body[field]
          continue
        case 'display-email':
          if (!req.body || !req.body[field] || req.body[field].indexOf('@') === -1) {
            throw new Error(`invalid-${field}`)
          }
          profileInfo.displayEmail = req.body[field]
          continue
        case 'display-name':
          if (!req.body || !req.body[field] || !req.body[field].length) {
            throw new Error(`invalid-${field}`)
          }
          if (global.minimumDisplayNameLength > req.body[field].length ||
            global.maximumDisplayNameLength < req.body[field].length) {
            throw new Error('invalid-display-name-length')
          }
          profileInfo.displayName = req.body[field]
          continue
        case 'dob':
          if (!req.body || !req.body[field] || !req.body[field].length) {
            throw new Error(`invalid-${field}`)
          }
          let date
          try {
            date = dashboard.Format.parseDate(req.body[field])
          } catch (error) {
          }
          if (!date || !date.getFullYear) {
            throw new Error(`invalid-${field}`)
          }
          profileInfo.dob = dashboard.Format.date(date)
          continue
        default:
          if (!req.body || !req.body[field]) {
            throw new Error(`invalid-${field}`)
          }
          let displayName = field
          if (displayName.indexOf('-') > -1) {
            displayName = displayName.split('-')
            if (displayName.length === 1) {
              displayName = displayName[0]
            } else if (displayName.length === 2) {
              displayName = displayName[0] + displayName[1].substring(0, 1).toUpperCase() + displayName[1].substring(1)
            } else if (displayName.length === 3) {
              displayName = displayName[0] + displayName[1].substring(0, 1).toUpperCase() + displayName[1].substring(1) + displayName[2].substring(0, 1).toUpperCase() + displayName[2].substring(1)
            }
          }
          profileInfo[displayName] = req.body[field]
          continue
      }
    }
    await dashboard.StorageObject.setProperties(`${req.appid}/profile/${req.query.profileid}`, profileInfo)
    if (req.query.profileid === req.account.profileid || req.body.default === 'true') {
      await dashboard.StorageObject.setProperties(`${req.appid}/account/${req.account.accountid}`, {
        profileid: req.query.profileid,
        firstName: profileInfo.firstName,
        lastName: profileInfo.lastName,
        email: profileInfo.contactEmail
      })
    }
    req.success = true
    for (const field in profileInfo) {
      profile[field] = profileInfo[field]
    }
    return profile
  }
}
