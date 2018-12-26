/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe('/administrator/end-impersonation', () => {
  describe('EndImpersonation#BEFORE', () => {
    it('should reject invalid session', async () => {
      const administrator = await TestHelper.createOwner()
      const req = TestHelper.createRequest(`/administrator/end-impersonation?sessionid=invalid`)
      req.account = administrator.account
      req.session = administrator.session
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-session')
    })

    it('should remove impersonate status', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      await TestHelper.setImpersonate(administrator, user.account.accountid)
      const req = TestHelper.createRequest(`/administrator/end-impersonation?sessionid=${administrator.session.sessionid}`)
      req.account = administrator.account
      req.session = administrator.session
      await req.get()
      const req2 = TestHelper.createRequest(`/api/administrator/session?sessionid=${administrator.session.sessionid}`)
      req2.account = administrator.account
      req2.session = administrator.session
      const administratorSessionNow = await req2.get()
      assert.strictEqual(administratorSessionNow.impersonate, undefined)
    })

    it('should end the user session of the administrator', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      await TestHelper.setImpersonate(administrator, user.account.accountid)
      const req = TestHelper.createRequest(`/administrator/end-impersonation?sessionid=${administrator.session.sessionid}`)
      req.account = administrator.account
      req.session = administrator.session
      await req.get()
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
