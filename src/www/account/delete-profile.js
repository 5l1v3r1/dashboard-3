const dashboard = require('../../../index.js')
const navbar = require('./navbar-profile.js')

module.exports = {
  before: beforeRequest,
  get: renderPage,
  post: submitForm
}

async function beforeRequest (req) {
  if (!req.query || !req.query.profileid) {
    throw new Error('invalid-profileid')
  }
  const profile = await global.api.user.Profile.get(req)
  if (!profile) {
    throw new Error('invalid-profileid')
  }
  if (profile.profileid === req.account.profileid) {
    throw new Error('invalid-profile')
  }
  profile.createdFormatted = dashboard.Format.date(profile.created)
  profile.default = req.account.profileid === profile.profileid
  req.data = { profile }
}

async function renderPage (req, res, messageTemplate) {
  if (req.success) {
    if (req.query && req.query.returnURL && req.query.returnURL.indexOf('/') === 0) {
      return dashboard.Response.redirect(req, res, decodeURI(req.query.returnURL))
    }
    messageTemplate = 'success'
    return dashboard.Response.redirect(req, res, `/account/profiles`)
  } else if (req.error) {
    messageTemplate = req.error
  }
  const doc = dashboard.HTML.parse(req.route.html, req.data.profile, 'profile')
  await navbar.setup(doc, req.data.profile)
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
    if (messageTemplate === 'success') {
      const submitForm = doc.getElementById('submit-form')
      submitForm.parentNode.removeChild(submitForm)
    }
  }
  return dashboard.Response.end(req, res, doc)
}

async function submitForm (req, res) {
  try {
    await global.api.user.DeleteProfile.delete(req)
    if (req.success) {
      return renderPage(req, res, 'success')
    }
    return renderPage(req, res, 'unknown-error')
  } catch (error) {
    return renderPage(req, res, error.message)
  }
}
