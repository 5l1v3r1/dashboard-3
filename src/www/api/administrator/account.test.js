/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/administrator/account`, () => {
  describe('Account#GET', () => {
    it('should return specified user data', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/administrator/account?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      const account = await req.get()
      assert.strictEqual(account.accountid, user.account.accountid)
    })

    it('should redact username, password, session key', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/administrator/account?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      const account = await req.get()
      assert.strictEqual(account.accountid, user.account.accountid)
      assert.strictEqual(undefined, account.usernameHash)
      assert.strictEqual(undefined, account.passwordHash)
      assert.strictEqual(undefined, account.sessionKey)
    })
  })
})
