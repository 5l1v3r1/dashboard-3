/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe('/account/verify', () => {
  describe('Verify#GET', () => {
    it('should present the form', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/verify?returnURL=/redirecting')
      req.account = user.account
      req.session = user.session
      const page = await req.get()
      assert.strictEqual(page.getElementById('submit-form').tag, 'form')
      assert.strictEqual(page.getElementById('submit-button').tag, 'button')
    })
  })

  describe('Verify#POST', () => {
    it('should reject missing username', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/verify?returnURL=/redirecting')
      req.account = user.account
      req.session = user.session
      req.body = {
        username: '',
        password: 'password'
      }
      const page = await req.post()
      const message = page.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-username')
    })

    it('should enforce username length', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/verify?returnURL=/redirecting')
      req.account = user.account
      req.session = user.session
      req.body = {
        username: '1',
        password: '123456789123'
      }
      global.minimumUsernameLength = 100
      const page = await req.post()
      const message = page.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-username-length')
    })

    it('should reject missing password', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/verify?returnURL=/redirecting')
      req.account = user.account
      req.session = user.session
      req.body = {
        username: 'asdfasdf',
        password: ''
      }
      const page = await req.post()
      const message = page.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-password')
    })

    it('should reject invalid password', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/verify?returnURL=/redirecting')
      req.account = user.account
      req.session = user.session
      req.body = {
        username: user.account.username,
        password: 'invalid-password'
      }
      const page = await req.post()
      const message = page.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-password')
    })

    it('should enforce password length', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/verify?returnURL=/redirecting')
      req.account = user.account
      req.session = user.session
      req.body = {
        username: '1234567890123',
        password: '1'
      }
      global.minimumPasswordLength = 100
      const page = await req.post()
      const message = page.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-password-length')
    })

    it('should mark session as verified', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/verify?returnURL=/redirecting')
      req.account = user.account
      req.session = user.session
      req.body = {
        username: user.account.username,
        password: user.account.password
      }
      const page = await req.post()
      const redirectURL = await TestHelper.extractRedirectURL(page)
      assert.strictEqual(redirectURL, '/redirecting')
      req.query = { sessionid: user.session.sessionid }
      const sessionNow = await global.api.user.Session.get(req)
      assert.notStrictEqual(sessionNow.lastVerified, undefined)
      assert.notStrictEqual(sessionNow.lastVerified, null)
    })
  })
})
