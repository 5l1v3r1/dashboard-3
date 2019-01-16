const dashboard = require('../../../index.js')

module.exports = {
  get: renderPage,
  post: submitForm
}

function renderPage (req, res, messageTemplate) {
  const requirements = {
    object: 'requirements',
    minimumUsernameLength: global.minimumUsernameLength,
    minimumPasswordLength: global.minimumPasswordLength
  }
  const doc = dashboard.HTML.parse(req.route.html, requirements, 'requirements')
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
  }
  if (!global.requireProfileEmail) {
    const emailContainer = doc.getElementById('email-container')
    emailContainer.parentNode.removeChild(emailContainer)
  }
  if (!global.requireProfileName) {
    const firstNameContainer = doc.getElementById('first-name-container')
    firstNameContainer.parentNode.removeChild(firstNameContainer)
    const lastNameContainer = doc.getElementById('last-name-container')
    lastNameContainer.parentNode.removeChild(lastNameContainer)
  }
  return dashboard.Response.end(req, res, doc)
}

async function submitForm (req, res) {
  if (!req || !req.body) {
    return renderPage(req, res, 'invalid-username')
  }
  if (!req.body.username || !req.body.username.length) {
    return renderPage(req, res, 'invalid-username')
  }
  if (!req.body.password || !req.body.password.length) {
    return renderPage(req, res, 'invalid-password')
  }
  if (global.minimumUsernameLength > req.body.username.length) {
    return renderPage(req, res, 'invalid-username-length')
  }
  if (global.minimumPasswordLength > req.body.password.length) {
    return renderPage(req, res, 'invalid-password-length')
  }
  if (req.body.confirm !== req.body.password) {
    return renderPage(req, res, 'invalid-confirm')
  }
  // optional profile fields
  if (global.requireProfileEmail) {
    if (!req.body.email || !req.body.email.length || !req.body.email.indexOf('@') > 0) {
      return renderPage(req, res, 'invalid-profile-email')
    }
  }
  if (global.requireProfileName) {
    if (!req.body['first-name'] || !req.body['first-name'].length) {
      return renderPage(req, res, 'invalid-profile-first-name')
    }
    if (global.minimumProfileFirstNameLength > req.body['first-name'].length ||
      global.maximumProfileFirstNameLength < req.body['first-name'].length) {
      return renderPage(req, res, 'invalid-profile-first-name-length')
    }
    if (!req.body['last-name'] || !req.body['last-name'].length) {
      return renderPage(req, res, 'invalid-profile-last-name')
    }
    if (global.minimumProfileLastNameLength > req.body['last-name'].length ||
      global.maximumProfileLastNameLength < req.body['last-name'].length) {
      return renderPage(req, res, 'invalid-profile-last-name-length')
    }
  }
  try {
    await global.api.user.CreateAccount._post(req)
  } catch (error) {
    return renderPage(req, res, error.message)
  }
  req.route = global.sitemap['/account/signin']
  return req.route.api.post(req, res)
}
