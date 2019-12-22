/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe('/account/sessions', () => {
  describe('Sessions#BEFORE', () => {
    it('should bind sessions to req', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/sessions')
      req.account = user.account
      req.session = user.session
      await req.route.api.before(req)
      assert.strictEqual(req.data.sessions.length, 1)
      assert.strictEqual(req.data.sessions[0].sessionid, user.session.sessionid)
    })
  })

  describe('Sessions#GET', () => {
    it('should exclude ended sessions', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/signout')
      req.account = user.account
      req.session = user.session
      req.filename = __filename
      req.screenshots = [
        { hover: '#account-menu-container' },
        { click: '/account' },
        { click: '/account/sessions' }
      ]
      await req.get()
      const req2 = TestHelper.createRequest('/account/signin')
      req2.body = {
        username: user.account.username,
        password: user.account.password
      }
      const doc = await req2.post()
      const sessionRow = doc.getElementById(`${req.session.sessionid}`)
      assert.strictEqual(undefined, sessionRow)
    })

    it('should limit sessions to one page', async () => {
      const user = await TestHelper.createUser()
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        await TestHelper.createSession(user)
      }
      const req = TestHelper.createRequest('/account/sessions')
      req.account = user.account
      req.session = user.session
      const page = await req.get()
      const doc = TestHelper.extractDoc(page)
      const table = doc.getElementById('sessions-table')
      const rows = table.getElementsByTagName('tr')
      assert.strictEqual(rows.length, global.pageSize + 1)
    })

    it('should enforce page size', async () => {
      global.pageSize = 3
      const user = await TestHelper.createUser()
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        await TestHelper.createSession(user)
      }
      const req = TestHelper.createRequest('/account/sessions')
      req.account = user.account
      req.session = user.session
      const page = await req.get()
      const doc = TestHelper.extractDoc(page)
      const table = doc.getElementById('sessions-table')
      const rows = table.getElementsByTagName('tr')
      assert.strictEqual(rows.length, global.pageSize + 1)
    })

    it('should enforce specified offset', async () => {
      global.delayDiskWrites = true
      const offset = 1
      const user = await TestHelper.createUser()
      const sessions = [user.session.sessionid]
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        const session = await TestHelper.createSession(user)
        sessions.unshift(session.sessionid)
      }
      const req = TestHelper.createRequest(`/account/sessions?offset=${offset}`)
      req.account = user.account
      req.session = user.session
      const page = await req.get()
      const doc = TestHelper.extractDoc(page)
      for (let i = 0, len = global.pageSize; i < len; i++) {
        assert.strictEqual(doc.getElementById(sessions[offset + i]).tag, 'tr')
      }
    })
  })
})
