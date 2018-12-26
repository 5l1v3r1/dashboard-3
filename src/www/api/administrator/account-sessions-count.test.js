/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/account-sessions-count', () => {
  describe('AccountSessionsCount#GET', () => {
    it('should count account\'s sessions', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      await TestHelper.createSession(user)
      await TestHelper.createSession(user)
      const req = TestHelper.createRequest(`/api/administrator/account-sessions-count?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      const result = await req.get()
      assert.strictEqual(result, 3)
    })
  })
})
