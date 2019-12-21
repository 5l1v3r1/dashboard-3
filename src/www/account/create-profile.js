const dashboard = require('../../../index.js')

module.exports = {
  get: renderPage,
  post: submitForm
}

function renderPage (req, res, messageTemplate) {
  if (req.success) {
    if (req.query && req.query['return-url']) {
      return dashboard.Response.redirect(req, res, decodeURI(req.query['return-url']))
    }
    messageTemplate = 'success'
  } else if (req.error) {
    messageTemplate = req.error
  }
  const doc = dashboard.HTML.parse(req.route.html)
  const removeFields = ['display-name', 'display-email', 'contact-email', 'full-name', 'dob', 'phone', 'occupation', 'location', 'company-name', 'website']
  const profileFields = req.userProfileFields || global.userProfileFields
  for (const field of profileFields) {
    removeFields.splice(removeFields.indexOf(field), 1)
  }
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
    if (messageTemplate === 'success') {
      removeFields.push('submit-form')
    }
  }
  for (const id of removeFields) {
    const element = doc.getElementById(`${id}-container`)
    if (!element || !element.parentNode) {
      continue
    }
    element.parentNode.removeChild(element)
  }
  return dashboard.Response.end(req, res, doc)
}

async function submitForm (req, res) {
  if (!req || !req.body) {
    return renderPage(req, res)
  }
  const profileFields = req.userProfileFields || global.userProfileFields
  for (const field of profileFields) {
    if (req.body[field] && req.body[field].trim) {
      req.body[field] = req.body[field].trim()
    }
    switch (field) {
      case 'full-name':
        if (req.body['first-name'] && req.body['first-name'].trim) {
          req.body['first-name'] = req.body['first-name'].trim()
        }
        if (!req.body['first-name'] || !req.body['first-name'].length) {
          return renderPage(req, res, 'invalid-first-name')
        }
        if (global.minimumProfileFirstNameLength > req.body['first-name'].length ||
          global.maximumProfileFirstNameLength < req.body['first-name'].length) {
          return renderPage(req, res, 'invalid-first-name-length')
        }
        if (req.body['last-name'] && req.body['last-name'].trim) {
          req.body['last-name'] = req.body['last-name'].trim()
        }
        if (!req.body['last-name'] || !req.body['last-name'].length) {
          return renderPage(req, res, 'invalid-last-name')
        }
        if (global.minimumProfileLastNameLength > req.body['last-name'].length ||
          global.maximumProfileLastNameLength < req.body['last-name'].length) {
          return renderPage(req, res, 'invalid-last-name-length')
        }
        continue
      case 'contact-email':
        if (!req.body[field] || req.body[field].indexOf('@') < 1) {
          return renderPage(req, res, `invalid-${field}`)
        }
        continue
      case 'display-email':
        if (!req.body[field] || req.body[field].indexOf('@') < 1) {
          return renderPage(req, res, `invalid-${field}`)
        }
        continue
      case 'display-name':
        if (!req.body[field] || !req.body[field].length) {
          return renderPage(req, res, `invalid-${field}`)
        }
        if (global.minimumProfileDisplayNameLength > req.body[field].length ||
          global.maximumProfileDisplayNameLength < req.body[field].length) {
          return renderPage(req, res, 'invalid-display-name-length')
        }
        continue
      case 'company-name':
        if (!req.body[field] || !req.body[field].length) {
          return renderPage(req, res, `invalid-${field}`)
        }
        if (global.minimumProfileCompanyNameLength > req.body[field].length ||
          global.maximumProfileCompanyNameLength < req.body[field].length) {
          return renderPage(req, res, 'invalid-company-name-length')
        }
        continue
      case 'dob':
        if (!req.body[field] || !req.body[field].length) {
          return renderPage(req, res, `invalid-${field}`)
        }
        try {
          const date = dashboard.Format.parseDate(req.body[field])
          if (!date || !date.getFullYear) {
            return renderPage(req, res, `invalid-${field}`)
          }
        } catch (error) {
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
  try {
    req.query = req.query || {}
    req.query.accountid = req.account.accountid
    await global.api.user.CreateProfile.post(req)
    if (req.success) {
      return renderPage(req, res, 'success')
    }
    return renderPage(req, res, 'unknown-error')
  } catch (error) {
    return renderPage(req, res, error.message)
  }
}
