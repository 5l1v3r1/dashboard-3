/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/accounts', () => {
  describe('receives', () => {
    it('optional querystring offset (integer)', async () => {
      global.delayDiskWrites = true
      const offset = 1
      const administrator = await TestHelper.createOwner()
      const accounts = [administrator.account.accountid]
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        const user = await TestHelper.createUser()
        accounts.unshift(user.account.accountid)
      }
      const req = TestHelper.createRequest(`/api/administrator/accounts?offset=${offset}`)
      req.account = administrator.account
      req.session = administrator.session
      const accountsNow = await req.get()
      for (let i = 0, len = global.pageSize; i < len; i++) {
        assert.strictEqual(accountsNow[i].accountid, accounts[offset + i])
      }
    })

    it('optional querystring limit (integer)', async () => {
      const limit = 1
      const administrator = await TestHelper.createOwner()
      const accounts = [administrator.account.accountid]
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        const user = await TestHelper.createUser()
        accounts.unshift(user.account.accountid)
      }
      const req = TestHelper.createRequest(`/api/administrator/accounts?limit=${limit}`)
      req.account = administrator.account
      req.session = administrator.session
      const accountsNow = await req.get()
      assert.strictEqual(accountsNow.length, limit)
    })

    it('optional querystring all (boolean)', async () => {
      const administrator = await TestHelper.createOwner()
      const accounts = [administrator.account.accountid]
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        const user = await TestHelper.createUser()
        accounts.unshift(user.account.accountid)
      }
      const req = TestHelper.createRequest('/api/administrator/accounts?all=true')
      req.account = administrator.account
      req.session = administrator.session
      const accountsNow = await req.get()
      assert.strictEqual(accountsNow.length, accounts.length)
    })
  })

  describe('returns', () => {
    it('array', async () => {
      const administrator = await TestHelper.createOwner()
      for (let i = 0, len = global.pageSize; i < len; i++) {
        await TestHelper.createUser()
      }
      const req = TestHelper.createRequest('/api/administrator/accounts')
      req.account = administrator.account
      req.session = administrator.session
      req.filename = __filename
      req.saveResponse = true
      const accountsNow = await req.get()
      assert.strictEqual(accountsNow.length, global.pageSize)
    })
  })

  describe('redacts', () => {
    it('username hash', async () => {
      const administrator = await TestHelper.createOwner()
      const req = TestHelper.createRequest('/api/administrator/accounts')
      req.account = administrator.account
      req.session = administrator.session
      const accounts = await req.get()
      assert.strictEqual(undefined, accounts[0].usernameHash)
    })

    it('password hash', async () => {
      const administrator = await TestHelper.createOwner()
      const req = TestHelper.createRequest('/api/administrator/accounts')
      req.account = administrator.account
      req.session = administrator.session
      const accounts = await req.get()
      assert.strictEqual(undefined, accounts[0].passwordHash)
    })

    it('sessionKey', async () => {
      const administrator = await TestHelper.createOwner()
      const req = TestHelper.createRequest('/api/administrator/accounts')
      req.account = administrator.account
      req.session = administrator.session
      const accounts = await req.get()
      assert.strictEqual(undefined, accounts[0].sessionKey)
    })
  })

  describe('configuration', () => {
    it('environment PAGE_SIZE', async () => {
      global.pageSize = 3
      const administrator = await TestHelper.createOwner()
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        await TestHelper.createUser()
      }
      const req = TestHelper.createRequest('/api/administrator/accounts')
      req.account = administrator.account
      req.session = administrator.session
      const accountsNow = await req.get()
      assert.strictEqual(accountsNow.length, global.pageSize)
    })
  })
})
