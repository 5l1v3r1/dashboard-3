const dashboard = require('../../../../index.js')

module.exports = {
  lock: true,
  before: async (req) => {
    if (!req.query || !req.query.sessionid) {
      throw new Error('invalid-sessionid')
    }
    if (req.query.sessionid !== req.session.sessionid) {
      throw new Error('invalid-session')
    }
    if (!req.body || !req.body.accountid) {
      throw new Error('invalid-accountid')
    }
    if (req.account.accountid === req.body.accountid) {
      throw new Error('invalid-account')
    }
    req.query.accountid = req.body.accountid
    const account = await global.api.administrator.Account.get(req)
    if (!account) {
      throw new Error('invalid-accountid')
    }
    if (account.deleted) {
      throw new Error('invalid-account')
    }
    req.data = { account }
  },
  patch: async (req) => {
    const sessionid = `session_${await dashboard.UUID.generateID()}`
    const token = dashboard.UUID.random(64)
    const dashboardSessionKey = req.alternativeSessionKey || global.sessionKey
    const tokenHash = dashboard.Hash.fixedSaltHash(`${req.data.account.accountid}/${token}/${req.data.account.sessionKey}/${dashboardSessionKey}`, req.alternativeFixedSalt, req.alternativeDashboardEncryptionKey)
    const sessionInfo = {
      object: 'session',
      sessionid: sessionid,
      accountid: req.body.accountid,
      tokenHash: tokenHash,
      created: dashboard.Timestamp.now,
      expires: dashboard.Timestamp.now + (20 * 60),
      sessionKeyNumber: req.data.account.sessionKeyNumber,
      administratorid: req.account.accountid,
      impersonator: req.session.sessionid
    }
    await dashboard.Storage.write(`${req.appid}/map/sessionids/${sessionid}`, req.body.accountid)
    await dashboard.Storage.write(`${req.appid}/session/${sessionid}`, sessionInfo)
    await dashboard.StorageObject.setProperty(`${req.appid}/session/${req.query.sessionid}`, 'impersonate', sessionid)
    await dashboard.StorageList.add(`${req.appid}/sessions`, sessionid)
    await dashboard.StorageList.add(`${req.appid}/account/sessions/${req.body.accountid}`, sessionid)
    await dashboard.Storage.write(`${req.appid}/map/sessionids/${sessionid}`, req.body.accountid)
    req.success = true
    sessionInfo.token = token
    return sessionInfo
  }
}
