/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/user/set-account-password`, () => {
  describe('SetAccountPassword#BEFORE', () => {
    it('should enforce password length', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/set-account-password?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        password: '1',
        confirm: '1'
      }
      global.minimumPasswordLength = 100
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-password-length')
    })

    it('should hash new password and remove plain text', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/set-account-password?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        password: '1234567890',
        confirm: '1234567890'
      }
      await req.route.api.before(req)
      assert.strictEqual(req.body.password, undefined)
      assert.notStrictEqual(req.body.passwordHash, undefined)
      assert.notStrictEqual(req.body.passwordHash, null)
    })
  })

  describe('SetAccountPassword#PATCH', () => {
    it('should apply authorized new password', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/set-account-password?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        password: '1234567890',
        confirm: '1234567890'
      }
      await req.patch()
      user.account.password = '1234567890'
      const firstSession = user.session.sessionid
      await TestHelper.createSession(user)
      assert.strictEqual(user.session.object, 'session')
      assert.notStrictEqual(user.session.sessionid, firstSession)
    })
  })
})
