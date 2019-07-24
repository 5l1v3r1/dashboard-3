const dashboard = require('../../../index.js')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  req.query = req.query || {}
  req.query.accountid = req.account.accountid
  const total = await global.api.user.SessionsCount.get(req)
  const sessions = await global.api.user.Sessions.get(req)
  for (const session of sessions) {
    session.createdFormatted = dashboard.Timestamp.date(session.created)
    session.expiresFormatted = dashboard.Timestamp.date(session.expires)
  }
  const important = []
  if (req.account.lastSignedIn) {
    important.push({
      object: 'important',
      date: dashboard.Format.date(dashboard.Timestamp.date(req.account.lastSignedIn)),
      id: 'last-signin',
      itemid: 2
    })
  } else {
    important.push({
      object: 'important',
      date: '',
      id: 'last-signin',
      itemid: 2
    })
  }
  if (req.account.sessionKeyLastReset) {
    important.push({
      object: 'important',
      date: dashboard.Format.date(dashboard.Timestamp.date(req.account.sessionKeyLastReset)),
      id: 'last-reset',
      itemid: 1
    })
  } else {
    important.push({
      object: 'important',
      date: '',
      id: 'last-reset',
      itemid: 1
    })
  }
  const offset = req.query ? req.query.offset || 0 : 0
  req.data = { sessions, important, total, offset }
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.route.html)
  if (req.data.sessions && req.data.sessions.length) {
    dashboard.HTML.renderTable(doc, req.data.sessions, 'session-row', 'sessions-table')
    dashboard.HTML.renderList(doc, req.data.important, 'important-item', 'important-items-list')
    if (req.data.total <= global.pageSize) {
      const pageLinks = doc.getElementById('page-links')
      pageLinks.parentNode.removeChild(pageLinks)
    } else {
      dashboard.HTML.renderPagination(doc, req.data.offset, req.data.total)
    }
    for (const item of req.data.important) {
      if (item.id !== 'last-reset') {
        const element = doc.getElementById(`last-reset-${item.itemid}`)
        element.parentNode.removeChild(element)
      }
      if (item.id !== 'last-signin') {
        const element = doc.getElementById(`last-signin-${item.itemid}`)
        element.parentNode.removeChild(element)
      }
    }
    const noSessions = doc.getElementById('no-sessions')
    noSessions.parentNode.removeChild(noSessions)
  } else {
    const sessionsTable = doc.getElementById('sessions-table')
    sessionsTable.parentNode.removeChild(sessionsTable)
  }
  return dashboard.Response.end(req, res, doc)
}
