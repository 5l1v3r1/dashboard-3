/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/user/reset-account-password', () => {
  describe('ResetAccountPassword#PATCH', () => {
    it('should require username', async () => {
      const req = TestHelper.createRequest('/api/user/reset-account-password')
      req.body = {
        username: '',
        'new-password': 'password',
        code: 'code'
      }
      let errorMessage
      try {
        await req.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-username')
    })

    it('should require new password', async () => {
      const req = TestHelper.createRequest('/api/user/reset-account-password')
      req.body = {
        username: 'username',
        'new-password': '',
        code: 'code'
      }
      let errorMessage
      try {
        await req.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-password')
    })

    it('should require enforce password requirements', async () => {
      const req = TestHelper.createRequest('/api/user/reset-account-password')
      req.body = {
        username: 'username',
        'new-password': 'short',
        code: 'code'
      }
      global.minimumPasswordLength = 100
      let errorMessage
      try {
        await req.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-password-length')
    })

    it('should require reset code', async () => {
      const req = TestHelper.createRequest('/api/user/reset-account-password')
      req.body = {
        username: 'username',
        'new-password': 'password'
      }
      let errorMessage
      try {
        await req.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-reset-code')
    })

    it('should require valid reset code', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/api/user/reset-account-password')
      req.body = {
        username: user.account.username,
        'new-password': user.account.password,
        code: 'invalid'
      }
      let errorMessage
      try {
        await req.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-reset-code')
    })

    it('should set new account password', async () => {
      const user = await TestHelper.createUser()
      const code = await TestHelper.createResetCode(user)
      const req = TestHelper.createRequest(`/api/user/reset-account-password`)
      req.body = {
        username: user.account.username,
        'new-password': `new-password`,
        code: code.code
      }
      const accountNow = await req.patch()
      assert.notStrictEqual(accountNow.sessionKeyLastReset, undefined)
      assert.notStrictEqual(accountNow.sessionKeyLastReset, null)
    })
  })
})
