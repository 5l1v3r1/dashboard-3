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

    it('should require full name', async () => {
      global.userProfileFields = ['full-name']
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/register`)
      req.account = user.account
      req.session = user.session
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        'first-name': null,
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
        'last-name': null
      }
      const page2 = await req.post()
      const doc2 = TestHelper.extractDoc(page2)
      const messageContainer2 = doc2.getElementById('message-container')
      const message2 = messageContainer2.child[0]
      assert.strictEqual(message2.attr.template, 'invalid-last-name')
    })

    it('should enforce name field lengths', async () => {
      global.userProfileFields = ['full-name']
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/register`)
      req.account = user.account
      req.session = user.session
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        'first-name': '1',
        'last-name': 'Test'
      }
      global.minimumFirstNameLength = 10
      global.maximumFirstNameLength = 100
      const page = await req.post()
      const doc = TestHelper.extractDoc(page)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-first-name-length')
      global.minimumFirstNameLength = 1
      global.maximumFirstNameLength = 1
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        'first-name': '123456789',
        'last-name': 'Test',
        'contact-email': 'test@email.com'
      }
      const page2 = await req.post()
      const doc2 = TestHelper.extractDoc(page2)
      const messageContainer2 = doc2.getElementById('message-container')
      const message2 = messageContainer2.child[0]
      assert.strictEqual(message2.attr.template, 'invalid-first-name-length')
    })

    it('should create new account with full name', async () => {
      global.userProfileFields = ['full-name']
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/register`)
      req.account = user.account
      req.session = user.session
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        'first-name': 'Test',
        'last-name': 'Person'
      }
      const page = await req.post()
      const doc = TestHelper.extractDoc(page)
      const redirectURL = TestHelper.extractRedirectURL(doc)
      assert.strictEqual(redirectURL, '/home')
    })

    it('should reject missing contact email', async () => {
      global.userProfileFields = ['contact-email']
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/register`)
      req.account = user.account
      req.session = user.session
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        'contact-email': null
      }
      const page = await req.post()
      const doc = TestHelper.extractDoc(page)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-contact-email')
    })

    it('should require "@" in contact email', async () => {
      global.userProfileFields = ['contact-email']
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/register`)
      req.account = user.account
      req.session = user.session
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
      global.userProfileFields = ['contact-email']
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/register`)
      req.account = user.account
      req.session = user.session
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        'contact-email': user.profile.contactEmail
      }
      const page = await req.post()
      const doc = TestHelper.extractDoc(page)
      const redirectURL = TestHelper.extractRedirectURL(doc)
      assert.strictEqual(redirectURL, '/home')
    })

    it('should reject missing display email', async () => {
      global.userProfileFields = ['display-email']
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/register`)
      req.account = user.account
      req.session = user.session
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        'display-email': null
      }
      const page = await req.post()
      const doc = TestHelper.extractDoc(page)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-display-email')
    })

    it('should require "@" in display email', async () => {
      global.userProfileFields = ['display-email']
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/register`)
      req.account = user.account
      req.session = user.session
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
      global.userProfileFields = ['display-email']
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/register`)
      req.account = user.account
      req.session = user.session
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        'display-email': user.profile.contactEmail
      }
      const page = await req.post()
      const doc = TestHelper.extractDoc(page)
      const redirectURL = TestHelper.extractRedirectURL(doc)
      assert.strictEqual(redirectURL, '/home')
    })

    it('should require display name', async () => {
      global.userProfileFields = ['display-name']
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/register`)
      req.account = user.account
      req.session = user.session
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        'display-name': null
      }
      const page = await req.post()
      const doc = TestHelper.extractDoc(page)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-display-name')
    })

    it('should enforce display name lengths', async () => {
      global.userProfileFields = ['display-name']
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/register`)
      req.account = user.account
      req.session = user.session
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        'display-name': '1'
      }
      global.minimumDisplayNameLength = 10
      global.maximumDisplayNameLength = 100
      const page = await req.post()
      const doc = TestHelper.extractDoc(page)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-display-name-length')
      global.minimumDisplayNameLength = 1
      global.maximumDisplayNameLength = 1
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
      global.userProfileFields = ['display-name']
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/register`)
      req.account = user.account
      req.session = user.session
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        'display-name': user.profile.firstName + ' ' + user.profile.lastName.substring(0, 1)
      }
      const page = await req.post()
      const doc = TestHelper.extractDoc(page)
      const redirectURL = TestHelper.extractRedirectURL(doc)
      assert.strictEqual(redirectURL, '/home')
    })

    it('should require date of birth', async () => {
      global.userProfileFields = ['dob']
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/register`)
      req.account = user.account
      req.session = user.session
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        'dob': null
      }
      const page = await req.post()
      const doc = TestHelper.extractDoc(page)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-dob')
    })

    it('should require valid date of birth', async () => {
      global.userProfileFields = ['dob']
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/register`)
      req.account = user.account
      req.session = user.session
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
      global.userProfileFields = ['dob']
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/register`)
      req.account = user.account
      req.session = user.session
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        'dob': '2017-11-01'
      }
      const page = await req.post()
      const doc = TestHelper.extractDoc(page)
      const redirectURL = TestHelper.extractRedirectURL(doc)
      assert.strictEqual(redirectURL, '/home')
    })

    it('should accept dob in MM-DD-YYYY', async () => {
      global.userProfileFields = ['dob']
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/register`)
      req.account = user.account
      req.session = user.session
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        'dob': '12-13-1968'
      }
      const page = await req.post()
      const doc = TestHelper.extractDoc(page)
      const redirectURL = TestHelper.extractRedirectURL(doc)
      assert.strictEqual(redirectURL, '/home')
    })

    it('should require unvalidated fields', async () => {
      const fields = ['phone', 'occupation', 'location', 'company-name', 'website', 'address-line1', 'address-line2', 'address-city', 'address-state', 'address-postal-code', 'address-country']
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/register`)
      req.account = user.account
      req.session = user.session
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password'
      }
      for (const field of fields) {
        global.userProfileFields = [field]
        req.body[field] = null
        const page = await req.post()
        const doc = TestHelper.extractDoc(page)
        const messageContainer = doc.getElementById('message-container')
        const message = messageContainer.child[0]
        assert.strictEqual(message.attr.template, `invalid-${field}`)
      }
    })

    it('should save unvalidated fields', async () => {
      const fields = ['phone', 'occupation', 'location', 'company-name', 'website', 'address-line1', 'address-line2', 'address-city', 'address-state', 'address-postal-code', 'address-country']
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/register`)
      req.account = user.account
      req.session = user.session
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password'
      }
      for (const field of fields) {
        global.userProfileFields = [field]
        req.body[field] = 'test value ' + Math.random()
        let displayName = field
        if (displayName.indexOf('-') > -1) {
          displayName = displayName.split('-')
          if (displayName.length === 1) {
            displayName = displayName[0]
          } else if (displayName.length === 2) {
            displayName = displayName[0] + displayName[1].substring(0, 1).toUpperCase() + displayName[1].substring(1)
          } else if (displayName.length === 3) {
            displayName = displayName[0] + displayName[1].substring(0, 1).toUpperCase() + displayName[1].substring(1) + displayName[2].substring(0, 1).toUpperCase() + displayName[2].substring(1)
          }
        }
        const page = await req.post()
        const doc = TestHelper.extractDoc(page)
        const redirectURL = TestHelper.extractRedirectURL(doc)
        assert.strictEqual(redirectURL, '/home')
      }
    })

    it('should create new profile and set as default', async () => {
      global.userProfileFields = ['full-name', 'display-name', 'contact-email', 'display-email', 'dob', 'phone', 'occupation', 'location', 'company-name', 'website', 'address-line1', 'address-line2', 'address-city', 'address-state', 'address-postal-code', 'address-country']
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/register`)
      req.account = user.account
      req.session = user.session
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        'first-name': 'Test',
        'last-name': 'Person',
        'contact-email': 'test1@test.com',
        'display-email': 'test2@test.com',
        'dob': '2000-01-01',
        'display-name': 'tester',
        'phone': '456-789-0123',
        'occupation': 'Programmer',
        'location': 'USA',
        'company-name': user.profile.contactEmail.split('@')[1].split('.')[0],
        'website': 'https://' + user.profile.contactEmail.split('@')[1],
        'address-line1': '285 Fulton St',
        'address-line2': 'Apt 893',
        'address-city': 'New York',
        'address-state': 'NY',
        'address-postal-code': '10007',
        'address-country': 'US'
      }
      const page = await req.post()
      const doc = TestHelper.extractDoc(page)
      const redirectURL = TestHelper.extractRedirectURL(doc)
      assert.strictEqual(redirectURL, '/home')
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
