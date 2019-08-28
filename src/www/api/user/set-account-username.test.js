/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/user/set-account-username`, () => {
  describe('SetAccountUsername#PATCH', () => {
    it('should require new username', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/set-account-username?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        'new-username': '',
        password: user.account.password
      }
      global.minimumUsernameLength = 100
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-new-username')
    })

    it('should enforce username length', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/set-account-username?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        'new-username': '1',
        password: user.account.password
      }
      global.minimumUsernameLength = 100
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-new-username-length')
    })

    it('should reject invalid password', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/set-account-username?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        'new-username': 'new-username',
        password: 'invalid'
      }
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-password')
    })

    it('should apply new username', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/set-account-username?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        'new-username': 'new-username',
        password: user.account.password
      }
      await req.patch()
      user.account.username = 'new-username'
      const firstSession = user.session
      const newSession = await TestHelper.createSession(user)
      assert.strictEqual(user.session.object, 'session')
      assert.notStrictEqual(newSession.sessionid, firstSession.sessionid)
    })
  })
})
