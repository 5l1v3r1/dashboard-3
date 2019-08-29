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
  const removeFields = [].concat(global.profileFields)
  if (!global.requireProfile) {
    for (const id of removeFields) {
      const element = doc.getElementById(`${id}-container`)
      element.parentNode.removeChild(element)
    }
  } else {
    const profileFields = req.profileFields || global.userProfileFields
    for (const field of profileFields) {
      removeFields.splice(removeFields.indexOf(`${field}-container`))
    }
    for (const id of removeFields) {
      const element = doc.getElementById(`${id}-container`)
      if (!element || !element.parentNode) {
        continue
      }
      element.parentNode.removeChild(element)
    }
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
  if (global.requireProfile) {
    const profileFields = req.profileFields || global.userProfileFields
    for (const field of profileFields) {
      switch (field) {
        case 'full-name':
          if (!req.body['first-name'] || !req.body['first-name'].length) {
            return renderPage(req, res, 'invalid-first-name')
          }
          if (global.minimumFirstNameLength > req.body['first-name'].length ||
            global.maximumFirstNameLength < req.body['first-name'].length) {
            return renderPage(req, res, 'invalid-first-name-length')
          }
          if (!req.body['last-name'] || !req.body['last-name'].length) {
            return renderPage(req, res, 'invalid-last-name')
          }
          if (global.minimumLastNameLength > req.body['last-name'].length ||
            global.maximumLastNameLength < req.body['last-name'].length) {
            return renderPage(req, res, 'invalid-last-name-length')
          }
          continue
        case 'contact-email':
          if (!req.body[field] || req.body[field].indexOf('@') === -1) {
            return renderPage(req, res, `invalid-${field}`)
          }
          continue
        case 'display-email':
          if (!req.body[field] || req.body[field].indexOf('@') === -1) {
            return renderPage(req, res, `invalid-${field}`)
          }
          continue
        case 'display-name':
          if (!req.body[field] || !req.body[field].length) {
            return renderPage(req, res, `invalid-${field}`)
          }
          if (global.minimumDisplayNameLength > req.body[field].length ||
            global.maximumDisplayNameLength < req.body[field].length) {
            return renderPage(req, res, 'invalid-display-name-length')
          }
          continue
        case 'dob':
          if (!req.body[field] || !req.body[field].length) {
            return renderPage(req, res, `invalid-${field}`)
          }
          let date
          try {
            date = dashboard.Format.parseDate(req.body[field])
          } catch (error) {
          }
          if (!date || !date.getFullYear) {
            return renderPage(req, res, `invalid-${field}`)
          }
          continue
        default:
          if (!req.body || !req.body[field]) {
            return renderPage(req, res, `invalid-${field}`)
          }
          continue
      }
    }
  }
  try {
    await global.api.user.CreateAccount.post(req)
  } catch (error) {
    return renderPage(req, res, error.message)
  }
  req.route = global.sitemap['/account/signin']
  return req.route.api.post(req, res)
}
