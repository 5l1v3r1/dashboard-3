/* eslint-env mocha */
const assert = require('assert')
const dashboard = require('../../../index.js')
const TestHelper = require('../../../test-helper.js')

describe('/administrator/impersonate-account', () => {
  describe('ImpersonateAccount#GET', () => {
    it('should set impersonate status', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/administrator/impersonate-account?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      await req.post()
      const req2 = TestHelper.createRequest(`/api/user/sessions?accountid=${user.account.accountid}`)
      req2.account = administrator.account
      req2.session = administrator.session
      const sessions = await req2.get()
      assert.strictEqual(sessions[0].administratorid, administrator.account.accountid)
      assert.strictEqual(sessions[0].impersonator, administrator.session.sessionid)
    })
  })
})
