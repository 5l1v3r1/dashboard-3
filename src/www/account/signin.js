const dashboard = require('../../../index.js')

module.exports = {
  get: renderPage,
  post: submitForm
}

function renderPage (req, res, messageTemplate) {
  const doc = dashboard.HTML.parse(req.route.html)
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
  }
  if (req.body) {
    const usernameField = doc.getElementById('username')
    usernameField.setAttribute('value', req.body.username || '')
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
  let session
  try {
    session = await global.api.user.CreateSession.post(req)
  } catch (error) {
    return renderPage(req, res, error.message)
  }
  if (!session) {
    return renderPage(req, res, 'invalid-username')
  }
  if (!req.account) {
    const query = req.query
    req.query = { accountid: session.accountid }
    req.account = await global.api.administrator.Account.get(req)
    req.query = query
  }
  req.session = session
  let cookieStr = 'httponly; path=/'
  if (req.secure) {
    cookieStr += '; secure'
  }
  if (global.domain) {
    cookieStr += '; domain=' + global.domain
  }
  if (session.expires) {
    cookieStr += '; expires=' + dashboard.Timestamp.date(session.expires).toUTCString()
  }
  res.setHeader('set-cookie', [
    `sessionid=${session.sessionid}; ${cookieStr}`,
    `token=${session.token}; ${cookieStr}`
  ])
  const nextURL = req.query && req.query.returnURL ? req.query.returnURL : '/home'
  return dashboard.Response.redirect(req, res, nextURL)
}
