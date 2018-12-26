/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/user/create-reset-code', () => {
  describe('CreateResetCode#BEFORE', () => {
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
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-reset-code-length')
    })

    it('should hash reset code and remove plain text', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/create-reset-code?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        code: '123456789001234567890'
      }
      await req.route.api.before(req)
      assert.strictEqual(req.body.code, undefined)
      assert.notStrictEqual(req.body.codeHash, undefined)
      assert.notStrictEqual(req.body.codeHash, null)
    })
  })

  describe('CreateResetCode#POST', () => {
    it('should create a code after authorization', async () => {
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
