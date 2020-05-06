const dashboard = require('../../../../index.js')

module.exports = {
  get: async (req) => {
    req.query = req.query || {}
    let index
    if (req.query.accountid) {
      index = `${req.appid}/account/profiles/${req.query.accountid}`
    } else {
      index = `${req.appid}/profiles`
    }
    return dashboard.StorageList.count(index)
  }
}
