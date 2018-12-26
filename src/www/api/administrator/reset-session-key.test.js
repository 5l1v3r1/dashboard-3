/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/administrator/reset-session-key`, () => {
  describe('ResetSessionKey#BEFORE', () => {
    it('should reject invalid account', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/administrator/reset-session-key?accountid=invalid`)
      req.account = administrator.account
      req.session = administrator.session
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-accountid')
    })

    it('should reject account scheduled for deletion', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      await TestHelper.setDeleted(user)
      const req = TestHelper.createRequest(`/api/administrator/reset-session-key?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-account')
    })
  })

  describe('ResetSessionKey#PATCH', () => {
    it('should increase sessionKeyNumber', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/administrator/reset-session-key?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      const accountNow = await req.patch()
      assert.notStrictEqual(accountNow.sessionKeyNumber, user.sessionKeyNumber)
    })

    it('should update sessionKeyLastReset', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/administrator/reset-session-key?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      const accountNow = await req.patch()
      assert.notStrictEqual(accountNow.sessionKeyLastReset, undefined)
      assert.notStrictEqual(accountNow.sessionKeyLastReset, null)
    })
  })
})
