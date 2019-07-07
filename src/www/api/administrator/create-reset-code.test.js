/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/administrator/create-reset-code`, () => {
  describe('CreateResetCode#POST', async () => {
    it('should enforce code length', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/administrator/create-reset-code?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        code: '1'
      }
      global.minimumResetCodeLength = 100
      let errorMessage
      try {
        await req.route.api.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-reset-code-length')
    })
    it('should create a code', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/administrator/create-reset-code?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        code: '12345678'
      }
      const resetCode = await req.post()
      assert.strictEqual(resetCode.object, 'resetCode')
    })
  })
})
