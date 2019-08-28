const dashboard = require('../../../index.js')
const navbar = require('./navbar-profile.js')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  if (!req.query || !req.query.profileid) {
    throw new Error('invalid-profileid')
  }
  const profile = await global.api.user.Profile.get(req)
  if (!profile) {
    throw new Error('invalid-profile')
  }
  if (profile.accountid !== req.account.accountid) {
    throw new Error('invalid-account')
  }
  profile.createdFormatted = dashboard.Format.date(profile.created)
  req.data = { profile }
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.route.html, req.data.profile, 'profile')
  await navbar.setup(doc, req.data.profile)
  if (req.account.profileid === req.query.profileid) {
    const notDefault = doc.getElementById('is-not-default')
    notDefault.parentNode.removeChild(notDefault)
  } else {
    const isDefault = doc.getElementById('is-default')
    isDefault.parentNode.removeChild(isDefault)
  }
  const removeFields = ['display-name', 'display-email', 'contact-email', 'full-name', 'dob', 'phone', 'occupation', 'location', 'company-name', 'website']
  for (const field of global.userProfileFields) {
    removeFields.splice(removeFields.indexOf(`${field}-${req.data.profile.profileid}`))
  }
  for (const id of removeFields) {
    const element = doc.getElementById(id)
    element.parentNode.removeChild(element)
  }
  return dashboard.Response.end(req, res, doc)
}
