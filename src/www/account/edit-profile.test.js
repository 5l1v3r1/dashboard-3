/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe('/account/edit-profile', () => {
  describe('EditProfile#BEFORE', () => {
    it('should bind profile to req', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/edit-profile?profileid=${user.profile.profileid}`)
      req.account = user.account
      req.session = user.session
      await req.route.api.before(req)
      assert.strictEqual(req.data.profile.accountid, user.account.accountid)
    })
  })

  describe('EditProfile#GET', () => {
    it('should present the form', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/edit-profile?profileid=${user.profile.profileid}`)
      req.account = user.account
      req.session = user.session
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      assert.strictEqual(doc.getElementById('submit-form').tag, 'form')
      assert.strictEqual(doc.getElementById('submit-button').tag, 'button')
    })
  })

  describe('EditProfile#POST', () => {
    it('should require full name', async () => {
      global.userProfileFields = ['full-name']
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/edit-profile?profileid=${user.profile.profileid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        'first-name': '',
        'last-name': 'Test'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-first-name')
      req.body = {
        'first-name': 'Test',
        'last-name': ''
      }
      const result2 = await req.post()
      const doc2 = TestHelper.extractDoc(result2.html)
      const messageContainer2 = doc2.getElementById('message-container')
      const message2 = messageContainer2.child[0]
      assert.strictEqual(message2.attr.template, 'invalid-last-name')
    })

    it('should enforce name field lengths', async () => {
      global.userProfileFields = ['full-name']
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/edit-profile?profileid=${user.profile.profileid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        'first-name': '1',
        'last-name': 'Test'
      }
      global.minimumProfileFirstNameLength = 10
      global.maximumProfileFirstNameLength = 100
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-first-name-length')
      global.minimumProfileFirstNameLength = 1
      global.maximumProfileFirstNameLength = 1
      req.body = {
        'first-name': '123456789',
        'last-name': 'Test'
      }
      const result2 = await req.post()
      const doc2 = TestHelper.extractDoc(result2.html)
      const messageContainer2 = doc2.getElementById('message-container')
      const message2 = messageContainer2.child[0]
      assert.strictEqual(message2.attr.template, 'invalid-first-name-length')
    })

    it('should create new profile with full name', async () => {
      global.userProfileFields = ['full-name']
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/edit-profile?profileid=${user.profile.profileid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        'first-name': 'Test',
        'last-name': 'Person'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })

    it('should reject missing contact email', async () => {
      global.userProfileFields = ['contact-email']
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/edit-profile?profileid=${user.profile.profileid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        'contact-email': ''
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-contact-email')
    })

    it('should require "@" in contact email', async () => {
      global.userProfileFields = ['contact-email']
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/edit-profile?profileid=${user.profile.profileid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        'contact-email': 'invalid'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-contact-email')
    })

    it('should create new profile with contact email', async () => {
      global.userProfileFields = ['contact-email']
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/edit-profile?profileid=${user.profile.profileid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        'contact-email': user.profile.contactEmail
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })

    it('should reject missing display email', async () => {
      global.userProfileFields = ['display-email']
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/edit-profile?profileid=${user.profile.profileid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        'display-email': ''
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-display-email')
    })

    it('should require "@" in display email', async () => {
      global.userProfileFields = ['display-email']
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/edit-profile?profileid=${user.profile.profileid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        'display-email': 'invalid'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-display-email')
    })

    it('should create new profile with display email', async () => {
      global.userProfileFields = ['display-email']
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/edit-profile?profileid=${user.profile.profileid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        'display-email': user.profile.contactEmail
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })

    it('should require display name', async () => {
      global.userProfileFields = ['display-name']
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/edit-profile?profileid=${user.profile.profileid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        'display-name': ''
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-display-name')
    })

    it('should enforce display name lengths', async () => {
      global.userProfileFields = ['display-name']
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/edit-profile?profileid=${user.profile.profileid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        'display-name': '1'
      }
      global.minimumProfileDisplayNameLength = 10
      global.maximumProfileDisplayNameLength = 100
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-display-name-length')
      global.minimumProfileDisplayNameLength = 1
      global.maximumProfileDisplayNameLength = 1
      req.body = {
        'display-name': '123456789'
      }
      const result2 = await req.post()
      const doc2 = TestHelper.extractDoc(result2.html)
      const messageContainer2 = doc2.getElementById('message-container')
      const message2 = messageContainer2.child[0]
      assert.strictEqual(message2.attr.template, 'invalid-display-name-length')
    })

    it('should create new profile with display name', async () => {
      global.userProfileFields = ['display-name']
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/edit-profile?profileid=${user.profile.profileid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        'display-name': user.profile.firstName + ' ' + user.profile.lastName.substring(0, 1)
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })

    it('should require date of birth', async () => {
      global.userProfileFields = ['dob']
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/edit-profile?profileid=${user.profile.profileid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        dob: ''
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-dob')
    })

    it('should require valid date of birth', async () => {
      global.userProfileFields = ['dob']
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/edit-profile?profileid=${user.profile.profileid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        dob: '2017-13-52'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-dob')
    })

    it('should accept dob in YYYY-MM-DD', async () => {
      global.userProfileFields = ['dob']
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/edit-profile?profileid=${user.profile.profileid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        dob: '2017-11-01'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })

    it('should accept dob in MM-DD-YYYY', async () => {
      global.userProfileFields = ['dob']
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/edit-profile?profileid=${user.profile.profileid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        dob: '12-13-1968'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })

    it('should require unvalidated fields', async () => {
      const fields = ['phone', 'occupation', 'location', 'company-name', 'website']
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/edit-profile?profileid=${user.profile.profileid}`)
      req.account = user.account
      req.session = user.session
      for (const field of fields) {
        global.userProfileFields = [field]
        req.body = {
          [field]: ''
        }
        const result = await req.post()
        const doc = TestHelper.extractDoc(result.html)
        const messageContainer = doc.getElementById('message-container')
        const message = messageContainer.child[0]
        assert.strictEqual(message.attr.template, `invalid-${field}`)
      }
    })

    it('should save unvalidated fields', async () => {
      const fields = ['phone', 'occupation', 'location', 'company-name', 'website']
      const user = await TestHelper.createUser()
      for (const field of fields) {
        global.userProfileFields = [field]
        const req = TestHelper.createRequest(`/account/edit-profile?profileid=${user.profile.profileid}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          [field]: 'test value ' + Math.random()
        }
        const result = await req.post()
        const doc = TestHelper.extractDoc(result.html)
        const messageContainer = doc.getElementById('message-container')
        const message = messageContainer.child[0]
        assert.strictEqual(message.attr.template, 'success')
      }
    })

    it('should update profile and set as default (screenshots)', async () => {
      global.userProfileFields = ['full-name', 'display-name', 'contact-email', 'display-email', 'dob', 'phone', 'occupation', 'location', 'company-name', 'website']
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/edit-profile?profileid=${user.profile.profileid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        'first-name': 'Test',
        'last-name': 'Person',
        'contact-email': 'test1@test.com',
        'display-email': 'test2@test.com',
        dob: '2000-01-01',
        'display-name': 'tester',
        phone: '456-789-0123',
        occupation: 'Programmer',
        location: 'USA',
        'company-name': 'Test company',
        website: 'https://example.com',
        default: 'true'
      }
      req.filename = __filename
      req.screenshots = [
        { hover: '#account-menu-container' },
        { click: '/account' },
        { click: '/account/profiles' },
        { click: `/account/profile?profileid=${user.profile.profileid}` },
        { click: `/account/edit-profile?profileid=${user.profile.profileid}` },
        { fill: '#submit-form' }
      ]
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })
  })
})
