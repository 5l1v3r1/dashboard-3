/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/user/set-account-profile`, () => {
  describe('SetAccountProfile#PATCH', () => {
    it('should apply new default', async () => {
      const user = await TestHelper.createUser()
      const profile1 = user.profile
      await TestHelper.createProfile(user, {
        'first-name': user.profile.firstName,
        'last-name': user.profile.lastName,
        'contact-email': user.profile.contactEmail,
        default: 'true'
      })
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
