const dashboard = require('../../../../index.js')

module.exports = {
  get: async (req) => {
    req.query = req.query || {}
    let sessionids
    if (req.query.all) {
      sessionids = await dashboard.StorageList.listAll(`${req.appid}/sessions`)
    } else {
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
      sessionids = await dashboard.StorageList.list(`${req.appid}/sessions`, offset)
    }
    if (!sessionids || !sessionids.length) {
      return null
    }
    req.cacheData = await dashboard.Storage.readMany(`${req.appid}/session`, sessionids)
    const sessions = []
    for (const sessionid of sessionids) {
      req.query.sessionid = sessionid
      const session = await global.api.administrator.Session._get(req)
      sessions.push(session)
    }
    return sessions
  }
}
