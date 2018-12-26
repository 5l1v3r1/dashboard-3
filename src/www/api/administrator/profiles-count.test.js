/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/profiles-count', () => {
  describe('ProfilesCount#GET', () => {
    it('should count all profiles', async () => {
      const administrator = await TestHelper.createOwner()
      await TestHelper.createUser()
      await TestHelper.createUser()
      const req = TestHelper.createRequest('/api/administrator/profiles-count')
      req.account = administrator.account
      req.session = administrator.session
      const result = await req.get()
      assert.strictEqual(result, 3)
    })
  })
})
