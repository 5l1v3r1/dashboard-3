/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/user/reset-code`, () => {
  describe('ResetCode#GET', () => {
    it('should require valid reset code', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/api/user/reset-code?codeid=invalid')
      req.account = user.account
      req.session = user.session
      let errorMessage
      try {
        await req.get(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-codeid')
    })

    it('should require own codeid', async () => {
      const user = await TestHelper.createUser()
      const user2 = await TestHelper.createUser()
      await TestHelper.createResetCode(user2)
      const req = TestHelper.createRequest(`/api/user/reset-code?codeid=${user2.resetCode.codeid}`)
      req.account = user.account
      req.session = user.session
      let errorMessage
      try {
        await req.get(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-account')
    })

    it('should return reset code data', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createResetCode(user)
      const req = TestHelper.createRequest(`/api/user/reset-code?codeid=${user.resetCode.codeid}`)
      req.account = user.account
      req.session = user.session
      const codeNow = await req.get()
      assert.strictEqual(codeNow.accountid, user.account.accountid)
    })

    it('redacted code hash', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createResetCode(user)
      const req = TestHelper.createRequest(`/api/user/reset-code?codeid=${user.resetCode.codeid}`)
      req.account = user.account
      req.session = user.session
      const codeNow = await req.get()
      assert.strictEqual(codeNow.accountid, user.account.accountid)
      assert.strictEqual(undefined, codeNow.code)
    })
  })
})
