/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/set-account-deleted', () => {
  describe('SetAccountDeleted#PATCH', () => {
    it('should reject invalid accountid', async () => {
      const administrator = await TestHelper.createOwner()
      const req = TestHelper.createRequest(`/api/administrator/set-account-administrator?accountid=invalid`)
      req.account = administrator.account
      req.session = administrator.session
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-accountid')
    })

    it('should reject own accountid', async () => {
      const administrator = await TestHelper.createOwner()
      const req = TestHelper.createRequest(`/api/administrator/set-account-administrator?accountid=${administrator.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-account')
    })

    it('should schedule for immediate deletion', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/administrator/set-account-deleted?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      global.deleteDelay = 0
      const accountNow = await req.patch()
      const now = Math.floor(new Date().getTime() / 1000)
      const days = Math.ceil((accountNow.deleted - now) / 60 / 60 / 24)
      assert.strictEqual(days, 0)
    })

    it('should schedule for future deletion', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/administrator/set-account-deleted?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      const accountNow = await req.patch()
      const now = Math.floor(new Date().getTime() / 1000)
      const days = Math.ceil((accountNow.deleted - now) / 60 / 60 / 24)
      assert.strictEqual(days, global.deleteDelay)
    })
  })
})
