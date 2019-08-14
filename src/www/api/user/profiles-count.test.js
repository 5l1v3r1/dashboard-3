/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/user/profiles-count', () => {
  describe('ProfilesCount#GET', () => {
    it('should count profiles', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createProfile(user)
      await TestHelper.createProfile(user)
      const req = TestHelper.createRequest(`/api/user/profiles-count?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      const result = await req.get()
      assert.strictEqual(result, 3)
    })
  })
})
