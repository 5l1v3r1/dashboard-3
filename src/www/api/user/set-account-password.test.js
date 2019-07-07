/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/user/set-account-password`, () => {
  describe('SetAccountPassword#PATCH', () => {
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
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-password-length')
    })

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
