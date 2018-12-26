/* eslint-env mocha */
const TestHelper = require('../../../../test-helper.js')
const assert = require('assert')
const dashboard = require('../../../../index.js')

describe('/api/user/create-session', () => {
  describe('CreateSession#POST', () => {
    it('should require a username', async () => {
      const req = TestHelper.createRequest('/api/user/create-session')
      req.body = {
        username: '',
        password: ''
      }
      const account = await req.post()
      assert.strictEqual(account.message, 'invalid-username')
    })

    it('should require a username length', async () => {
      const req = TestHelper.createRequest('/api/user/create-session')
      req.body = {
        username: '1',
        password: 'password'
      }
      global.minimumUsernameLength = 100
      const account = await req.post()
      assert.strictEqual(account.message, 'invalid-username-length')
    })

    it('should require a password', async () => {
      const req = TestHelper.createRequest('/api/user/create-session')
      req.body = {
        username: 'username',
        password: ''
      }
      const account = await req.post()
      assert.strictEqual(account.message, 'invalid-password')
    })

    it('should require a username length', async () => {
      const req = TestHelper.createRequest('/api/user/create-session')
      req.body = {
        username: 'username',
        password: '1'
      }
      global.minimumPasswordLength = 100
      const account = await req.post()
      assert.strictEqual(account.message, 'invalid-password-length')
    })

    it('should create session expiring in 20 minutes', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/api/user/create-session')
      req.body = {
        username: user.account.username,
        password: user.account.password
      }
      const session = await req.post()
      const minutes = Math.ceil((session.expires - dashboard.Timestamp.now) / 60)
      assert.strictEqual(minutes, 20)
    })

    it('should create session expiring in 8 hours', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/api/user/create-session')
      req.body = {
        username: user.account.username,
        password: user.account.password,
        remember: 'hours'
      }
      const session = await req.post()
      const hours = Math.ceil((session.expires - dashboard.Timestamp.now) / 60 / 60)
      assert.strictEqual(hours, 8)
    })

    it('should create session expiring in 30 days', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/api/user/create-session')
      req.body = {
        username: user.account.username,
        password: user.account.password,
        remember: 'days'
      }
      const session = await req.post()
      const days = Math.ceil((session.expires - dashboard.Timestamp.now) / 60 / 60 / 24)
      assert.strictEqual(days, 30)
    })
  })
})
