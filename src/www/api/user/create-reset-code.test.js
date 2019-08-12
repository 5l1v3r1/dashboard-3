/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/user/create-reset-code', () => {
  describe('CreateResetCode#POST', () => {
    it('should enforce code length', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/create-reset-code?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
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
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/create-reset-code?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        code: 'this-is-the-code'
      }
      const code = await req.post()
      assert.strictEqual(code.object, 'resetCode')
    })
  })
})
