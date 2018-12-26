/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/user/session-count', () => {
  describe('SessionsCount#GET', () => {
    it('should count sessions', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createSession(user)
      await TestHelper.createSession(user)
      const req = TestHelper.createRequest(`/api/user/sessions-count?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      const result = await req.get()
      assert.strictEqual(result, 3)
    })
  })
})
