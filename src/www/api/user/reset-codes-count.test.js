/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/user/reset-codes-count', async () => {
  describe('ResetCodesCount#GET', () => {
    it('should count reset codes', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createResetCode(user)
      await TestHelper.createResetCode(user)
      await TestHelper.createResetCode(user)
      const req = TestHelper.createRequest(`/api/user/reset-codes-count?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      const result = await req.get()
      assert.strictEqual(result, 3)
    })
  })
})
