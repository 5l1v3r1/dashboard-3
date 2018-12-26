const dashboard = require('../../../index.js')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  if (!req.query || !req.query.sessionid) {
    throw new Error('invalid-sessionid')
  }
  if (!req.session.administratorid) {
    throw new Error('invalid-session')
  }
}

async function renderPage (req, res) {
  try {
    await global.api.administrator.ResetSessionImpersonate.patch(req)
  } catch (error) {
    return dashboard.Response.throw500(req, res)
  }
  return dashboard.Response.redirect(req, res, `/administrator/account?accountid=${req.session.accountid}`)
}
