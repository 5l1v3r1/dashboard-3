/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/account-reset-codes', () => {
  describe('exceptions', () => {
    describe('invalid-accountid', () => {
      it('unspecified querystring accountid', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/account-reset-codes')
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-accountid')
      })

      it('invalid querystring accountid', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/account-reset-codes?accountid=invalid')
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-accountid')
      })
    })
  })

  describe('receives', () => {
    it('optional querystring offset (integer)', async () => {
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

    it('optional querystring all (boolean)', async () => {
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

  describe('returns', () => {
    it('array', async () => {
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

  describe('redacts', () => {
    it('secret code hash', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      await TestHelper.createResetCode(user)
      const req = TestHelper.createRequest(`/api/administrator/account-reset-codes?accountid=${user.account.accountid}`)
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
      const codes = []
      for (let i = 0, len = global.pageSize; i < len; i++) {
        await TestHelper.createResetCode(user)
        codes.unshift(user.resetCode)
      }
      const req = TestHelper.createRequest(`/api/administrator/account-reset-codes?accountid=${user.account.accountid}&all=true`)
      req.account = administrator.account
      req.session = administrator.session
      const codesNow = await req.get()
      assert.strictEqual(codesNow.length, global.pageSize)
    })
  })
})
