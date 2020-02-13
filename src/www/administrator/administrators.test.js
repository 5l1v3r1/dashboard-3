/* eslint-env mocha */
const TestHelper = require('../../../test-helper.js')
const assert = require('assert')

describe('/administrator/administrators', () => {
  describe('Administrators#BEFORE', () => {
    it('should bind administrators to req', async () => {
      const owner = await TestHelper.createOwner()
      const administrator2 = await TestHelper.createAdministrator(owner)
      const req = TestHelper.createRequest('/administrator/administrators')
      req.account = owner.account
      req.session = owner.session
      await req.route.api.before(req)
      assert.strictEqual(req.data.administrators.length, global.pageSize)
      assert.strictEqual(req.data.administrators[0].accountid, administrator2.account.accountid)
      assert.strictEqual(req.data.administrators[1].accountid, owner.account.accountid)
    })
  })

  describe('Administrators#GET', () => {
    it('should present the administrators table (screenshots)', async () => {
      const administrator = await TestHelper.createOwner()
      const req = TestHelper.createRequest('/administrator/administrators')
      req.account = administrator.account
      req.session = administrator.session
      req.filename = __filename
      req.screenshots = [
        { hover: '#administrator-menu-container' },
        { click: '/administrator' },
        { click: '/administrator/administrators' }
      ]
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      const row = doc.getElementById(administrator.account.accountid)
      assert.strictEqual(row.tag, 'tr')
    })

    it('should return one page by default', async () => {
      const owner = await TestHelper.createOwner()
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        await TestHelper.createAdministrator(owner)
      }
      const req = TestHelper.createRequest('/administrator/administrators')
      req.account = owner.account
      req.session = owner.session
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      const table = doc.getElementById('administrators-table')
      const rows = table.getElementsByTagName('tr')
      assert.strictEqual(rows.length, global.pageSize + 1)
    })

    it('should enforce page size', async () => {
      global.pageSize = 3
      const owner = await TestHelper.createOwner()
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        await TestHelper.createAdministrator(owner)
      }
      const req = TestHelper.createRequest('/administrator/administrators')
      req.account = owner.account
      req.session = owner.session
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      const table = doc.getElementById('administrators-table')
      const rows = table.getElementsByTagName('tr')
      assert.strictEqual(rows.length, global.pageSize + 1)
    })

    it('should enforce specified offset', async () => {
      global.delayDiskWrites = true
      const offset = 1
      const owner = await TestHelper.createOwner()
      const administrators = [owner.account.accountid]
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        const user = await TestHelper.createAdministrator(owner)
        administrators.unshift(user.account.accountid)
      }
      const req = TestHelper.createRequest(`/administrator/administrators?offset=${offset}`)
      req.account = owner.account
      req.session = owner.session
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      for (let i = 0, len = global.pageSize; i < len; i++) {
        assert.strictEqual(doc.getElementById(administrators[offset + i]).tag, 'tr')
      }
    })
  })
})
