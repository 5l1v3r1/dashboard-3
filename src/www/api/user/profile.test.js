/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/user/profile', () => {
  describe('Profile#GET', () => {
    it('should reject invalid profileid', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/profile?profileid=invalid`)
      req.account = user.account
      req.session = user.session
      let errorMessage
      try {
        await req.get(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-profileid')
    })

    it('should reject other account', async () => {
      const user = await TestHelper.createUser()
      const user2 = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/profile?profileid=${user2.profile.profileid}`)
      req.account = user.account
      req.session = user.session
      let errorMessage
      try {
        await req.get(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-account')
    })

    it('should return profile data', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/profile?profileid=${user.profile.profileid}`)
      req.account = user.account
      req.session = user.session
      const profile = await req.get()
      assert.strictEqual(user.account.profileid, profile.profileid)
    })
  })
})
