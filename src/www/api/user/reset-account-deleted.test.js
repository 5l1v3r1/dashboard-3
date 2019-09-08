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
        username: '',
        password: 'password'
      }
      let errorMessage
      try {
        await req.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-username')
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
      let errorMessage
      try {
        await req.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-username-length')
    })

    it('should require a password', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.setDeleted(user)
      const req = TestHelper.createRequest(`/api/user/reset-account-deleted?accountid=${user.account.accountid}`)
      req.body = {
        username: 'username',
        password: ''
      }
      let errorMessage
      try {
        await req.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-password')
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
      let errorMessage
      try {
        await req.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-password-length')
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
      let errorMessage
      try {
        await req.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-account')
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
