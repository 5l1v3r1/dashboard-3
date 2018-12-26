/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/user/reset-account-password', () => {
  describe('ResetAccountPassword#PATCH', () => {
    it('should require username', async () => {
      const req = TestHelper.createRequest('/api/user/reset-account-password')
      req.body = {
        username: '',
        password: 'password',
        code: 'code'
      }
      const account = await req.patch()
      assert.strictEqual(account.message, 'invalid-username')
    })

    it('should require new password', async () => {
      const req = TestHelper.createRequest('/api/user/reset-account-password')
      req.body = {
        username: 'username',
        password: '',
        code: 'code'
      }
      const account = await req.patch()
      assert.strictEqual(account.message, 'invalid-password')
    })

    it('should require enforce password requirements', async () => {
      const req = TestHelper.createRequest('/api/user/reset-account-password')
      req.body = {
        username: 'username',
        password: 'short',
        code: 'code'
      }
      global.minimumPasswordLength = 100
      const account = await req.patch()
      assert.strictEqual(account.message, 'invalid-password-length')
    })

    it('should require reset code', async () => {
      const req = TestHelper.createRequest('/api/user/reset-account-password')
      req.body = {
        username: 'username',
        password: 'password'
      }
      const account = await req.patch()
      assert.strictEqual(account.message, 'invalid-reset-code')
    })

    it('should require valid reset code', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/api/user/reset-account-password')
      req.body = {
        username: user.account.username,
        password: user.account.password,
        code: 'invalid'
      }
      const account = await req.patch()
      assert.strictEqual(account.message, 'invalid-reset-code')
    })
  })
})
