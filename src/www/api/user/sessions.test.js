/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/user/sessions`, () => {
  describe('Sessions#GET', () => {
    it('should limit session list to one page', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/sessions?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      const sessions = await req.get()
      assert.strictEqual(sessions.length, 1)
      assert.strictEqual(sessions[0].sessionid, req.session.sessionid)
    })

    it('environment PAGE_SIZE', async () => {
      global.pageSize = 3
      const user = await TestHelper.createUser()
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        await TestHelper.createSession(user)
      }
      const req = TestHelper.createRequest(`/api/user/sessions?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      const sessionsNow = await req.get()
      assert.strictEqual(sessionsNow.length, global.pageSize)
    })

    it('optional querystring offset (integer)', async () => {
      const offset = 1
      const user = await TestHelper.createUser()
      const sessions = [ user.session ]
      for (let i = 0, len = offset + global.pageSize + 1; i < len; i++) {
        await TestHelper.createSession(user)
        sessions.unshift(user.session)
      }
      const req = TestHelper.createRequest(`/api/user/sessions?accountid=${user.account.accountid}&offset=${offset}`)
      req.account = user.account
      req.session = user.session
      const sessionsNow = await req.get()
      for (let i = 0, len = global.pageSize; i < len; i++) {
        assert.strictEqual(sessionsNow[i].sessionid, sessions[offset + i].sessionid)
      }
    })

    it('optional querystring all (boolean)', async () => {
      const user = await TestHelper.createUser()
      const sessions = [user.session]
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        await TestHelper.createSession(user)
        sessions.unshift(user.session)
      }
      const req = TestHelper.createRequest(`/api/user/sessions?accountid=${user.account.accountid}&all=true`)
      req.account = user.account
      req.session = user.session
      const sessionsNow = await req.get()
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        assert.strictEqual(sessionsNow[i].sessionid, sessions[i].sessionid)
      }
    })
  })
})
