/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/user/delete-reset-code`, () => {
  describe('DeleteResetCode#DELETE', () => {
    it('should require valid reset code', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/api/user/delete-reset-code?codeid=invalid')
      req.account = user.account
      req.session = user.session
      let errorMessage
      try {
        await req.route.api.delete(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-codeid')
    })
    
    it('should delete the code', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createResetCode(user)
      const req = TestHelper.createRequest(`/api/user/delete-reset-code?codeid=${user.resetCode.codeid}`)
      req.account = user.account
      req.session = user.session
      await req.delete()
      const req2 = TestHelper.createRequest(`/api/user/reset-code?codeid=${user.resetCode.codeid}`)
      req2.account = user.account
      req2.session = user.session
      const code = await req2.get()
      assert.strictEqual(code.message, 'invalid-codeid')
    })
  })
})
