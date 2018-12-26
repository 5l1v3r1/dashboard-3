/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe('/account/signout', () => {
  describe('Signout#GET', () => {
    it('should end the session', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/signout')
      req.account = user.account
      req.session = user.session
      req.body = {
        username: user.account.username,
        password: user.account.password
      }
      await req.get()
      const req2 = TestHelper.createRequest(`/api/administrator/session?sessionid=${user.session.sessionid}`)
      req2.account = administrator.account
      req2.session = administrator.session
      const session = await req2.get(req2)
      assert.notStrictEqual(session.ended, undefined)
      assert.notStrictEqual(session.ended, null)
    })

    it('should redirect to signout complete page', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/signout')
      req.account = user.account
      req.session = user.session
      req.body = {
        username: user.account.username,
        password: user.account.password
      }
      const page = await req.get()
      const redirectURL = TestHelper.extractRedirectURL(page)
      assert.strictEqual(redirectURL, '/account/signout-complete')
    })
  })
})
