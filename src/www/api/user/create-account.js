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
    if (global.minimumUsernameLength > req.body.username.length) {
      throw new Error('invalid-username-length')
    }
    if (global.minimumPasswordLength > req.body.password.length) {
      throw new Error('invalid-password-length')
    }
    // profile requirements
    if (global.requireProfileEmail) {
      if (!req.body.email || !req.body.email.length || !req.body.email.indexOf('@') > 0) {
        throw new Error('invalid-profile-email')
      }
    }
    if (global.requireProfileName) {
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
    }
    // create account and default profile
    const accountid = `account_${await dashboard.UUID.generateID()}`
    const profileid = `profile_${await dashboard.UUID.generateID()}`
    const profileInfo = {
      object: 'profile',
      accountid: accountid,
      profileid: profileid,
      created: dashboard.Timestamp.now
    }
    if (req.body.email) {
      profileInfo.email = req.body.email
    }
    if (req.body['first-name']) {
      profileInfo.firstName = req.body['first-name']
    }
    if (req.body['last-name']) {
      profileInfo.lastName = req.body['last-name']
    }
    const usernameHash = dashboard.Hash.fixedSaltHash(req.body.username, req.alternativeFixedSalt, req.alternativeDashboardEncryptionKey)
    const passwordHash = dashboard.Hash.randomSaltHash(req.body.password, req.alternativeWorkloadFactor, req.alternativeDashboardEncryptionKey)
    const accountInfo = {
      object: 'account',
      accountid: accountid,
      profileid: profileid,
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
    await dashboard.Storage.write(`${req.appid}/${accountid}`, accountInfo)
    await dashboard.Storage.write(`${req.appid}/${profileid}`, profileInfo)
    await dashboard.StorageObject.setProperty(`${req.appid}/${accountid}`, 'profileid', profileid)
    await dashboard.StorageList.add(`${req.appid}/accounts`, accountid)
    await dashboard.StorageList.add(`${req.appid}/profiles`, profileid)
    await dashboard.StorageList.add(`${req.appid}/account/profiles/${accountid}`, profileid)
    if (!otherUsersExist) {
      await dashboard.StorageList.add(`${req.appid}/administrator/accounts`, accountid)
    }
    req.success = true
    return accountInfo
  }
}
