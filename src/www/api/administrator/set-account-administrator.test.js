/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/administrator/set-account-administrator`, () => {
  describe('SetAccountAdministrator#PATCH', () => {
    it('should reject invalid accountid', async () => {
      const administrator = await TestHelper.createOwner()
      const req = TestHelper.createRequest(`/api/administrator/set-account-administrator?accountid=invalid`)
      req.account = administrator.account
      req.session = administrator.session
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-accountid')
    })

    it('should reject own accountid', async () => {
      const administrator = await TestHelper.createOwner()
      const req = TestHelper.createRequest(`/api/administrator/set-account-administrator?accountid=${administrator.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-account')
    })

    it('should require a non-administrator accountid', async () => {
      const administrator = await TestHelper.createOwner()
      const req = TestHelper.createRequest(`/api/administrator/set-account-administrator?accountid=${administrator.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-account')
    })

    it('should assign administrator status', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/administrator/set-account-administrator?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      const accountNow = await req.patch()
      assert.notStrictEqual(accountNow.administrator, undefined)
      assert.notStrictEqual(accountNow.administrator, null)
    })
  })
})
