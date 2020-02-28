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
      global.delayDiskWrites = true
      const offset = 1
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const codes = []
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        await TestHelper.createResetCode(user)
        codes.unshift(user.resetCode.codeid)
      }
      const req = TestHelper.createRequest(`/api/administrator/account-reset-codes?accountid=${user.account.accountid}&offset=${offset}`)
      req.account = administrator.account
      req.session = administrator.session
      const codesNow = await req.get()
      for (let i = 0, len = global.pageSize; i < len; i++) {
        assert.strictEqual(codesNow[i].codeid, codes[offset + i])
      }
    })

    it('optional querystring limit (integer)', async () => {
      const limit = 1
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const codes = []
      for (let i = 0, len = limit + 1; i < len; i++) {
        await TestHelper.createResetCode(user)
        codes.unshift(user.resetCode.codeid)
      }
      const req = TestHelper.createRequest(`/api/administrator/account-reset-codes?accountid=${user.account.accountid}&limit=${limit}`)
      req.account = administrator.account
      req.session = administrator.session
      const codesNow = await req.get()
      assert.strictEqual(codesNow.length, limit)
    })

    it('optional querystring all (boolean)', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const codes = []
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        await TestHelper.createResetCode(user)
        codes.unshift(user.resetCode.codeid)
      }
      const req = TestHelper.createRequest(`/api/administrator/account-reset-codes?accountid=${user.account.accountid}&all=true`)
      req.account = administrator.account
      req.session = administrator.session
      const codesNow = await req.get()
      assert.strictEqual(codesNow.length, codes.length)
    })
  })

  describe('returns', () => {
    it('array', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        await TestHelper.createResetCode(user)
      }
      const req = TestHelper.createRequest(`/api/administrator/account-reset-codes?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      req.filename = __filename
      req.saveResponse = true
      const codesNow = await req.get()
      assert.strictEqual(codesNow.length, global.pageSize)
    })
  })

  describe('redacts', () => {
    it('secretCodeHash', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      await TestHelper.createResetCode(user)
      const req = TestHelper.createRequest(`/api/administrator/account-reset-codes?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      const codesNow = await req.get()
      assert.strictEqual(codesNow[0].secretCodeHash, undefined)
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
      const req = TestHelper.createRequest(`/api/administrator/account-reset-codes?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      const codesNow = await req.get()
      assert.strictEqual(codesNow.length, global.pageSize)
    })
  })
})
