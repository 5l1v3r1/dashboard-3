/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe('/account/set-default-profile', () => {
  describe('SetDefaultProfile#BEFORE', () => {
    it('should bind posted profile to req', async () => {
      const user = await TestHelper.createUser()
      const profile1 = user.profile
      await TestHelper.createProfile(user)
      const req = TestHelper.createRequest(`/account/set-default-profile`)
      req.account = user.account
      req.session = user.session
      req.body = {
        profileid: profile1.profileid
      }
      await req.route.api.before(req)
      assert.strictEqual(req.data.profile.profileid, profile1.profileid)
    })

    it('should bind all profiles to req', async () => {
      global.pageSize = 1
      const user = await TestHelper.createUser()
      const profile1 = user.profile
      const profile2 = await TestHelper.createProfile(user)
      const profile3 = await TestHelper.createProfile(user)
      const req = TestHelper.createRequest(`/account/set-default-profile`)
      req.account = user.account
      req.session = user.session
      await req.route.api.before(req)
      assert.strictEqual(req.data.profiles.length, 3)
      assert.strictEqual(req.data.profiles[0].profileid, profile3.profileid)
      assert.strictEqual(req.data.profiles[1].profileid, profile2.profileid)
      assert.strictEqual(req.data.profiles[2].profileid, profile1.profileid)
    })
  })

  describe('SetDefaultProfile#GET', () => {
    it('should present the form', async () => {
      const user = await TestHelper.createUser()
      const profile1 = user.profile
      await TestHelper.createProfile(user)
      const req = TestHelper.createRequest(`/account/set-default-profile`)
      req.account = user.account
      req.session = user.session
      req.body = {
        profileid: profile1.profileid
      }
      const page = await req.get()
      const doc = TestHelper.extractDoc(page)
      assert.strictEqual(doc.getElementById('submit-form').tag, 'form')
      assert.strictEqual(doc.getElementById('submit-button').tag, 'button')
    })

    it('should present the profile table', async () => {
      const user = await TestHelper.createUser()
      const profile1 = user.profile
      await TestHelper.createProfile(user)
      const req = TestHelper.createRequest(`/account/set-default-profile`)
      req.account = user.account
      req.session = user.session
      req.body = {
        profileid: profile1.profileid
      }
      const page = await req.get()
      const doc = TestHelper.extractDoc(page)
      const table = doc.getElementById('profiles-table')
      const row = table.getElementById(profile1.profileid)
      assert.strictEqual(row.tag, 'tr')
    })
  })

  describe('SetDefaultProfile#POST', () => {
    it('should set the authorized profile as default', async () => {
      const user = await TestHelper.createUser()
      const profile1id = user.profile.profileid
      await TestHelper.createProfile(user)
      const req = TestHelper.createRequest(`/account/set-default-profile`)
      req.account = user.account
      req.session = user.session
      req.body = {
        profileid: profile1id
      }
      const page = await req.post()
      const doc = TestHelper.extractDoc(page)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })
  })
})
