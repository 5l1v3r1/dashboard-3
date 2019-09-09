/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/reset-codes', () => {
  describe('receives', () => {
    it('optional querystring offset (integer)', async () => {
      const offset = 1
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const codes = []
      for (let i = 0, len = offset + global.pageSize + 1; i < len; i++) {
        await TestHelper.createResetCode(user)
        codes.unshift(user.resetCode)
      }
      const req = TestHelper.createRequest(`/api/administrator/reset-codes?offset=${offset}`)
      req.account = administrator.account
      req.session = administrator.session
      const codesNow = await req.get()
      for (let i = 0, len = global.pageSize; i < len; i++) {
        assert.strictEqual(codesNow[i].codeid, codes[offset + i].codeid)
      }
    })

    it('optional querystring all (boolean)', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const codes = []
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        await TestHelper.createResetCode(user)
        codes.unshift(user.resetCode)
      }
      const req = TestHelper.createRequest(`/api/administrator/reset-codes?all=true`)
      req.account = administrator.account
      req.session = administrator.session
      const codesNow = await req.get()
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        assert.strictEqual(codesNow[i].codeid, codes[i].codeid)
      }
    })
  })

  describe('returns', () => {
    it('should return reset codes', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      await TestHelper.createResetCode(user)
      const user2 = await TestHelper.createUser()
      await TestHelper.createResetCode(user2)
      const req = TestHelper.createRequest('/api/administrator/reset-codes')
      req.account = administrator.account
      req.session = administrator.session
      const resetCodes = await req.get()
      assert.strictEqual(resetCodes.length, global.pageSize)
      assert.strictEqual(resetCodes[0].accountid, user2.account.accountid)
      assert.strictEqual(resetCodes[1].accountid, user.account.accountid)
    })
  })

  describe('redacts', () => {
    it('secret code hash', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      await TestHelper.createResetCode(user)
      const req = TestHelper.createRequest('/api/administrator/reset-codes')
      req.account = administrator.account
      req.session = administrator.session
      const resetCodes = await req.get()
      assert.strictEqual(resetCodes.length, 1)
      assert.strictEqual(undefined, resetCodes[0].secretCodeHash)
    })
  })

  describe('configuration', () => {
    it('environment PAGE_SIZE', async () => {
      global.pageSize = 3
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        await TestHelper.createResetCode(user)
      }
      const req = TestHelper.createRequest('/api/administrator/reset-codes')
      req.account = administrator.account
      req.session = administrator.session
      const codesNow = await req.get()
      assert.strictEqual(codesNow.length, global.pageSize)
    })
  })
})
