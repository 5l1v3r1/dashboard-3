/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/account-reset-codes', () => {
  describe('AccountResetCodes#GET', () => {
    it('should return reset codes', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      await TestHelper.createResetCode(user)
      const req = TestHelper.createRequest(`/api/administrator/account-reset-codes?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      const resetCodes = await req.get()
      assert.strictEqual(resetCodes.length, 1)
      assert.strictEqual(resetCodes[0].accountid, user.account.accountid)
    })

    it('should redact code hash', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      await TestHelper.createResetCode(user)
      const req = TestHelper.createRequest(`/api/administrator/account-reset-codes?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      const resetCodes = await req.get()
      assert.strictEqual(resetCodes.length, 1)
      assert.strictEqual(undefined, resetCodes[0].code)
    })

    it('should enforce page size', async () => {
      global.pageSize = 3
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        await TestHelper.createResetCode(user)
      }
      const req = TestHelper.createRequest(`/api/administrator/account-reset-codes?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      const codesNow = await req.get()
      assert.strictEqual(codesNow.length, global.pageSize)
    })

    it('should enforce specified offset', async () => {
      const offset = 1
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const codes = []
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        await TestHelper.createResetCode(user)
        codes.unshift(user.resetCode)
      }
      const req = TestHelper.createRequest(`/api/administrator/account-reset-codes?accountid=${user.account.accountid}&offset=${offset}`)
      req.account = administrator.account
      req.session = administrator.session
      const codesNow = await req.get()
      for (let i = 0, len = global.pageSize; i < len; i++) {
        assert.strictEqual(codesNow[i].codeid, codes[offset + i].codeid)
      }
    })

    it('should return all records', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const codes = []
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        await TestHelper.createResetCode(user)
        codes.unshift(user.resetCode)
      }
      const req = TestHelper.createRequest(`/api/administrator/account-reset-codes?accountid=${user.account.accountid}&all=true`)
      req.account = administrator.account
      req.session = administrator.session
      const codesNow = await req.get()
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        assert.strictEqual(codesNow[i].codeid, codes[i].codeid)
      }
    })
  })
})
