/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/user/delete-profile`, () => {
  describe('DeleteProfile#DELETE', () => {
    it('should require valid profile', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/api/user/delete-profile?profileid=invalid')
      req.account = user.account
      req.session = user.session
      let errorMessage
      try {
        await req.route.api.delete(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-profileid')
    })

    it('should reject default profile', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/delete-profile?profileid=${user.profile.profileid}`)
      req.account = user.account
      req.session = user.session
      let errorMessage
      try {
        await req.route.api.delete(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-profile')
    })

    it('should delete the profile', async () => {
      const user = await TestHelper.createUser()
      const profile1 = user.profile
      await TestHelper.createProfile(user)
      const req = TestHelper.createRequest(`/api/user/delete-profile?profileid=${profile1.profileid}`)
      req.account = user.account
      req.session = user.session
      await req.delete()
      const req2 = TestHelper.createRequest(`/api/user/profile?profileid=${profile1.profileid}`)
      req2.account = user.account
      req2.session = user.session
      const profile = await req2.get()
      assert.strictEqual(profile.message, 'invalid-profileid')
    })
  })
})
