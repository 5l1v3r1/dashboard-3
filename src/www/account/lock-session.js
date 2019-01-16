const dashboard = require('../../../index.js')

module.exports = {
  get: renderPage
}

async function renderPage(req, res) {
  req.query = req.query || {}
  req.query.sessionid = req.session.sessionid
  try {
    req.session = await global.api.user.ResetSessionUnlocked._patch(req)
  } catch (error) {
    if (error.message === 'invalid-session') {
      return dashboard.Response.throw500(req, res, error)
    }
    return dashboard.Response.throw500(req, res)
  }
  return dashboard.Response.redirect(req, res, req.query.returnURL || '/home')
}
