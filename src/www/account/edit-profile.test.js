/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe(`/account/edit-profile`, () => {
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
      const page = await req.get()
      const doc = TestHelper.extractDoc(page)
      assert.strictEqual(doc.getElementById('submit-form').tag, 'form')
      assert.strictEqual(doc.getElementById('submit-button').tag, 'button')
    })
  })

  describe('EditProfile#POST', () => {
    it('should reject missing first name', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/edit-profile?profileid=${user.profile.profileid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        'first-name': null,
        'last-name': 'test',
        email: 'test@test.com'
      }
      const page = await req.post()
      const doc = TestHelper.extractDoc(page)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-profile-first-name')
    })

    it('should enforce first name length', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/edit-profile?profileid=${user.profile.profileid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        'first-name': '1',
        'last-name': 'test',
        email: 'test@test.com'
      }
      global.minimumProfileFirstNameLength = 2
      global.maximumProfileFirstNameLength = 100
      const page = await req.post()
      const doc = TestHelper.extractDoc(page)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-profile-first-name-length')
      // too long
      global.minimumProfileFirstNameLength = 100
      global.maximumProfileFirstNameLength = 2
      const req2 = TestHelper.createRequest(`/account/edit-profile?profileid=${user.profile.profileid}`)
      req2.account = user.account
      req2.session = user.session
      req2.body = {
        'first-name': '1234567890',
        'last-name': 'test',
        email: 'test@test.com'
      }
      const page2 = await req.post()
      const doc2 = TestHelper.extractDoc(page2)
      const message2 = doc2.getElementById('message-container').child[0]
      assert.strictEqual(message2.attr.template, 'invalid-profile-first-name-length')
    })

    it('should reject missing last name', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/edit-profile?profileid=${user.profile.profileid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        'first-name': 'First',
        'last-name': null,
        email: 'test@test.com'
      }
      const page = await req.post()
      const doc = TestHelper.extractDoc(page)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-profile-last-name')
    })

    it('should enforce last name length', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/edit-profile?profileid=${user.profile.profileid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        'first-name': 'test',
        'last-name': '1',
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
      const req2 = TestHelper.createRequest(`/account/edit-profile?profileid=${user.profile.profileid}`)
      req2.account = user.account
      req2.session = user.session
      req2.body = {
        'first-name': 'test',
        'last-name': '1234567890',
        email: 'test@test.com'
      }
      const page2 = await req2.post()
      const doc2 = TestHelper.extractDoc(page2)
      const message2 = doc2.getElementById('message-container').child[0]
      assert.strictEqual(message2.attr.template, 'invalid-profile-last-name-length')
    })

    it('should reject missing email', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/edit-profile?profileid=${user.profile.profileid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        'first-name': 'First',
        'last-name': 'Last',
        email: null
      }
      global.minimumUsernameLength = 100
      const page = await req.post()
      const doc = TestHelper.extractDoc(page)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-profile-email')
    })

    it('should update profile', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/edit-profile?profileid=${user.profile.profileid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        'first-name': 'Test',
        'last-name': 'Person',
        email: 'email@address.com'
      }
      const page = await req.post()
      const doc = TestHelper.extractDoc(page)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })
  })
})
