const dashboard = require('../../../index.js')

module.exports = {
  get: renderPage,
  post: submitForm
}

function renderPage (req, res, messageTemplate) {
  if (req.success) {
    if (req.query && req.query.returnURL && req.query.returnURL.indexOf('/') === 0) {
      return dashboard.Response.redirect(req, res, decodeURI(req.query.returnURL))
    }
    messageTemplate = 'success'
  } else if (req.error) {
    messageTemplate = req.error
  }
  const doc = dashboard.HTML.parse(req.route.html)
  if (!messageTemplate && req.method === 'GET' && req.query && req.query.returnURL) {
    const submitForm = doc.getElementById('submit-form')
    const divider = submitForm.attr.action.indexOf('?') > -1 ? '&' : '?'
    submitForm.attr.action += `${divider}returnURL=${encodeURI(req.query.returnURL).split('?').join('%3F')}`
  }
  const removeFields = [ 'display-name', 'display-email', 'contact-email', 'full-name', 'dob', 'phone', 'occupation', 'location', 'company-name', 'website' ]
  const profileFields = req.profileFields || global.userProfileFields
  for (const field of profileFields) {
    removeFields.splice(removeFields.indexOf(`${field}-container`))
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
