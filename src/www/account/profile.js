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
  const removeFields = [].concat(global.profileFields)
  const usedFields = []
  for (const field of removeFields) {
    if (usedFields.indexOf(field) > -1) {
      continue
    }
    let displayName = field
    if (displayName.indexOf('-') > -1) {
      displayName = displayName.split('-')
      if (displayName.length === 1) {
        displayName = displayName[0]
      } else if (displayName.length === 2) {
        displayName = displayName[0] + displayName[1].substring(0, 1).toUpperCase() + displayName[1].substring(1)
      } else if (displayName.length === 3) {
        displayName = displayName[0] + displayName[1].substring(0, 1).toUpperCase() + displayName[1].substring(1) + displayName[2].substring(0, 1).toUpperCase() + displayName[2].substring(1)
      }
    }
    if (displayName === 'fullName') {
      if (req.data.profile.firstName &&
        removeFields.indexOf('full-name') > -1 &&
        usedFields.indexOf(field) === -1) {
        usedFields.push(field)
      }
      continue
    }
    if (req.data.profile[displayName] &&
      removeFields.indexOf(field) > -1 &&
      usedFields.indexOf(field) === -1) {
      usedFields.push(field)
    }
  }
  for (const id of removeFields) {
    if (usedFields.indexOf(id) === -1) {
      const element = doc.getElementById(id)
      element.parentNode.removeChild(element)
    }
  }
  return dashboard.Response.end(req, res, doc)
}
