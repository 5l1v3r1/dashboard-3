/* eslint-env mocha */
const assert = require('assert')
const dashboard = require('../../../index.js')
const TestHelper = require('../../../test-helper.js')

describe('/account/register', () => {
  describe('Register#GET', () => {
    it('should present the form', async () => {
      const req = TestHelper.createRequest('/account/register')
      const page = await req.get()
      assert.strictEqual(page.getElementById('submit-form').tag, 'form')
      assert.strictEqual(page.getElementById('submit-button').tag, 'button')
    })
  })

  describe('Register#POST', () => {
    it('should reject missing username', async () => {
      const req = TestHelper.createRequest('/account/register')
      req.body = {
        username: '',
        password: 'new-password',
        confirm: 'new-password'
      }
      const page = await req.post()
      const message = page.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-username')
    })

    it('should enforce username length', async () => {
      const req = TestHelper.createRequest('/account/register')
      req.body = {
        username: '1',
        password: 'new-password',
        confirm: 'new-password'
      }
      global.minimumUsernameLength = 100
      const page = await req.post()
      const message = page.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-username-length')
    })

    it('should reject missing password', async () => {
      const req = TestHelper.createRequest('/account/register')
      req.body = {
        username: 'new-username',
        password: '',
        confirm: 'new-password'
      }
      const page = await req.post()
      const message = page.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-password')
    })

    it('should enforce password length', async () => {
      const req = TestHelper.createRequest('/account/register')
      req.body = {
        username: 'new-username',
        password: '1',
        confirm: '1'
      }
      global.minimumPasswordLength = 100
      const page = await req.post()
      const message = page.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-password-length')
    })

    it('should reject invalid confirm', async () => {
      const req = TestHelper.createRequest('/account/register')
      req.body = {
        username: '1234567890123',
        password: '1234567890123',
        confirm: '123'
      }
      const page = await req.post()
      const message = page.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-confirm')
    })





    it('should reject missing first name', async () => {
      global.requireProfileName = true
      const req = TestHelper.createRequest('/account/register')
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        ['first-name']: null,
        ['last-name']: 'test',
        email: 'test@test.com'
      }
      const page = await req.post()
      const doc = TestHelper.extractDoc(page)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-profile-first-name')
    })

    it('should enforce first name length', async () => {
      global.requireProfileName = true
      const req = TestHelper.createRequest('/account/register')
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        ['first-name']: '1',
        ['last-name']: 'test',
        email: 'test@test.com'
      }
      global.minimumProfileFirstNameLength = 2
      global.maximumProfileFirstNameLength = 100
      const page = await req.post()
      const doc = TestHelper.extractDoc(page)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-profile-first-name-length')
      // too long
      const req2 = TestHelper.createRequest('/account/register')
      req2.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        ['first-name']: '1234567890',
        ['last-name']: 'test',
        email: 'test@test.com'
      }
      global.minimumProfileFirstNameLength = 1
      global.maximumProfileFirstNameLength = 1
      const page2 = await req2.post()
      const doc2 = TestHelper.extractDoc(page2)
      const message2 = doc2.getElementById('message-container').child[0]
      assert.strictEqual(message2.attr.template, 'invalid-profile-first-name-length')
    })

    it('should reject missing last name', async () => {
      global.requireProfileName = true
      const req = TestHelper.createRequest('/account/register')
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        ['first-name']: 'First',
        ['last-name']: null,
        email: 'test@test.com'
      }
      const page = await req.post()
      const doc = TestHelper.extractDoc(page)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-profile-last-name')
    })

    it('should enforce last name length', async () => {
      global.requireProfileName = true
      const req = TestHelper.createRequest('/account/register')
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        ['first-name']: 'test',
        ['last-name']: '1',
        email: 'test@test.com'
      }
      global.minimumProfileLastNameLength = 2
      global.maximumProfileLastNameLength = 100
      const page = await req.post()
      const doc = TestHelper.extractDoc(page)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-profile-last-name-length')
      // too long
      global.minimumProfileLastNameLength = 1
      global.maximumProfileLastNameLength = 1
      const req2 = TestHelper.createRequest('/account/register')
      req2.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        ['first-name']: 'test',
        ['last-name']: '1234567890',
        email: 'test@test.com'
      }
      const page2 = await req2.post()
      const doc2 = TestHelper.extractDoc(page2)
      const message2 = doc2.getElementById('message-container').child[0]
      assert.strictEqual(message2.attr.template, 'invalid-profile-last-name-length')
    })

    it('should reject missing email', async () => {
      global.requireProfileEmail = true
      const req = TestHelper.createRequest('/account/register')
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        ['first-name']: 'First',
        ['last-name']: 'Last',
        email: null
      }
      const page = await req.post()
      const doc = TestHelper.extractDoc(page)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-profile-email')
    })

    it('should create account and 20-minute session', async () => {
      const req = TestHelper.createRequest('/account/register')
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password'
      }
      await req.post()
      const req2 = TestHelper.createRequest(`/api/user/create-session`)
      req2.body = {
        username: req.body.username,
        password: req.body.password
      }
      const secondSession = await req2.post()
      const req3 = TestHelper.createRequest(`/api/user/sessions?accountid=${secondSession.accountid}`)
      req3.account = { accountid: secondSession.accountid }
      req3.session = secondSession
      const sessions = await req3.get()
      const hours = Math.floor((sessions[1].expires - dashboard.Timestamp.now) / 60 / 60)
      assert.strictEqual(hours, 0)
    })

    it('should create account with profile information', async () => {
      global.requireProfileEmail = true
      global.requireProfileName = true
      const req = TestHelper.createRequest('/account/register')
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        email: 'person@example.com',
        ['first-name']: 'Test',
        ['last-name']: 'Person'
      }
      await req.post()
      const req2 = TestHelper.createRequest(`/api/user/create-session`)
      req2.body = {
        username: req.body.username,
        password: req.body.password
      }
      const session = await req2.post()
      const req3 = TestHelper.createRequest(`/api/user/account?accountid=${session.accountid}`)
      req3.session = session
      req3.account = { accountid: session.accountid }
      const account = await req3.get()
      const req4 = TestHelper.createRequest(`/api/user/profile?profileid=${account.profileid}`)
      req4.session = session
      req4.account = account
      const profile = await req4.get()
      assert.strictEqual(profile.email, 'person@example.com')
      assert.strictEqual(profile.firstName, 'Test')
      assert.strictEqual(profile.lastName, 'Person')
    })
  })
})
