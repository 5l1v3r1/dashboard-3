/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/deleted-accounts-count', () => {
  describe('DeletedAccountsCount#GET', () => {
    it('should count all profiles', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      await TestHelper.setDeleted(user)
      const user2 = await TestHelper.createUser()
      await TestHelper.setDeleted(user2)
      const user3 = await TestHelper.createUser()
      await TestHelper.setDeleted(user3)
      const req = TestHelper.createRequest('/api/administrator/deleted-accounts-count')
      req.account = administrator.account
      req.session = administrator.session
      const result = await req.get()
      assert.strictEqual(result, 3)
    })
  })
})
