/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/account-sessions', () => {
  describe('AccountSessions#GET', () => {
    it('should return sessions', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/administrator/account-sessions?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      const sessions = await req.get()
      assert.strictEqual(sessions.length, 1)
      assert.strictEqual(sessions[0].sessionid, user.session.sessionid)
    })

    it('should redact each session token', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/administrator/account-sessions?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      const sessions = await req.get()
      assert.strictEqual(sessions.length, 1)
      assert.strictEqual(undefined, sessions[0].token)
    })

    it('should enforce page size', async () => {
      global.pageSize = 3
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        await TestHelper.createSession(user)
      }
      const req = TestHelper.createRequest(`/api/administrator/account-sessions?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      const profilesNow = await req.get()
      assert.strictEqual(profilesNow.length, global.pageSize)
    })

    it('should enforce specified offset', async () => {
      const offset = 1
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const sessions = [ user.session ]
      for (let i = 0, len = offset + global.pageSize + 1; i < len; i++) {
        await TestHelper.createSession(user)
        sessions.unshift(user.session)
      }
      const req = TestHelper.createRequest(`/api/administrator/account-sessions?accountid=${user.account.accountid}&offset=${offset}`)
      req.account = administrator.account
      req.session = administrator.session
      const sessionsNow = await req.get()
      for (let i = 0, len = global.pageSize; i < len; i++) {
        assert.strictEqual(sessionsNow[i].sessionid, sessions[offset + i].sessionid)
      }
    })

    it('should return all records', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const sessions = [user.session]
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        await TestHelper.createSession(user)
        sessions.unshift(user.session)
      }
      const req = TestHelper.createRequest(`/api/administrator/account-sessions?accountid=${user.account.accountid}&all=true`)
      req.account = administrator.account
      req.session = administrator.session
      const sessionsNow = await req.get()
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        assert.strictEqual(sessionsNow[i].sessionid, sessions[i].sessionid)
      }
    })
  })
})
