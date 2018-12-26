/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/administrator/profile`, () => {
  describe('Profile#GET', () => {
    it('should return specified profile data', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/administrator/profile?profileid=${user.profile.profileid}`)
      req.account = administrator.account
      req.session = administrator.session
      const profile = await req.get()
      assert.strictEqual(profile.profileid, user.account.profileid)
    })
  })
})
