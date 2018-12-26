/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/user/set-account-deleted`, () => {
  describe('SetAccountDeleted#BEFORE', () => {
    it('should reject invalid accountid', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/set-account-deleted?accountid=invalid`)
      req.account = user.account
      req.session = user.session
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-account')
    })

    it('should reject other account\'s accountid', async () => {
      const user = await TestHelper.createUser()
      const user2 = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/set-account-deleted?accountid=${user.account.accountid}`)
      req.account = user2.account
      req.session = user2.session
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-account')
    })
  })

  describe('SetAccountDeleted#DELETE', () => {
    it('should schedule deletion in 7 days', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/set-account-deleted?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      global.deleteDelay = 7
      const accountNow = await req.patch()
      const now = Math.floor(new Date().getTime() / 1000)
      const days = Math.ceil((accountNow.deleted - now) / 60 / 60 / 24)
      assert.strictEqual(days, 7)
    })

    it('should schedule deletion in 3 days', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/set-account-deleted?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      global.deleteDelay = 3
      const accountNow = await req.patch()
      const now = Math.floor(new Date().getTime() / 1000)
      const days = Math.ceil((accountNow.deleted - now) / 60 / 60 / 24)
      assert.strictEqual(days, 3)
    })

    it('should schedule immediate deletion', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/set-account-deleted?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      global.deleteDelay = 0
      const accountNow = await req.patch()
      const now = Math.floor(new Date().getTime() / 1000)
      const days = Math.ceil((accountNow.deleted - now) / 60 / 60 / 24)
      assert.strictEqual(days, 0)
    })
  })
})
