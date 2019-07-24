const dashboard = require('../../../../index.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.accountid) {
      throw new Error('invalid-accountid')
    }
    let profileids
    if (req.query.all) {
      profileids = await dashboard.StorageList.listAll(`${req.appid}/account/profiles/${req.query.accountid}`)
    } else {
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
      profileids = await dashboard.StorageList.list(`${req.appid}/account/profiles/${req.query.accountid}`, offset)
    }
    if (!profileids || !profileids.length) {
      return null
    }
    req.cacheData = await dashboard.Storage.readMany(`${req.appid}/profile`, profileids)
    const profiles = []
    for (const profileid of profileids) {
      req.query.profileid = profileid
      const profile = await global.api.administrator.Profile.get(req)
      profiles.push(profile)
    }
    return profiles
  }
}
