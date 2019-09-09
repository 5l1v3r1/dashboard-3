/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe('/administrator/delete-schedule', () => {
  describe('DeleteSchedule#BEFORE', () => {
    it('should bind deleted accounts to req', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      await TestHelper.setDeleted(user)
      const user2 = await TestHelper.createUser()
      await TestHelper.setDeleted(user2)
      const req = TestHelper.createRequest('/administrator/delete-schedule')
      req.account = administrator.account
      req.session = administrator.session
      await req.route.api.before(req)
      assert.strictEqual(req.data.accounts.length, global.pageSize)
      assert.strictEqual(req.data.accounts[0].accountid, user2.account.accountid)
      assert.strictEqual(req.data.accounts[1].accountid, user.account.accountid)
    })
  })

  describe('DeleteSchedule#GET', () => {
    it('should present the deleted accounts table', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      await TestHelper.setDeleted(user)
      const req = TestHelper.createRequest('/administrator/delete-schedule')
      req.account = administrator.account
      req.session = administrator.session
      const page = await req.get()
      const doc = TestHelper.extractDoc(page)
      const row = doc.getElementById(user.account.accountid)
      assert.strictEqual(row.tag, 'tr')
    })

    it('array', async () => {
      const administrator = await TestHelper.createOwner()
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        const user = await TestHelper.createUser()
        await TestHelper.setDeleted(user)
      }
      const req = TestHelper.createRequest('/administrator/delete-schedule')
      req.account = administrator.account
      req.session = administrator.session
      const page = await req.get()
      const doc = TestHelper.extractDoc(page)
      const table = doc.getElementById('accounts-table')
      const rows = table.getElementsByTagName('tr')
      assert.strictEqual(rows.length, global.pageSize + 1)
    })

    it('should enforce page size', async () => {
      global.pageSize = 3
      const administrator = await TestHelper.createOwner()
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        const user = await TestHelper.createUser()
        await TestHelper.setDeleted(user)
      }
      const req = TestHelper.createRequest('/administrator/delete-schedule')
      req.account = administrator.account
      req.session = administrator.session
      const page = await req.get()
      const doc = TestHelper.extractDoc(page)
      const table = doc.getElementById('accounts-table')
      const rows = table.getElementsByTagName('tr')
      assert.strictEqual(rows.length, global.pageSize + 1)
    })

    it('should enforce specified offset', async () => {
      const offset = 1
      const administrator = await TestHelper.createOwner()
      const users = [ ]
      for (let i = 0, len = offset + global.pageSize + 1; i < len; i++) {
        const user = await TestHelper.createUser()
        await TestHelper.setDeleted(user)
        users.unshift(user.account)
      }
      const req = TestHelper.createRequest(`/administrator/delete-schedule?offset=${offset}`)
      req.account = administrator.account
      req.session = administrator.session
      const page = await req.get()
      const doc = TestHelper.extractDoc(page)
      for (let i = 0, len = global.pageSize; i < len; i++) {
        assert.strictEqual(doc.getElementById(users[offset + i].accountid).tag, 'tr')
      }
    })
  })
})
