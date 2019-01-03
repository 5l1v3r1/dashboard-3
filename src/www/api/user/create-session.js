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
    const usernameHash = dashboard.Hash.fixedSaltHash(req.body.username, req.alternativeFixedSalt, req.alternativeDashboardEncryptionKey)
    const accountid = await dashboard.Storage.read(`${req.appid}/map/usernames/${usernameHash}`)
    if (!accountid) {
      throw new Error('invalid-username')
    }
    const passwordHash = await dashboard.StorageObject.getProperty(`${req.appid}/account/${accountid}`, 'passwordHash')
    const validPassword = dashboard.Hash.randomSaltCompare(req.body.password, passwordHash, req.alternativeDashboardEncryptionKey)
    if (!validPassword) {
      throw new Error('invalid-password')
    }
    const accountReq = { query: { accountid }, appid: req.appid, account: { accountid } }
    const account = await global.api.user.Account._get(accountReq)
    let expireSeconds
    switch (req.body.remember) {
      case 'hours':
        expireSeconds = 8 * 60 * 60
        break
      case 'days':
        expireSeconds = 30 * 24 * 60 * 60
        break
      default:
        expireSeconds = 20 * 60
        break
    }
    const sessionid = `session_${await dashboard.UUID.generateID()}`
    const sessionToken = dashboard.UUID.random(64)
    const dashboardSessionKey = req.alternativeSessionKey || global.sessionKey
    const tokenHash = dashboard.Hash.fixedSaltHash(`${accountid}/${sessionToken}/${account.sessionKey}/${dashboardSessionKey}`, req.alternativeFixedSalt, req.alternativeDashboardEncryptionKey)
    const sessionInfo = {
      object: 'session',
      sessionid: sessionid,
      accountid: accountid,
      tokenHash: tokenHash,
      created: dashboard.Timestamp.now,
      expires: dashboard.Timestamp.now + expireSeconds,
      sessionKeyNumber: account.sessionKeyNumber
    }
    await dashboard.StorageObject.setProperty(`${req.appid}/account/${account.accountid}`, 'lastSignedIn', dashboard.Timestamp.now)
    await dashboard.Storage.write(`${req.appid}/session/${sessionid}`, sessionInfo)
    await dashboard.Storage.write(`${req.appid}/map/sessionids/${sessionid}`, accountid)
    await dashboard.StorageList.add(`${req.appid}/sessions`, sessionid)
    await dashboard.StorageList.add(`${req.appid}/account/sessions/${accountid}`, sessionid)
    req.session = sessionInfo
    req.session.token = sessionToken
    req.success = true
    return req.session
  }
}
