const dashboard = require('../../../../index.js')

module.exports = {
  get: async (req) => {
    req.query = req.query || {}
    let codeids
    if (req.query.all) {
      codeids = await dashboard.StorageList.listAll(`${req.appid}/resetCodes`)
    } else {
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
      codeids = await dashboard.StorageList.list(`${req.appid}/resetCodes`, offset)
    }
    if (!codeids || !codeids.length) {
      return null
    }
    req.cacheData = await dashboard.Storage.readMany(`${req.appid}/resetCode`, codeids)
    const resetCodes = []
    for (const codeid of codeids) {
      req.query.codeid = codeid
      const resetCode = await global.api.administrator.ResetCode.get(req)
      resetCodes.push(resetCode)
    }
    return resetCodes
  }
}
