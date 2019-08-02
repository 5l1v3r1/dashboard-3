const dashboard = require('../../../index.js')
const navbar = require('./navbar-account.js')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  if (!req.query || !req.query.accountid) {
    throw new Error('invalid-accountid')
  }
  const total = await global.api.administrator.AccountProfilesCount.get(req)
  const profiles = await global.api.administrator.AccountProfiles.get(req)
  if (profiles && profiles.length) {
    for (const profile of profiles) {
      profile.createdFormatted = dashboard.Format.date(profile.created)
    }
  }
  const account = await global.api.administrator.Account.get(req)
  const offset = req.query ? req.query.offset || 0 : 0
  req.data = { profiles, account, total, offset }
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.route.html, req.data.account, 'account')
  await navbar.setup(doc, req.data.account)
  if (req.data.profiles && req.data.profiles.length) {
    dashboard.HTML.renderTable(doc, req.data.profiles, 'profile-row', 'profiles-table')
    if (req.data.total <= global.pageSize) {
      const pageLinks = doc.getElementById('page-links')
      pageLinks.parentNode.removeChild(pageLinks)
    } else {
      dashboard.HTML.renderPagination(doc, req.data.offset, req.data.total)
    }
    const noProfiles = doc.getElementById('no-profiles')
    noProfiles.parentNode.removeChild(noProfiles)
  } else {
    const profilesTable = doc.getElementById('profiles-table')
    profilesTable.parentNode.removeChild(profilesTable)
  }
  return dashboard.Response.end(req, res, doc)
}
