/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/account-reset-codes-count', () => {
  describe('exceptions', () => {
    describe('invalid-accountid', async () => {
      it('missing querystring accountid value', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest(`/api/administrator/account-reset-codes-count`)
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-accountid')
      })

      it('invalid querystring accountid value', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest(`/api/administrator/account-reset-codes-count?accountid=invalid`)
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-accountid')
      })
    })
  })

  describe('returns', () => {
    it('integer', async () => {
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
