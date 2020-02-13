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
      const req2 = TestHelper.createRequest(`/api/administrator/account-sessions?accountid=${user.account.accountid}`)
      req2.account = administrator.account
      req2.session = administrator.session
      const sessions = await req2.get()
      const session = sessions[0]
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
      const result = await req.get()
      assert.strictEqual(result.redirect, '/account/signout-complete')
    })
  })
})
