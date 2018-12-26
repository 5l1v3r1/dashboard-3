/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/account-reset-codes-count', () => {
  describe('AccountResetCodesCount#GET', () => {
    it('should count account\'s reset codes', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      await TestHelper.createResetCode(user)
      await TestHelper.createResetCode(user)
      const req = TestHelper.createRequest(`/api/administrator/account-reset-codes-count?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      const result = await req.get()
      assert.strictEqual(result, 2)
    })
  })
})
