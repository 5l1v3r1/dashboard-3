/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/administrator-accounts', () => {
  describe('AdministratorAccounts#GET', () => {
    it('should return administrators\' accounts', async () => {
      const owner = await TestHelper.createOwner()
      const administrator2 = await TestHelper.createAdministrator(owner)
      const req = TestHelper.createRequest('/api/administrator/administrator-accounts')
      req.account = owner.account
      req.session = owner.session
      const administrators = await req.get()
      assert.strictEqual(administrators.length, global.pageSize)
      assert.strictEqual(administrators[0].accountid, administrator2.account.accountid)
      assert.strictEqual(administrators[1].accountid, owner.account.accountid)
    })

    it('should redact username, password, session key', async () => {
      const owner = await TestHelper.createOwner()
      const req = TestHelper.createRequest('/api/administrator/administrator-accounts')
      req.account = owner.account
      req.session = owner.session
      const administrators = await req.get()
      assert.strictEqual(administrators[0].accountid, owner.account.accountid)
      assert.strictEqual(undefined, administrators[0].username)
      assert.strictEqual(undefined, administrators[0].password)
      assert.strictEqual(undefined, administrators[0].sessionKey)
    })

    it('should enforce page size', async () => {
      global.pageSize = 3
      const owner = await TestHelper.createOwner()
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        await TestHelper.createAdministrator(owner)
      }
      const req = TestHelper.createRequest('/api/administrator/administrator-accounts')
      req.account = owner.account
      req.session = owner.session
      const accountsNow = await req.get()
      assert.strictEqual(accountsNow.length, global.pageSize)
    })

    it('should enforce specified offset', async () => {
      const offset = 1
      const owner = await TestHelper.createOwner()
      const accounts = [ owner.account ]
      for (let i = 0, len = offset + global.pageSize + 1; i < len; i++) {
        const administrator = await TestHelper.createAdministrator(owner)
        accounts.unshift(administrator.account)
      }
      const req = TestHelper.createRequest(`/api/administrator/administrator-accounts?offset=${offset}`)
      req.account = owner.account
      req.session = owner.session
      const accountsNow = await req.get()
      for (let i = 0, len = global.pageSize; i < len; i++) {
        assert.strictEqual(accountsNow[i].accountid, accounts[offset + i].accountid)
      }
    })

    it('should return all records', async () => {
      const owner = await TestHelper.createOwner()
      const accounts = [owner.account]
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        const administrator = await TestHelper.createAdministrator(owner)
        accounts.unshift(administrator.account)
      }
      const req = TestHelper.createRequest(`/api/administrator/administrator-accounts?all=true`)
      req.account = owner.account
      req.session = owner.session
      const accountsNow = await req.get()
      for (let i = 0, len = global.pageSize; i < len; i++) {
        assert.strictEqual(accountsNow[i].accountid, accounts[i].accountid)
      }
    })
  })
})
