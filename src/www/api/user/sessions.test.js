/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/user/sessions', () => {
  describe('exceptions', () => {
    describe('invalid-accountid', () => {
      it('missing querystring accountid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/sessions')
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-accountid')
      })

      it('invalid querystring accountid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/sessions?accountid=invalid')
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-accountid')
      })
    })

    describe('invalid-account', () => {
      it('ineligible accessing account', async () => {
        const user = await TestHelper.createUser()
        const user2 = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/sessions?accountid=${user2.account.accountid}`)
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-account')
      })
    })
  })

  describe('receives', () => {
    it('optional querystring offset (integer)', async () => {
      global.delayDiskWrites = true
      const offset = 1
      const user = await TestHelper.createUser()
      const sessions = [user.session.sessionid]
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        await TestHelper.createSession(user)
        sessions.unshift(user.session.sessionid)
      }
      const req = TestHelper.createRequest(`/api/user/sessions?accountid=${user.account.accountid}&offset=${offset}`)
      req.account = user.account
      req.session = user.session
      const sessionsNow = await req.get()
      for (let i = 0, len = global.pageSize; i < len; i++) {
        assert.strictEqual(sessionsNow[i].sessionid, sessions[offset + i])
      }
    })

    it('optional querystring limit (integer)', async () => {
      const limit = 1
      const user = await TestHelper.createUser()
      const sessions = [user.session.sessionid]
      for (let i = 0, len = limit + 1; i < len; i++) {
        await TestHelper.createSession(user)
        sessions.unshift(user.session.sessionid)
      }
      const req = TestHelper.createRequest(`/api/user/sessions?accountid=${user.account.accountid}&limit=${limit}`)
      req.account = user.account
      req.session = user.session
      const sessionsNow = await req.get()
      assert.strictEqual(sessionsNow.length, limit)
    })

    it('optional querystring all (boolean)', async () => {
      const user = await TestHelper.createUser()
      const sessions = [user.session.sessionid]
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        await TestHelper.createSession(user)
        sessions.unshift(user.session.sessionid)
      }
      const req = TestHelper.createRequest(`/api/user/sessions?accountid=${user.account.accountid}&all=true`)
      req.account = user.account
      req.session = user.session
      const sessionsNow = await req.get()
      assert.strictEqual(sessionsNow.length, sessions.length)
    })
  })

  describe('returns', () => {
    it('array', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/sessions?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      req.filename = __filename
      req.saveResponse = true
      const sessions = await req.get()
      assert.strictEqual(sessions.length, 1)
      assert.strictEqual(sessions[0].sessionid, req.session.sessionid)
    })
  })

  describe('configuration', () => {
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
  })
})
