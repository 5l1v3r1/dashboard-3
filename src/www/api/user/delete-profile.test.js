/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/user/delete-profile`, () => {
  describe('exceptions', () => {
    describe('invalid-profileid', () => {
      it('missing querystring profileid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/delete-profile`)
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.delete()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-profileid')
      })

      it('invalid querystring profileid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/delete-profile?profileid=invalid`)
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.delete()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-profileid')
      })
    })

    describe('invalid-account', () => {
      it('ineligible querystring profileid', async () => {
        const user = await TestHelper.createUser()
        const user2 = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/delete-profile?profileid=${user2.account.profileid}`)
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.delete()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-account')
      })
    })
  })

  describe('requirements', () => {
    it('querystring profileid owned by accessing account', async () => {
      const user = await TestHelper.createUser()
      const user2 = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/delete-profile?profileid=${user2.account.profileid}`)
      req.account = user.account
      req.session = user.session
      let errorMessage
      try {
        await req.delete()
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-account')
    })

    it('querystring profileid not default contact profile', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/delete-profile?profileid=${user.profile.profileid}`)
      req.account = user.account
      req.session = user.session
      let errorMessage
      try {
        await req.delete()
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-profile')
    })
  })

  describe('receives', () => {
    it('requires querystring profileid', async () => {
      const user = await TestHelper.createUser()
      const profile1 = user.profile
      await TestHelper.createProfile(user, {
        'first-name': user.profile.firstName,
        'last-name': user.profile.lastName,
        'contact-email': user.profile.contactEmail,
        default: 'true'
      })
      const req = TestHelper.createRequest(`/api/user/delete-profile?profileid=${profile1.profileid}`)
      req.account = user.account
      req.session = user.session
      await req.delete()
      const req2 = TestHelper.createRequest(`/api/user/profile?profileid=${profile1.profileid}`)
      req2.account = user.account
      req2.session = user.session
      let errorMessage
      try {
        await req2.get(req2)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-profileid')
    })
  })

  describe('returns', () => {
    it('boolean', async () => {
      const user = await TestHelper.createUser()
      const profile1 = user.profile
      await TestHelper.createProfile(user, {
        'first-name': user.profile.firstName,
        'last-name': user.profile.lastName,
        'contact-email': user.profile.contactEmail,
        default: 'true'
      })
      const req = TestHelper.createRequest(`/api/user/delete-profile?profileid=${profile1.profileid}`)
      req.account = user.account
      req.session = user.session
      const deleted = await req.delete()
      assert.strictEqual(deleted, true)
    })
  })
})
