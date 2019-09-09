/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/sessions', () => {
  describe('receives', () => {
    it('optional querystring offset (integer)', async () => {
      const offset = 1
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const sessions = [user.session]
      for (let i = 0, len = offset + global.pageSize + 1; i < len; i++) {
        await TestHelper.createSession(user)
        sessions.unshift(user.session)
      }
      const req = TestHelper.createRequest(`/api/administrator/sessions?offset=${offset}`)
      req.account = administrator.account
      req.session = administrator.session
      const sessionsNow = await req.get()
      for (let i = 0, len = global.pageSize; i < len; i++) {
        assert.strictEqual(sessionsNow[i].profileid, sessions[offset + i].profileid)
      }
    })

    it('optional querystring all (boolean)', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const sessions = [user.session]
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        await TestHelper.createSession(user)
        sessions.unshift(user.session)
      }
      const req = TestHelper.createRequest(`/api/administrator/sessions?all=true`)
      req.account = administrator.account
      req.session = administrator.session
      const sessionsNow = await req.get()
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        assert.strictEqual(sessionsNow[i].profileid, sessions[i].profileid)
      }
    })
  })

  describe('returns', () => {
    it('array', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/api/administrator/sessions')
      req.account = administrator.account
      req.session = administrator.session
      const sessions = await req.get()
      assert.strictEqual(sessions.length, global.pageSize)
      assert.strictEqual(sessions[0].sessionid, user.session.sessionid)
      assert.strictEqual(sessions[1].sessionid, administrator.session.sessionid)
    })

    it('redacted session token', async () => {
      const administrator = await TestHelper.createOwner()
      await TestHelper.createUser()
      const req = TestHelper.createRequest('/api/administrator/sessions')
      req.account = administrator.account
      req.session = administrator.session
      const sessions = await req.get()
      assert.strictEqual(undefined, sessions[0].token)
      assert.strictEqual(undefined, sessions[1].token)
    })
  })

  describe('configuration', () => {
    it('environment PAGE_SIZE', async () => {
      global.pageSize = 3
      const administrator = await TestHelper.createOwner()
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        await TestHelper.createUser()
      }
      const req = TestHelper.createRequest('/api/administrator/sessions')
      req.account = administrator.account
      req.session = administrator.session
      const profilesNow = await req.get()
      assert.strictEqual(profilesNow.length, global.pageSize)
    })
  })
})
