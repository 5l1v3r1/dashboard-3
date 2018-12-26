/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/administrator-accounts-count', () => {
  describe('AdministratorAccountsCount#GET', () => {
    it('should count all administrators\' accounts', async () => {
      const owner = await TestHelper.createOwner()
      await TestHelper.createAdministrator(owner)
      const req = TestHelper.createRequest('/api/administrator/administrator-accounts-count')
      req.account = owner.account
      req.session = owner.session
      const result = await req.get()
      assert.strictEqual(result, 2)
    })
  })
})
