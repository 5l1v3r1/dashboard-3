/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/user/set-session-unlocked`, () => {
  describe('SetSessionUnlocked#POST', () => {
    it('should require a locked session', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/set-session-unlocked?sessionid=${user.session.sessionid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        username: 'username',
        password: 'password'
      }
      const session = await req.patch()
      assert.strictEqual(session.message, 'invalid-session')
    })

    it('should require a username', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.lockSession(user)
      const req = TestHelper.createRequest(`/api/user/set-session-unlocked?sessionid=${user.session.sessionid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        username: '',
        password: 'password'
      }
      const session = await req.patch()
      assert.strictEqual(session.message, 'invalid-username')
    })

    it('should require a password', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.lockSession(user)
      const req = TestHelper.createRequest(`/api/user/set-session-unlocked?sessionid=${user.session.sessionid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        username: 'username',
        password: ''
      }

      const session = await req.patch()
      assert.strictEqual(session.message, 'invalid-password')
    })

    it('should require a valid username and password', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.lockSession(user)
      const req = TestHelper.createRequest(`/api/user/set-session-unlocked?sessionid=${user.session.sessionid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        username: 'username',
        password: 'password'
      }
      const session = await req.patch()
      assert.strictEqual(session.message, 'invalid-username')
      req.body = {
        username: user.account.username,
        password: 'password'
      }
      const session2 = await req.patch()
      assert.strictEqual(session2.message, 'invalid-password')
    })

    it('should reject other account username and password', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.lockSession(user)
      const user2 = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/set-session-unlocked?sessionid=${user.session.sessionid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        username: user2.account.username,
        password: user2.account.password
      }
      const session = await req.patch()
      assert.strictEqual(session.message, 'invalid-account')
    })

    it('should unlock locked session for user', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.lockSession(user)
      const req = TestHelper.createRequest(`/api/user/set-session-unlocked?sessionid=${user.session.sessionid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        username: user.account.username,
        password: user.account.password
      }
      const session = await req.patch()
      assert.notStrictEqual(session.unlocked, undefined)
      assert.notStrictEqual(session.unlocked, null)
    })
  })
})
