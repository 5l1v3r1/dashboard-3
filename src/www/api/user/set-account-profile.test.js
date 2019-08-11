/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/user/set-account-profile`, () => {
  describe('SetAccountProfile#PATCH', () => {
    it('should reject default profile', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/set-account-profile?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        profileid: user.profile.profileid
      }
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-profile')
    })

    it('should apply authorized new default', async () => {
      const user = await TestHelper.createUser()
      const profile1 = user.profile
      await TestHelper.createProfile(user)
      const req = TestHelper.createRequest(`/api/user/set-account-profile?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        profileid: profile1.profileid
      }
      const accountNow = await req.patch()
      assert.strictEqual(accountNow.profileid, profile1.profileid)
    })
  })
})
