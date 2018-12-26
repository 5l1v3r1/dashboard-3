/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/administrator/reset-session-impersonate`, () => {
  describe('ResetSessionImpersonate#PATCH', () => {
    it('should remove impersonation from session', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      await TestHelper.setImpersonate(administrator, user.account.accountid)
      const req = TestHelper.createRequest(`/api/administrator/reset-session-impersonate?sessionid=${administrator.session.sessionid}`)
      req.account = administrator.account
      req.session = administrator.session
      await req.patch()
      const req2 = TestHelper.createRequest(`/api/administrator/session?sessionid=${administrator.session.sessionid}`)
      req2.account = administrator.account
      req2.session = administrator.session
      const sessionNow = await req2.get()
      assert.strictEqual(sessionNow.impersonate, undefined)
    })

    it('should end impersonated session', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      await TestHelper.setImpersonate(administrator, user.account.accountid)
      const req = TestHelper.createRequest(`/api/administrator/reset-session-impersonate?sessionid=${administrator.session.sessionid}`)
      req.account = administrator.account
      req.session = administrator.session
      await req.patch()
      const req2 = TestHelper.createRequest(`/api/administrator/sessions?accountid=${user.account.accountid}`)
      req2.account = administrator.account
      req2.session = administrator.session
      const userSessions = await req2.get()
      const userSessionNow = userSessions[0]
      assert.strictEqual(userSessionNow.impersonator, administrator.session.sessionid)
      assert.strictEqual(userSessionNow.administratorid, administrator.account.accountid)
      assert.notStrictEqual(userSessionNow.ended, undefined)
      assert.notStrictEqual(userSessionNow.ended, null)
    })
  })
})
