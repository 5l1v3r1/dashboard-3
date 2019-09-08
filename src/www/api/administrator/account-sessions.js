const dashboard = require('../../../../index.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.accountid) {
      throw new Error('invalid-accountid')
    }
    const account = await global.api.administrator.Account.get(req)
    if (!account) {
      throw new Error('invalid-account')
    }
    let sessionids
    if (req.query.all) {
      sessionids = await dashboard.StorageList.listAll(`${req.appid}/account/sessions/${req.query.accountid}`)
    } else {
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
      sessionids = await dashboard.StorageList.list(`${req.appid}/account/sessions/${req.query.accountid}`, offset)
    }
    if (!sessionids || !sessionids.length) {
      return null
    }
    req.cacheData = await dashboard.Storage.readMany(`${req.appid}/session`, sessionids)
    const sessions = []
    for (const sessionid of sessionids) {
      req.query.sessionid = sessionid
      const session = await global.api.administrator.Session.get(req)
      sessions.push(session)
    }
    return sessions
  }
}
