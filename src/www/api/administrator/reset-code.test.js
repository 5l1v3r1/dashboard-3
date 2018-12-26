/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/administrator/reset-code`, () => {
  describe('ResetCode#GET', () => {
    it('should return reset code data', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      await TestHelper.createResetCode(user)
      const req = TestHelper.createRequest(`/api/administrator/reset-code?codeid=${user.resetCode.codeid}`)
      req.account = administrator.account
      req.session = administrator.session
      const codeNow = await req.get()
      assert.strictEqual(codeNow.accountid, user.account.accountid)
    })

    it('should redact code hash', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      await TestHelper.createResetCode(user)
      const req = TestHelper.createRequest(`/api/administrator/reset-code?codeid=${user.resetCode.codeid}`)
      req.account = administrator.account
      req.session = administrator.session
      const codeNow = await req.get()
      assert.strictEqual(codeNow.accountid, user.account.accountid)
      assert.strictEqual(undefined, codeNow.code)
    })
  })
})
