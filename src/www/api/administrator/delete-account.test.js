/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/delete-account', () => {
  describe('DeleteAccount#BEFORE', () => {
    it('should allow account not scheduled for delete', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/administrator/delete-account?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(undefined, errorMessage)
    })

    it('should allow account not ready to delete', async () => {
      global.deleteDelay = 7
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      await TestHelper.setDeleted(user)
      const req = TestHelper.createRequest(`/api/administrator/delete-account?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(undefined, errorMessage)
    })
  })

  describe('DeleteAccount#DELETE', () => {
    it('should delete account', async () => {
      global.deleteDelay = -1
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      await TestHelper.setDeleted(user)
      const req = TestHelper.createRequest(`/api/administrator/delete-account?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      await req.delete()
      const req2 = TestHelper.createRequest(`/api/administrator/account?accountid=${user.account.accountid}`)
      req2.account = administrator.account
      req2.session = administrator.session
      const account = await req2.get()
      assert.strictEqual(account.message, 'invalid-accountid')
    })
  })
})
