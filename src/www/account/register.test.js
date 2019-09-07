/* eslint-env mocha */
const assert = require('assert')
const dashboard = require('../../../index.js')
const TestHelper = require('../../../test-helper.js')

describe('/account/register', () => {
  describe('Register#GET', () => {
    it('should present the form', async () => {
      const req = TestHelper.createRequest('/account/register')
      const page = await req.get()
      const doc = await TestHelper.extractDoc(page)
      assert.strictEqual(doc.getElementById('submit-form').tag, 'form')
      assert.strictEqual(doc.getElementById('submit-button').tag, 'button')
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
      const doc = await TestHelper.extractDoc(page)
      const message = doc.getElementById('message-container').child[0]
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
      const doc = await TestHelper.extractDoc(page)
      const message = doc.getElementById('message-container').child[0]
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
      const doc = await TestHelper.extractDoc(page)
      const message = doc.getElementById('message-container').child[0]
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
      const doc = await TestHelper.extractDoc(page)
      const message = doc.getElementById('message-container').child[0]
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
      const doc = await TestHelper.extractDoc(page)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-confirm')
    })

    it('should require full name', async () => {
      global.requireProfile = true
      global.userProfileFields = ['full-name']
      const req = TestHelper.createRequest(`/account/register`)
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        'first-name': '',
        'last-name': 'Test'
      }
      const page = await req.post()
      const doc = TestHelper.extractDoc(page)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-first-name')
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        'first-name': 'Test',
        'last-name': ''
      }
      const page2 = await req.post()
      const doc2 = TestHelper.extractDoc(page2)
      const messageContainer2 = doc2.getElementById('message-container')
      const message2 = messageContainer2.child[0]
      assert.strictEqual(message2.attr.template, 'invalid-last-name')
    })

    it('should enforce full name lengths', async () => {
      global.requireProfile = true
      global.userProfileFields = ['full-name']
      const req = TestHelper.createRequest(`/account/register`)
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        'first-name': '1',
        'last-name': 'Test'
      }
      global.minimumProfileFirstNameLength = 10
      global.maximumProfileFirstNameLength = 100
      const page = await req.post()
      const doc = TestHelper.extractDoc(page)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-first-name-length')
      global.minimumProfileFirstNameLength = 1
      global.maximumProfileFirstNameLength = 1
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        'first-name': '123456789',
        'last-name': 'Test'
      }
      const page2 = await req.post()
      const doc2 = TestHelper.extractDoc(page2)
      const messageContainer2 = doc2.getElementById('message-container')
      const message2 = messageContainer2.child[0]
      assert.strictEqual(message2.attr.template, 'invalid-first-name-length')
    })

    it('should create new account with full name', async () => {
      global.requireProfile = true
      global.userProfileFields = ['full-name']
      const req = TestHelper.createRequest(`/account/register`)
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        'first-name': 'Test',
        'last-name': 'Person'
      }
      const page = await req.post()
      const redirectURL = TestHelper.extractRedirectURL(page)
      assert.strictEqual(redirectURL, '/home')
    })

    it('should reject missing contact email', async () => {
      global.requireProfile = true
      global.userProfileFields = ['contact-email']
      const req = TestHelper.createRequest(`/account/register`)
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        'contact-email': ' '
      }
      const page = await req.post()
      const doc = TestHelper.extractDoc(page)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-contact-email')
    })

    it('should require "@" in contact email', async () => {
      global.requireProfile = true
      global.userProfileFields = ['contact-email']
      const req = TestHelper.createRequest(`/account/register`)
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        'contact-email': 'invalid'
      }
      const page = await req.post()
      const doc = TestHelper.extractDoc(page)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-contact-email')
    })

    it('should create new profile with contact email', async () => {
      global.requireProfile = true
      global.userProfileFields = ['contact-email']
      const req = TestHelper.createRequest(`/account/register`)
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        'contact-email': TestHelper.nextIdentity().email
      }
      const page = await req.post()
      const redirectURL = TestHelper.extractRedirectURL(page)
      assert.strictEqual(redirectURL, '/home')
    })

    it('should reject missing display email', async () => {
      global.requireProfile = true
      global.userProfileFields = ['display-email']
      const req = TestHelper.createRequest(`/account/register`)
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        'display-email': ' '
      }
      const page = await req.post()
      const doc = TestHelper.extractDoc(page)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-display-email')
    })

    it('should require "@" in display email', async () => {
      global.requireProfile = true
      global.userProfileFields = ['display-email']
      const req = TestHelper.createRequest(`/account/register`)
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        'display-email': 'invalid'
      }
      const page = await req.post()
      const doc = TestHelper.extractDoc(page)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-display-email')
    })

    it('should create new profile with display email', async () => {
      global.requireProfile = true
      global.userProfileFields = ['display-email']
      const req = TestHelper.createRequest(`/account/register`)
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        'display-email': TestHelper.nextIdentity().email
      }
      const page = await req.post()
      const redirectURL = TestHelper.extractRedirectURL(page)
      assert.strictEqual(redirectURL, '/home')
    })

    it('should require display name', async () => {
      global.requireProfile = true
      global.userProfileFields = ['display-name']
      const req = TestHelper.createRequest(`/account/register`)
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        'display-name': ''
      }
      const page = await req.post()
      const doc = TestHelper.extractDoc(page)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-display-name')
    })

    it('should enforce display name lengths', async () => {
      global.requireProfile = true
      global.userProfileFields = ['display-name']
      const req = TestHelper.createRequest(`/account/register`)
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        'display-name': '1'
      }
      global.minimumProfileDisplayNameLength = 10
      global.maximumProfileDisplayNameLength = 100
      const page = await req.post()
      const doc = TestHelper.extractDoc(page)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-display-name-length')
      global.minimumProfileDisplayNameLength = 1
      global.maximumProfileDisplayNameLength = 1
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        'display-name': '123456789'
      }
      const page2 = await req.post()
      const doc2 = TestHelper.extractDoc(page2)
      const messageContainer2 = doc2.getElementById('message-container')
      const message2 = messageContainer2.child[0]
      assert.strictEqual(message2.attr.template, 'invalid-display-name-length')
    })

    it('should create new profile with display name', async () => {
      global.requireProfile = true
      global.userProfileFields = ['display-name']
      const req = TestHelper.createRequest(`/account/register`)
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        'display-name': '@user'
      }
      const page = await req.post()
      const redirectURL = TestHelper.extractRedirectURL(page)
      assert.strictEqual(redirectURL, '/home')
    })

    it('should require date of birth', async () => {
      global.requireProfile = true
      global.userProfileFields = ['dob']
      const req = TestHelper.createRequest(`/account/register`)
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        'dob': ' '
      }
      const page = await req.post()
      const doc = TestHelper.extractDoc(page)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-dob')
    })

    it('should require valid date of birth', async () => {
      global.requireProfile = true
      global.userProfileFields = ['dob']
      const req = TestHelper.createRequest(`/account/register`)
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        'dob': '2017-13-52'
      }
      const page = await req.post()
      const doc = TestHelper.extractDoc(page)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-dob')
    })

    it('should accept dob in YYYY-MM-DD', async () => {
      global.requireProfile = true
      global.userProfileFields = ['dob']
      const req = TestHelper.createRequest(`/account/register`)
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        'dob': '2017-11-01'
      }
      const page = await req.post()
      const redirectURL = TestHelper.extractRedirectURL(page)
      assert.strictEqual(redirectURL, '/home')
    })

    it('should accept dob in MM-DD-YYYY', async () => {
      global.requireProfile = true
      global.userProfileFields = ['dob']
      const req = TestHelper.createRequest(`/account/register`)
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        'dob': '12-13-1968'
      }
      const page = await req.post()
      const redirectURL = TestHelper.extractRedirectURL(page)
      assert.strictEqual(redirectURL, '/home')
    })

    it('should require unvalidated fields', async () => {
      global.requireProfile = true
      const fields = ['phone', 'occupation', 'location', 'company-name', 'website']
      const req = TestHelper.createRequest(`/account/register`)
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password'
      }
      for (const field of fields) {
        global.userProfileFields = [field]
        const page = await req.post()
        const doc = TestHelper.extractDoc(page)
        const messageContainer = doc.getElementById('message-container')
        const message = messageContainer.child[0]
        assert.strictEqual(message.attr.template, `invalid-${field}`)
      }
    })

    it('should save unvalidated fields', async () => {
      global.requireProfile = true
      const fields = ['phone', 'occupation', 'location', 'company-name', 'website']
      const req = TestHelper.createRequest(`/account/register`)
      for (const field of fields) {
        global.userProfileFields = [field]
        req.body = {
          username: 'new-user-' + new Date().getTime(),
          password: 'a-user-password',
          confirm: 'a-user-password'
        }
        req.body[field] = 'test value ' + Math.random()
        const page = await req.post()
        const redirectURL = TestHelper.extractRedirectURL(page)
        assert.strictEqual(redirectURL, '/home')
      }
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
  })
})
