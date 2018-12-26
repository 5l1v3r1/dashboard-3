const dashboard = require('../../../../index.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.codeid) {
      throw new Error('invalid-codeid')
    }
    let code = await dashboard.Storage.read(`${req.appid}/${req.query.codeid}`)
    if (!code) {
      throw new Error('invalid-codeid')
    }
    try {
      code = JSON.parse(code)
    } catch (error) {
    }
    if (!code || code.object !== 'resetCode') {
      throw new Error('invalid-codeid')
    }
    if (code.accountid !== req.account.accountid) {
      throw new Error('invalid-account')
    }
    delete (code.codeHash)
    return code
  }
}
