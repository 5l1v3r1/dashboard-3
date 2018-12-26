/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/user/create-account', () => {
  describe('CreateAccount#POST', () => {
    it('should require a username', async () => {
      const req = TestHelper.createRequest('/api/user/create-account')
      req.body = {
        username: '',
        password: ''
      }
      const account = await req.post()
      assert.strictEqual(account.message, 'invalid-username')
    })

    it('should require a username length', async () => {
      const req = TestHelper.createRequest('/api/user/create-account')
      req.body = {
        username: '1',
        password: 'password'
      }
      global.minimumUsernameLength = 100
      const account = await req.post()
      assert.strictEqual(account.message, 'invalid-username-length')
    })

    it('should require a password', async () => {
      const req = TestHelper.createRequest('/api/user/create-account')
      req.body = {
        username: 'username',
        password: ''
      }
      const account = await req.post()
      assert.strictEqual(account.message, 'invalid-password')
    })

    it('should require a username length', async () => {
      const req = TestHelper.createRequest('/api/user/create-account')
      req.body = {
        username: 'username',
        password: '1'
      }
      global.minimumPasswordLength = 100
      const account = await req.post()
      assert.strictEqual(account.message, 'invalid-password-length')
    })

    it('should create account', async () => {
      const req = TestHelper.createRequest('/api/user/create-account')
      req.body = {
        username: 'username-' + new Date().getTime(),
        password: 'password1234',
        confirm: 'password1234'
      }
      const account = await req.post()
      assert.strictEqual(account.object, 'account')
    })
  })
})
