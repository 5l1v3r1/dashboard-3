/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe('/administrator/account-reset-codes', () => {
  describe('AccountResetCodes#BEFORE', () => {
    it('should bind reset codes to req', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      await TestHelper.createResetCode(user)
      const user2 = await TestHelper.createUser()
      await TestHelper.createResetCode(user2)
      const req = TestHelper.createRequest(`/administrator/account-reset-codes?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      await req.route.api.before(req)
      assert.strictEqual(req.data.resetCodes.length, 1)
      assert.strictEqual(req.data.resetCodes[0].accountid, user.account.accountid)
    })
  })

  describe('AccountResetCodes#GET', () => {
    it('should present the reset codes table (screenshots)', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      await TestHelper.createResetCode(user)
      const req = TestHelper.createRequest(`/administrator/account-reset-codes?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      req.filename = __filename
      req.screenshots = [
        { hover: '#administrator-menu-container' },
        { click: '/administrator' },
        { click: '/administrator/accounts' },
        { click: `/administrator/account?accountid=${user.account.accountid}` },
        { click: `/administrator/account-reset-codes?accountid=${user.account.accountid}` }
      ]
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      const row = doc.getElementById(user.resetCode.codeid)
      assert.strictEqual(row.tag, 'tr')
    })

    it('should present the account table', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/administrator/account-reset-codes?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      const row = doc.getElementById(user.account.accountid)
      assert.strictEqual(row.tag, 'tr')
    })

    it('should return one page by default', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        await TestHelper.createResetCode(user)
      }
      const req = TestHelper.createRequest(`/administrator/account-reset-codes?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      const table = doc.getElementById('reset-codes-table')
      const rows = table.getElementsByTagName('tr')
      assert.strictEqual(rows.length, global.pageSize + 1)
    })

    it('should enforce page size', async () => {
      global.pageSize = 3
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        await TestHelper.createResetCode(user)
      }
      const req = TestHelper.createRequest(`/administrator/account-reset-codes?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      const table = doc.getElementById('reset-codes-table')
      const rows = table.getElementsByTagName('tr')
      assert.strictEqual(rows.length, global.pageSize + 1)
    })

    it('should enforce specified offset', async () => {
      global.delayDiskWrites = true
      const offset = 1
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const codes = []
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        await TestHelper.createResetCode(user)
        codes.unshift(user.resetCode.codeid)
      }
      const req = TestHelper.createRequest(`/administrator/account-reset-codes?accountid=${user.account.accountid}&offset=${offset}`)
      req.account = administrator.account
      req.session = administrator.session
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      for (let i = 0, len = global.pageSize; i < len; i++) {
        assert.strictEqual(doc.getElementById(codes[offset + i]).tag, 'tr')
      }
    })
  })
})
