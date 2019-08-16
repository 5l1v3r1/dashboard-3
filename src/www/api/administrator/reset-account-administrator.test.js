/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/administrator/reset-account-administrator`, () => {
  describe('ResetAccountAdministrator#PATCH', () => {
    it('should require an administrator accountid', async () => {
      const owner = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/administrator/reset-account-administrator?accountid=${user.account.accountid}`)
      req.account = owner.account
      req.session = owner.session
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-account')
    })
    it('should apply revocation', async () => {
      const owner = await TestHelper.createOwner()
      const administrator2 = await TestHelper.createAdministrator(owner)
      const req = TestHelper.createRequest(`/api/administrator/reset-account-administrator?accountid=${administrator2.account.accountid}`)
      req.account = owner.account
      req.session = owner.session
      const accountNow = await req.patch()
      assert.strictEqual(accountNow.administrator, undefined)
    })
  })
})
