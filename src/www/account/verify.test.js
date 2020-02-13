/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe('/account/verify', () => {
  describe('Verify#GET', () => {
    it('should present the form', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/verify?return-url=/redirecting')
      req.account = user.account
      req.session = user.session
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      assert.strictEqual(doc.getElementById('submit-form').tag, 'form')
      assert.strictEqual(doc.getElementById('submit-button').tag, 'button')
    })
  })

  describe('Verify#POST', () => {
    it('should reject missing username', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/verify?return-url=/redirecting')
      req.account = user.account
      req.session = user.session
      req.body = {
        username: '',
        password: 'password'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-username')
    })

    it('should enforce username length', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/verify?return-url=/redirecting')
      req.account = user.account
      req.session = user.session
      req.body = {
        username: '1',
        password: '123456789123'
      }
      global.minimumUsernameLength = 100
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-username-length')
    })

    it('should reject missing password', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/verify?return-url=/redirecting')
      req.account = user.account
      req.session = user.session
      req.body = {
        username: 'asdfasdf',
        password: ''
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-password')
    })

    it('should reject invalid password', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/verify?return-url=/redirecting')
      req.account = user.account
      req.session = user.session
      req.body = {
        username: user.account.username,
        password: 'invalid-password'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-password')
    })

    it('should enforce password length', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/verify?return-url=/redirecting')
      req.account = user.account
      req.session = user.session
      req.body = {
        username: '1234567890123',
        password: '1'
      }
      global.minimumPasswordLength = 100
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-password-length')
    })

    it('should mark session as verified', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/verify?return-url=/redirecting')
      req.account = user.account
      req.session = user.session
      req.body = {
        username: user.account.username,
        password: user.account.password
      }
      const result = await req.post()
      assert.strictEqual(result.redirect, '/redirecting')
      const req2 = TestHelper.createRequest(`/api/administrator/account-sessions?accountid=${user.account.accountid}`)
      req2.account = administrator.account
      req2.session = administrator.session
      const sessions = await req2.get()
      const session = sessions[0]
      assert.notStrictEqual(session.lastVerified, undefined)
      assert.notStrictEqual(session.lastVerified, null)
    })
  })
})
