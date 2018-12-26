/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/accounts', () => {
  describe('Accounts#GET', () => {
    it('should return accounts', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/api/administrator/accounts')
      req.account = administrator.account
      req.session = administrator.session
      const accounts = await req.get()
      assert.strictEqual(accounts.length, global.pageSize)
      assert.strictEqual(accounts[0].accountid, user.account.accountid)
      assert.strictEqual(accounts[1].accountid, administrator.account.accountid)
    })

    it('should redact username, password, sessionKey', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/api/administrator/accounts')
      req.account = administrator.account
      req.session = administrator.session
      const accounts = await req.get()
      assert.strictEqual(2, accounts.length)
      assert.strictEqual(accounts[0].accountid, user.account.accountid)
      assert.strictEqual(undefined, accounts[0].username)
      assert.strictEqual(undefined, accounts[0].password)
      assert.strictEqual(accounts[1].accountid, administrator.account.accountid)
      assert.strictEqual(undefined, accounts[1].username)
      assert.strictEqual(undefined, accounts[1].password)
    })

    it('should enforce page size', async () => {
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

    it('should enforce specified offset', async () => {
      const offset = 1
      const administrator = await TestHelper.createOwner()
      const accounts = [ administrator.account ]
      for (let i = 0, len = offset + global.pageSize + 1; i < len; i++) {
        const user = await TestHelper.createUser()
        accounts.unshift(user.account)
      }
      const req = TestHelper.createRequest(`/api/administrator/accounts?offset=${offset}`)
      req.account = administrator.account
      req.session = administrator.session
      const accountsNow = await req.get()
      for (let i = 0, len = global.pageSize; i < len; i++) {
        assert.strictEqual(accountsNow[i].accountid, accounts[offset + i].accountid)
      }
    })

    it('should return all records', async () => {
      const administrator = await TestHelper.createOwner()
      const accounts = [administrator.account]
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        const user = await TestHelper.createUser()
        accounts.unshift(user.account)
      }
      const req = TestHelper.createRequest(`/api/administrator/accounts?all=true`)
      req.account = administrator.account
      req.session = administrator.session
      const accountsNow = await req.get()
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        assert.strictEqual(accountsNow[i].accountid, accounts[i].accountid)
      }
    })
  })
})
