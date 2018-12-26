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
    if (req.body && req.body.passwordHash) {
      return
    }
    if (!req.body || !req.body.password) {
      throw new Error('invalid-password')
    }
    if (global.minimumPasswordLength > req.body.password.length ||
      global.maximumPasswordLength < req.body.password.length) {
      throw new Error('invalid-password-length')
    }
    req.body.passwordHash = dashboard.Hash.randomSaltHash(req.body.password)
    delete (req.body.password)
  },
  patch: async (req) => {
    req.account.passwordLastChanged = dashboard.Timestamp.now
    await dashboard.StorageObject.setProperty(`${req.appid}/${req.query.accountid}`, 'passwordHash', req.body.passwordHash)
    await dashboard.StorageObject.setProperty(`${req.appid}/${req.query.accountid}`, 'passwordLastChanged', dashboard.Timestamp.now)
    req.success = true
    return req.account
  }
}
