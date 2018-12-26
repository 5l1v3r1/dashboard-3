/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/administrator/set-session-impersonate`, () => {
  describe('SetSessionImpersonate#PATCH', () => {
    it('should set authorized impersonate', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/administrator/set-session-impersonate?sessionid=${administrator.session.sessionid}`)
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        accountid: user.account.accountid
      }
      const sessionNow = await req.patch()
      assert.strictEqual(sessionNow.accountid, user.account.accountid)
    })
  })
})
