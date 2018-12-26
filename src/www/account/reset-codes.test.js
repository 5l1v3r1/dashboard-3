/* eslint-env mocha */
const assert = require('assert')
const dashboard = require('../../../index.js')
const TestHelper = require('../../../test-helper.js')

describe('/account/reset-codes', () => {
  describe('ResetCodes#BEFORE', () => {
    it('should bind reset codes to req', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createResetCode(user)
      const req = TestHelper.createRequest('/account/reset-codes')
      req.account = user.account
      req.session = user.session
      await req.route.api.before(req)
      assert.strictEqual(req.data.resetCodes.length, 1)
      assert.strictEqual(req.data.resetCodes[0].accountid, user.account.accountid)
    })
  })

  describe('ResetCodes#GET', () => {
    it('should show never created', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/reset-codes')
      req.account = user.account
      req.session = user.session
      const page = await req.get()
      const doc = TestHelper.extractDoc(page)
      const lastCreated = doc.getElementById('last-created-1')
      assert.strictEqual(lastCreated.child.length, 1)
    })

    it('should update created date', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createResetCode(user)
      const req = TestHelper.createRequest('/account/reset-codes')
      req.account = user.account
      req.session = user.session
      req.body = {
        code: 'code-' + new Date().getTime() + '-' + Math.ceil(Math.random() * 1000)
      }
      const page = await req.get()
      const doc = TestHelper.extractDoc(page)
      const lastCreated = doc.getElementById('last-created-1')
      const date = dashboard.Format.date(new Date())
      assert.strictEqual(lastCreated.parentNode.toString().indexOf(date) > -1, true)
    })

    it('should show never deleted', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/reset-codes')
      req.account = user.account
      req.session = user.session
      const page = await req.get()
      const doc = TestHelper.extractDoc(page)
      const lastDeleted = doc.getElementById('last-deleted-2')
      assert.strictEqual(lastDeleted.child.length, 1)
    })

    it('should update deleted date', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createResetCode(user)
      await TestHelper.deleteResetCode(user, user.resetCode.codeid)
      const req = TestHelper.createRequest(`/account/reset-codes`)
      req.account = user.account
      req.session = user.session
      const page = await req.get()
      const doc = TestHelper.extractDoc(page)
      const lastDeleted = doc.getElementById('last-deleted-2')
      const date = dashboard.Format.date(new Date())
      assert.strictEqual(lastDeleted.parentNode.toString().indexOf(date) > -1, true)
    })

    it('should show never used', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/reset-codes')
      req.account = user.account
      req.session = user.session
      const page = await req.get()
      const doc = TestHelper.extractDoc(page)
      const lastUsed = doc.getElementById('last-used-3')
      assert.strictEqual(lastUsed.child.length, 1)
    })

    it('should update used date', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createResetCode(user)
      await TestHelper.useResetCode(user)
      await TestHelper.createSession(user)
      const req = TestHelper.createRequest('/account/reset-codes')
      req.account = user.account
      req.session = user.session
      const page = await req.get()
      const doc = TestHelper.extractDoc(page)
      const lastUsed = doc.getElementById('last-used-3')
      const date = dashboard.Format.date(new Date())
      assert.strictEqual(lastUsed.parentNode.toString().indexOf(date) > -1, true)
    })

    it('should limit reset codes to one page', async () => {
      const user = await TestHelper.createUser()
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        await TestHelper.createResetCode(user)
      }
      const req = TestHelper.createRequest('/account/reset-codes')
      req.account = user.account
      req.session = user.session
      const page = await req.get()
      const doc = TestHelper.extractDoc(page)
      const table = doc.getElementById('reset-codes-table')
      const rows = table.getElementsByTagName('tr')
      assert.strictEqual(rows.length, global.pageSize + 1)
    })

    it('should enforce page size', async () => {
      global.pageSize = 3
      const user = await TestHelper.createUser()
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        await TestHelper.createResetCode(user)
      }
      const req = TestHelper.createRequest('/account/reset-codes')
      req.account = user.account
      req.session = user.session
      const page = await req.get()
      const doc = TestHelper.extractDoc(page)
      const table = doc.getElementById('reset-codes-table')
      const rows = table.getElementsByTagName('tr')
      assert.strictEqual(rows.length, global.pageSize + 1)
    })

    it('should enforce specified offset', async () => {
      const offset = 1
      const user = await TestHelper.createUser()
      const codes = [ user.resetCode ]
      for (let i = 0, len = offset + global.pageSize + 1; i < len; i++) {
        await TestHelper.createResetCode(user)
        codes.unshift(user.resetCode)
      }
      const req = TestHelper.createRequest(`/account/reset-codes?offset=${offset}`)
      req.account = user.account
      req.session = user.session
      const page = await req.get()
      const doc = TestHelper.extractDoc(page)
      for (let i = 0, len = global.pageSize; i < len; i++) {
        assert.strictEqual(doc.getElementById(codes[offset + i].codeid).tag, 'tr')
      }
    })
  })
})
