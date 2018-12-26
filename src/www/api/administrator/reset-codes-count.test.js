/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/reset-codes-count', () => {
  describe('ResetCodesCount#GET', () => {
    it('should count all reset codes', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      await TestHelper.createResetCode(user)
      const user2 = await TestHelper.createUser()
      await TestHelper.createResetCode(user2)
      const user3 = await TestHelper.createUser()
      await TestHelper.createResetCode(user3)
      const req = TestHelper.createRequest('/api/administrator/reset-codes-count')
      req.account = administrator.account
      req.session = administrator.session
      const result = await req.get()
      assert.strictEqual(result, 3)
    })
  })
})
