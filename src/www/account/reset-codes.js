const dashboard = require('../../../index.js')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  const important = []
  if (req.account.resetCodeLastCreated) {
    important.push({
      object: 'important',
      date: dashboard.Format.date(dashboard.Timestamp.date(req.account.resetCodeLastCreated)),
      id: 'last-created',
      itemid: 1
    })
  } else {
    important.push({
      object: 'important',
      date: '',
      id: 'last-created',
      itemid: 1
    })
  }
  if (req.account.resetCodeLastDeleted) {
    important.push({
      object: 'important',
      date: dashboard.Format.date(dashboard.Timestamp.date(req.account.resetCodeLastDeleted)),
      id: 'last-deleted',
      itemid: 2
    })
  } else {
    important.push({
      object: 'important',
      date: '',
      id: 'last-deleted',
      itemid: 2
    })
  }
  if (req.account.resetCodeLastUsed) {
    important.push({
      object: 'important',
      date: dashboard.Format.date(dashboard.Timestamp.date(req.account.resetCodeLastUsed)),
      id: 'last-used',
      itemid: 3
    })
  } else {
    important.push({
      object: 'important',
      date: '',
      id: 'last-used',
      itemid: 3
    })
  }
  req.query = req.query || {}
  req.query.accountid = req.account.accountid
  const total = await global.api.user.ResetCodesCount.get(req)
  const resetCodes = await global.api.user.ResetCodes.get(req)
  if (resetCodes && resetCodes.length) {
    for (const code of resetCodes) {
      code.createdFormatted = dashboard.Format.date(code.created)
    }
  }
  const offset = req.query ? req.query.offset || 0 : 0
  req.data = {
    resetCodes,
    important,
    total,
    offset
  }
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.route.html)
  dashboard.HTML.renderList(doc, req.data.important, 'important-item', 'important-items-list')
  for (const item of req.data.important) {
    if (item.id !== `last-deleted`) {
      const element = doc.getElementById(`last-deleted-${item.itemid}`)
      element.parentNode.removeChild(element)
    }
    if (item.id !== `last-created`) {
      const element = doc.getElementById(`last-created-${item.itemid}`)
      element.parentNode.removeChild(element)
    }
    if (item.id !== `last-used`) {
      const element = doc.getElementById(`last-used-${item.itemid}`)
      element.parentNode.removeChild(element)
    }
  }
  if (req.data.resetCodes && req.data.resetCodes.length) {
    dashboard.HTML.renderTable(doc, req.data.resetCodes, 'reset-code-row', 'reset-codes-table')
    if (req.data.total <= global.pageSize) {
      const pageLinks = doc.getElementById('page-links')
      pageLinks.parentNode.removeChild(pageLinks)
    } else {
      dashboard.HTML.renderPagination(doc, req.data.offset, req.data.total)
    }
    const noResetCodes = doc.getElementById('no-reset-codes')
    noResetCodes.parentNode.removeChild(noResetCodes)
  } else {
    const resetCodesTable = doc.getElementById('reset-codes-table')
    resetCodesTable.parentNode.removeChild(resetCodesTable)
  }
  return dashboard.Response.end(req, res, doc)
}
