/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/user/reset-codes`, () => {
  describe('ResetCodes#GET', () => {
    it('should limit codes to one page', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createResetCode(user)
      await TestHelper.createResetCode(user)
      const req = TestHelper.createRequest(`/api/user/reset-codes?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      const codesNow = await req.get()
      assert.strictEqual(codesNow.length, global.pageSize)
    })

    it('should redact code hash', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createResetCode(user)
      const req = TestHelper.createRequest(`/api/user/reset-codes?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      const codesNow = await req.get()
      assert.strictEqual(codesNow.length, 1)
      assert.strictEqual(undefined, codesNow[0].code)
    })

    it('should enforce page size', async () => {
      global.pageSize = 3
      const user = await TestHelper.createUser()
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        await TestHelper.createResetCode(user)
      }
      const req = TestHelper.createRequest(`/api/user/reset-codes?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      const codesNow = await req.get()
      assert.strictEqual(codesNow.length, global.pageSize)
    })

    it('should enforce specified offset', async () => {
      const offset = 1
      const user = await TestHelper.createUser()
      const codes = []
      for (let i = 0, len = offset + global.pageSize + 1; i < len; i++) {
        await TestHelper.createResetCode(user)
        codes.unshift(user.resetCode)
      }
      const req = TestHelper.createRequest(`/api/user/reset-codes?accountid=${user.account.accountid}&offset=${offset}`)
      req.account = user.account
      req.session = user.session
      const codesNow = await req.get()
      for (let i = 0, len = global.pageSize; i < len; i++) {
        assert.strictEqual(codesNow[i].codeid, codes[offset + i].codeid)
      }
    })

    it('should return all records', async () => {
      const user = await TestHelper.createUser()
      const codes = [user.resetCode]
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        await TestHelper.createResetCode(user)
        codes.unshift(user.resetCode)
      }

      const req = TestHelper.createRequest(`/api/user/reset-codes?accountid=${user.account.accountid}&all=true`)
      req.account = user.account
      req.session = user.session
      const codesNow = await req.get()
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        assert.strictEqual(codesNow[i].codeid, codes[i].codeid)
      }
    })
  })
})
