/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/user/reset-account-deleted`, () => {
  describe('ResetAccountDeleted#PATCH', () => {
    it('should require a username', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.setDeleted(user)
      const req = TestHelper.createRequest(`/api/user/reset-account-deleted?accountid=${user.account.accountid}`)
      req.body = {
        username: 'username',
        password: 'password'
      }
      const account = await req.patch()
      assert.strictEqual(account.message, 'invalid-username')
    })

    it('should enforce username length', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.setDeleted(user)
      const req = TestHelper.createRequest(`/api/user/reset-account-deleted?accountid=${user.account.accountid}`)
      req.body = {
        username: '1',
        password: 'password'
      }
      global.minimumUsernameLength = 100
      const account = await req.patch()
      assert.strictEqual(account.message, 'invalid-username-length')
    })

    it('should require a password', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.setDeleted(user)
      const req = TestHelper.createRequest(`/api/user/reset-account-deleted?accountid=${user.account.accountid}`)
      req.body = {
        username: 'username',
        password: ''
      }
      const account = await req.patch()
      assert.strictEqual(account.message, 'invalid-password')
    })

    it('should enforce password length', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.setDeleted(user)
      const req = TestHelper.createRequest(`/api/user/reset-account-deleted?accountid=${user.account.accountid}`)
      req.body = {
        username: 'username',
        password: '1'
      }
      global.minimumPasswordLength = 100
      const account = await req.patch()
      assert.strictEqual(account.message, 'invalid-password-length')
    })

    it('should require account be scheduled for deletion', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/reset-account-deleted?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        username: user.account.username,
        password: user.account.password
      }
      const account = await req.patch()
      assert.strictEqual(account.message, 'invalid-account')
    })

    it('should restore account', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.setDeleted(user)
      const req = TestHelper.createRequest(`/api/user/reset-account-deleted?accountid=${user.account.accountid}`)
      req.body = {
        username: user.account.username,
        password: user.account.password
      }
      const accountNow = await req.patch()
      assert.strictEqual(undefined, accountNow.deleted)
    })
  })
})
