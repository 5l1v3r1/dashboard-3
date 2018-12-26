/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/account-profiles-count', () => {
  describe('AccountProfilesCount#GET', () => {
    it('should count account\'s profiles', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      await TestHelper.createUser()
      await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/administrator/account-profiles-count?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      const result = await req.get()
      assert.strictEqual(result, 1)
    })
  })
})
