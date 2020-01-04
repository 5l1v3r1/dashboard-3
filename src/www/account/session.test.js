/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe('/account/session', () => {
  describe('Session#BEFORE', () => {
    it('should bind session to req', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/session?sessionid=${user.session.sessionid}`)
      req.account = user.account
      req.session = user.session
      await req.route.api.before(req)
      assert.strictEqual(req.data.session.sessionid, user.session.sessionid)
    })
  })

  describe('Session#GET', () => {
    it('should present the session table (screenshots)', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/session?sessionid=${user.session.sessionid}`)
      req.account = user.account
      req.session = user.session
      req.filename = __filename
      req.screenshots = [
        { hover: '#account-menu-container' },
        { click: '/account' },
        { click: '/account/sessions' },
        { click: `/account/session?sessionid=${user.session.sessionid}` }
      ]
      const page = await req.get()
      const doc = TestHelper.extractDoc(page)
      const tbody = doc.getElementById(req.session.sessionid)
      assert.strictEqual(tbody.tag, 'tbody')
    })
  })
})
