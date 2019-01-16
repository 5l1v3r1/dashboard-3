const dashboard = require('../../../index.js')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  if (!req.query || !req.query.accountid) {
    throw new Error('invalid-accountid')
  }
  const account = await global.api.administrator.Account._get(req)
  account.createdFormatted = dashboard.Timestamp.date(account.created)
  account.lastSignedIn = dashboard.Timestamp.date(account.lastSignedIn)
  req.query.profileid = account.profileid
  const profiles = await global.api.administrator.AccountProfiles._get(req)
  if (profiles && profiles.length) {
    for (const profile of profiles) {
      profile.createdFormatted = dashboard.Timestamp.date(profile.created)
    }
  }
  const sessions = await global.api.administrator.AccountSessions._get(req)
  if (sessions && sessions.length) {
    for (const session of sessions) {
      session.createdFormatted = dashboard.Timestamp.date(session.created)
      session.expiresFormatted = dashboard.Timestamp.date(session.expires)
    }
  }
  const resetCodes = await global.api.administrator.AccountResetCodes._get(req)
  if (resetCodes && resetCodes.length) {
    for (const resetCode of resetCodes) {
      resetCode.created = dashboard.Timestamp.date(resetCode.created)
    }
  }
  req.data = { account, profiles, sessions, resetCodes }
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.route.html, req.data.account, 'account')
  if (req.data.sessions && req.data.sessions.length) {
    dashboard.HTML.renderTable(doc, req.data.sessions, 'session-row', 'sessions-table')
  } else {
    const sessionsTable = doc.getElementById('sessions-table')
    sessionsTable.parentNode.removeChild(sessionsTable)
  }
  if (req.data.resetCodes && req.data.resetCodes.length) {
    dashboard.HTML.renderTable(doc, req.data.resetCodes, 'reset-code-row', 'reset-codes-table')
  } else {
    const resetCodesTable = doc.getElementById('reset-codes-table')
    resetCodesTable.parentNode.removeChild(resetCodesTable)
  }
  if (req.data.profiles && req.data.profiles.length) {
    dashboard.HTML.renderTable(doc, req.data.profiles, 'profile-row', 'profiles-table')
  } else {
    const profilesTable = doc.getElementById('profiles-table')
    profilesTable.parentNode.removeChild(profilesTable)
  }
  return dashboard.Response.end(req, res, doc)
}
