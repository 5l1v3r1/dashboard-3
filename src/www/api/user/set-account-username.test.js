/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/user/set-account-username`, () => {
  describe('SetAccountUsername#BEFORE', () => {
    it('should enforce username length', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/set-account-username?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        username: '1'
      }
      global.minimumUsernameLength = 100
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-username-length')
    })

    it('should hash new username and remove plain text', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/set-account-username?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      const username = 'new-username-' + new Date().getTime() + '-' + Math.ceil(Math.random() * 1000)
      req.body = {
        username
      }
      await req.route.api.before(req)
      assert.strictEqual(req.body.username, undefined)
      assert.notStrictEqual(req.body.usernameHash, undefined)
      assert.notStrictEqual(req.body.usernameHash, null)
    })
  })

  describe('SetAccountUsername#PATCH', () => {
    it('should apply authorized new username', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/set-account-username?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        username: 'new-username'
      }
      const x = await req.patch()
      user.account.username = 'new-username'
      const firstSession = user.session
      const newSession = await TestHelper.createSession(user)
      assert.strictEqual(user.session.object, 'session')
      assert.notStrictEqual(newSession.sessionid, firstSession.sessionid)
    })
  })
})
