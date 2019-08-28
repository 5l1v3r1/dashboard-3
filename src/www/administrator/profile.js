const dashboard = require('../../../index.js')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  if (!req.query || !req.query.profileid) {
    throw new Error('invalid-profileid')
  }
  const profile = await global.api.administrator.Profile.get(req)
  if (!profile) {
    throw new Error('invalid-profile')
  }
  profile.createdFormatted = dashboard.Format.date(profile.created)
  req.data = { profile }
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.route.html, req.data.profile, 'profile')
  const removeFields = ['display-name', 'display-email', 'contact-email', 'full-name', 'dob', 'phone', 'occupation', 'location', 'company-name', 'website', 'address-line1', 'address-line2', 'address-city', 'address-state', 'address-postal-code', 'address-country']
  for (const field of global.userProfileFields) {
    removeFields.splice(removeFields.indexOf(`${field}-${req.data.profile.profileid}`))
  }
  for (const id of removeFields) {
    const element = doc.getElementById(id)
    element.parentNode.removeChild(element)
  }
  return dashboard.Response.end(req, res, doc)
}
