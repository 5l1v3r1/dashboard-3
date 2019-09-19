/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe('/administrator/accounts', () => {
  describe('Accounts#BEFORE', () => {
    it('should bind accounts to req', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/administrator/accounts')
      req.account = administrator.account
      req.session = administrator.session
      await req.route.api.before(req)
      assert.strictEqual(req.data.accounts.length, global.pageSize)
      assert.strictEqual(req.data.accounts[0].accountid, user.account.accountid)
      assert.strictEqual(req.data.accounts[1].accountid, administrator.account.accountid)
    })
  })

  describe('Accounts#GET', () => {
    it('should present the accounts table', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/administrator/accounts')
      req.account = administrator.account
      req.session = administrator.session
      const page = await req.get()
      const doc = TestHelper.extractDoc(page)
      const table = doc.getElementById('accounts-table')
      const row1 = table.getElementById(user.account.accountid)
      const row2 = table.getElementById(administrator.account.accountid)
      assert.strictEqual(row1.tag, 'tr')
      assert.strictEqual(row2.tag, 'tr')
    })

    it('should return one page by default', async () => {
      const administrator = await TestHelper.createOwner()
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        await TestHelper.createUser()
      }
      const req = TestHelper.createRequest('/administrator/accounts')
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
        await TestHelper.createUser()
      }
      const req = TestHelper.createRequest('/administrator/accounts')
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
      const accounts = [administrator.account]
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        const user = await TestHelper.createUser()
        accounts.unshift(user.account)
      }
      const req = TestHelper.createRequest(`/administrator/accounts?offset=${offset}`)
      req.account = administrator.account
      req.session = administrator.session
      const page = await req.get()
      const doc = TestHelper.extractDoc(page)
      for (let i = 0, len = global.pageSize; i < len; i++) {
        assert.strictEqual(doc.getElementById(accounts[offset + i].accountid).tag, 'tr')
      }
    })
  })
})
