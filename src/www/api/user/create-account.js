const dashboard = require('../../../../index.js')

module.exports = {
  auth: false,
  post: async (req) => {
    if (!req || !req.body) {
      throw new Error('invalid-username')
    }
    if (!req.body.username || !req.body.username.length) {
      throw new Error('invalid-username')
    }
    if (!req.body.password || !req.body.password.length) {
      throw new Error('invalid-password')
    }
    if (global.minimumUsernameLength > req.body.username.length ||
        global.maximumUsernameLength < req.body.username.length) {
      throw new Error('invalid-username-length')
    }
    if (global.minimumPasswordLength > req.body.password.length ||
        global.maximumPasswordLength < req.body.password.length) {
      throw new Error('invalid-password-length')
    }
    if (global.requireProfile) {
      for (const field of global.userProfileFields) {
        switch (field) {
          case 'full-name':
            if (!req.body['first-name'] || !req.body['first-name'].length) {
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
            continue
          case 'contact-email':
            if (!req.body[field] || req.body[field].indexOf('@') === -1) {
              throw new Error(`invalid-${field}`)
            }
            continue
          case 'display-email':
            if (!req.body[field] || req.body[field].indexOf('@') === -1) {
              throw new Error(`invalid-${field}`)
            }
            continue
          case 'display-name':
            if (!req.body[field] || !req.body[field].length) {
              throw new Error(`invalid-${field}`)
            }
            if (global.minimumDisplayNameLength > req.body[field].length ||
              global.maximumDisplayNameLength < req.body[field].length) {
              throw new Error('invalid-display-name-length')
            }
            continue
          case 'dob':
            if (!req.body[field] || !req.body[field].length) {
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
            continue
        }
      }
    }
    const accountid = `account_${await dashboard.UUID.generateID()}`
    let dashboardEncryptionKey = global.dashboardEncryptionKey    
    let bcryptFixedSalt = global.bcryptFixedSalt
    if (req.server) {
      dashboardEncryptionKey = req.server.dashboardEncryptionKey || dashboardEncryptionKey
      bcryptFixedSalt = req.server.bcryptFixedSalt || bcryptFixedSalt
    }
    const usernameHash = await dashboard.Hash.fixedSaltHash(req.body.username, bcryptFixedSalt, dashboardEncryptionKey)
    const passwordHash = await dashboard.Hash.randomSaltHash(req.body.password, dashboardEncryptionKey)
    const accountInfo = {
      object: 'account',
      accountid: accountid,
      usernameHash: usernameHash,
      passwordHash: passwordHash,
      sessionKey: dashboard.UUID.random(64),
      sessionKeyNumber: 1,
      created: dashboard.Timestamp.now
    }
    const otherUsersExist = await dashboard.StorageList.list(`${req.appid}/accounts`, 0, 1)
    if (!otherUsersExist) {
      accountInfo.administrator = dashboard.Timestamp.now
      accountInfo.owner = dashboard.Timestamp.now
    }
    await dashboard.Storage.write(`${req.appid}/map/usernames/${usernameHash}`, accountid)
    await dashboard.Storage.write(`${req.appid}/account/${accountid}`, accountInfo)
    await dashboard.StorageList.add(`${req.appid}/accounts`, accountid)
    if (!otherUsersExist) {
      await dashboard.StorageList.add(`${req.appid}/administrator/accounts`, accountid)
    }
    req.query = req.query || {}
    req.query.accountid = accountid
    req.body.default = 'true'
    req.account = accountInfo
    if (global.requireProfile) {
      await global.api.user.CreateProfile.post(req)
    }
    req.success = true
    return accountInfo
  }
}
