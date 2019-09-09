/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/user/account`, () => {
  describe('Account#GET', () => {
    it('should reject invalid accountid', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/account?accountid=invalid`)
      req.account = user.account
      req.session = user.session
      let errorMessage
      try {
        await req.get(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-accountid')
    })

    it('should reject other accountid', async () => {
      const user = await TestHelper.createUser()
      const user2 = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/account?accountid=${user2.account.accountid}`)
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

    it('should return account data', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/account?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      const account = await req.get()
      assert.strictEqual(account.accountid, user.account.accountid)
    })

    it('redacted username, password, sessionKey', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/account?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      const account = await req.get()
      assert.strictEqual(account.accountid, user.account.accountid)
      assert.strictEqual(undefined, account.usernameHash)
      assert.strictEqual(undefined, account.passwordHash)
      assert.strictEqual(undefined, account.sessionKey)
    })
  })
})
