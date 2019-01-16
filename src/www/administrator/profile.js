const dashboard = require('../../../index.js')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  if (!req.query || !req.query.profileid) {
    throw new Error('invalid-profileid')
  }
  const profile = await global.api.administrator.Profile._get(req)
  if (!profile) {
    throw new Error('invalid-profile')
  }
  profile.createdFormatted = dashboard.Timestamp.date(profile.created)
  req.data = { profile }
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.route.html, req.data.profile, 'profile')
  return dashboard.Response.end(req, res, doc)
}
