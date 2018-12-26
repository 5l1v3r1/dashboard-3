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

    it('should require impersonating administrator use own credentials', async () => {
      const owner = await TestHelper.createOwner()
      const administrator = await TestHelper.createAdministrator(owner)
      const user = await TestHelper.createUser()
      await TestHelper.setImpersonate(administrator, user.account.accountid)
      await TestHelper.lockSession(administrator, user.account.accountid)
      const req = TestHelper.createRequest(`/api/administrator/sessions?accountid=${user.account.accountid}`)
      req.account = owner.account
      req.session = owner.session
      const userSessions = await req.get()
      const impersonatingSession = userSessions[0]
      const req2 = TestHelper.createRequest(`/api/user/set-session-unlocked?sessionid=${impersonatingSession.sessionid}`)
      req2.account = administrator.account
      req2.session = administrator.session
      req2.body = {
        username: user.account.username,
        password: user.account.password
      }
      const session = await req2.patch()
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

    it('should unlock session for impersonating administrator', async () => {
      const owner = await TestHelper.createOwner()
      const administrator = await TestHelper.createAdministrator(owner)
      const username = administrator.account.username
      const password = administrator.account.password
      const user = await TestHelper.createUser()
      await TestHelper.setImpersonate(administrator, user.account.accountid)
      await TestHelper.lockSession(administrator, user.account.accountid)
      const req2 = TestHelper.createRequest(`/api/administrator/sessions?accountid=${user.account.accountid}`)
      req2.account = owner.account
      req2.session = owner.session
      const userSessions = await req2.get()
      const impersonatingSession = userSessions[0]
      const req = TestHelper.createRequest(`/api/user/set-session-unlocked?sessionid=${impersonatingSession.sessionid}`)
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        username,
        password
      }
      await req.patch()
      const userSessionsNow = await req2.get()
      const impersonatingSessionNow = userSessionsNow[0]
      assert.notStrictEqual(impersonatingSessionNow.unlocked, undefined)
      assert.notStrictEqual(impersonatingSessionNow.unlocked, null)
    })
  })
})
