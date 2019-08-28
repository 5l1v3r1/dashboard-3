const dashboard = require('../../../index.js')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  req.query = req.query || {}
  req.query.accountid = req.account.accountid
  const total = await global.api.user.ProfilesCount.get(req)
  const profiles = await global.api.user.Profiles.get(req)
  if (profiles && profiles.length) {
    for (const profile of profiles) {
      profile.createdFormatted = dashboard.Format.date(profile.created)
    }
  }
  const offset = req.query ? parseInt(req.query.offset, 10) || 0 : 0
  req.data = { profiles, total, offset }
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.route.html)
  const removeElements = []
  if (req.data.profiles && req.data.profiles.length) {
    dashboard.HTML.renderTable(doc, req.data.profiles, 'profile-row', 'profiles-table')
    const removeFields = ['display-name', 'display-email', 'contact-email', 'full-name', 'dob', 'phone', 'occupation', 'location', 'company-name', 'website']
    for (const field of global.userProfileFields) {
      removeFields.splice(removeFields.indexOf(field), 1)
    }
    for (const field of removeFields) {
      removeElements.push(field)
    }
    for (const profile of req.data.profiles) {
      if (req.account.profileid === profile.profileid) {
        removeElements.push(`is-not-default-${profile.profileid}`)
      } else {
        removeElements.push(`is-default-${profile.profileid}`)
      }
      for (const field of removeFields) {
        removeElements.push(`${field}-${profile.profileid}`)
      }
    }
    if (req.data.total <= global.pageSize) {
      removeElements.push('page-links')
    } else {
      dashboard.HTML.renderPagination(doc, req.data.offset, req.data.total)
    }
    removeElements.push('no-profiles')
  } else {
    removeElements.push('profiles-table')
  }
  for (const id of removeElements) {
    const element = doc.getElementById(id)
    element.parentNode.removeChild(element)
  }
  return dashboard.Response.end(req, res, doc)
}
