/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe('/administrator/account-sessions', () => {
  describe('AccountSessions#BEFORE', () => {
    it('should bind sessions to req', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      await TestHelper.createResetCode(user)
      const user2 = await TestHelper.createUser()
      await TestHelper.createResetCode(user2)
      const req = TestHelper.createRequest(`/administrator/account-sessions?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      await req.route.api.before(req)
      assert.strictEqual(req.data.sessions.length, 1)
      assert.strictEqual(req.data.sessions[0].accountid, user.account.accountid)
    })
  })

  describe('AccountSessions#GET', () => {
    it('should present the sessions table', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      await TestHelper.createResetCode(user)
      const req = TestHelper.createRequest(`/administrator/account-sessions?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      const page = await req.get()
      const doc = TestHelper.extractDoc(page)
      const table = doc.getElementById('sessions-table')
      const tableString = table.toString()
      assert.strictEqual(tableString.indexOf(user.session.accountid) > -1, true)
    })

    it('should present the account table', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/administrator/account-sessions?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      const page = await req.get()
      const doc = TestHelper.extractDoc(page)
      const row = doc.getElementById(user.account.accountid)
      assert.strictEqual(row.tag, 'tr')
    })

    it('should limit sessions to one page', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        await TestHelper.createSession(user)
      }
      const req = TestHelper.createRequest(`/administrator/account-sessions?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      const page = await req.get()
      const doc = TestHelper.extractDoc(page)
      const table = doc.getElementById('sessions-table')
      const rows = table.getElementsByTagName('tr')
      assert.strictEqual(rows.length, global.pageSize + 1)
    })

    it('should enforce page size', async () => {
      global.pageSize = 3
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        await TestHelper.createSession(user)
      }
      const req = TestHelper.createRequest(`/administrator/account-sessions?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      const page = await req.get()
      const doc = TestHelper.extractDoc(page)
      const table = doc.getElementById('sessions-table')
      const rows = table.getElementsByTagName('tr')
      assert.strictEqual(rows.length, global.pageSize + 1)
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
      const req = TestHelper.createRequest(`/administrator/account-sessions?accountid=${user.account.accountid}&offset=${offset}`)
      req.account = administrator.account
      req.session = administrator.session
      const page = await req.get()
      const doc = TestHelper.extractDoc(page)
      for (let i = 0, len = global.pageSize; i < len; i++) {
        assert.strictEqual(doc.getElementById(sessions[offset + i].sessionid).tag, 'tr')
      }
    })
  })
})
