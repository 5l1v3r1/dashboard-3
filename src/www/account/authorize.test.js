/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe('/account/authorize', () => {
  describe('Authorize#BEFORE', () => {
    it('should require locked session', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/authorize')
      req.account = user.account
      req.session = user.session
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-session')
    })
  })

  describe('Authorize#GET', () => {
    it('should present the form', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.wait(2200)
      await TestHelper.createSession(user)
      await TestHelper.lockSession(user)
      const req = TestHelper.createRequest('/account/authorize')
      req.account = user.account
      req.session = user.session
      const page = await req.get()
      assert.strictEqual(page.getElementById('submit-form').tag, 'form')
      assert.strictEqual(page.getElementById('submit-button').tag, 'button')
    })
  })

  describe('Authorize#POST', () => {
    it('should reject missing username', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.wait(2200)
      await TestHelper.createSession(user)
      await TestHelper.lockSession(user)
      const req = TestHelper.createRequest('/account/authorize')
      req.account = user.account
      req.session = user.session
      req.body = {
        username: '',
        password: user.account.password
      }
      const page = await req.post()
      const message = page.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-username')
    })

    it('should enforce username length', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.wait(2200)
      await TestHelper.createSession(user)
      await TestHelper.lockSession(user)
      const req = TestHelper.createRequest('/account/authorize')
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
      await TestHelper.wait(2200)
      await TestHelper.createSession(user)
      await TestHelper.lockSession(user)
      const req = TestHelper.createRequest('/account/authorize')
      req.account = user.account
      req.session = user.session
      req.body = {
        username: user.account.username,
        password: ''
      }
      const page = await req.post()
      const message = page.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-password')

    })

    it('should enforce password length', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.wait(2200)
      await TestHelper.createSession(user)
      await TestHelper.lockSession(user)
      const req = TestHelper.createRequest('/account/authorize')
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

    it('should reject invalid password', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.wait(2200)
      await TestHelper.createSession(user)
      await TestHelper.lockSession(user)
      const req = TestHelper.createRequest('/account/authorize')
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

    it('should reject different account credentials', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.wait(2200)
      await TestHelper.createSession(user)
      await TestHelper.lockSession(user)
      const user2 = await TestHelper.createUser()      
      await TestHelper.wait(2200)
      await TestHelper.createSession(user2)
      await TestHelper.lockSession(user2)
      const req = TestHelper.createRequest('/account/authorize')
      req.account = user.account
      req.session = user.session
      req.body = {
        username: user2.account.username,
        password: user2.account.password
      }
      const page = await req.post()
      const message = page.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-account')
    })

    it('should unlock session', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.wait(2200)
      await TestHelper.createSession(user)
      await TestHelper.lockSession(user)
      const req = TestHelper.createRequest('/account/authorize')
      req.account = user.account
      req.session = user.session
      req.body = {
        username: user.account.username,
        password: user.account.password
      }
      const page = await req.post()
      const redirectURL = TestHelper.extractRedirectURL(page)
      assert.notStrictEqual(redirectURL, null)
      assert.notStrictEqual(redirectURL, undefined)
      assert.notStrictEqual(redirectURL, '/account/authorize')
      assert.notStrictEqual(redirectURL, '/account/signin')
    })

    it('should remove lock from session', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.wait(2200)
      await TestHelper.createSession(user)
      await TestHelper.lockSession(user)
      const req = TestHelper.createRequest('/account/authorize')
      req.account = user.account
      req.session = user.session
      req.body = {
        cancel: 'true'
      }
      const page = await req.post()
      const redirectURL = TestHelper.extractRedirectURL(page)
      assert.notStrictEqual(redirectURL, null)
      assert.notStrictEqual(redirectURL, undefined)
      assert.notStrictEqual(redirectURL, '/account/authorize')
      assert.notStrictEqual(redirectURL, '/account/signin')
    })
  })
})
