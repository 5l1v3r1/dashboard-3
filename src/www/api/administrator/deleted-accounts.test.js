/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/deleted-accounts', () => {
  describe('DeletedAccounts#GET', () => {
    it('should return deleted accounts', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      await TestHelper.setDeleted(user)
      const user2 = await TestHelper.createUser()
      await TestHelper.setDeleted(user2)
      const req = TestHelper.createRequest('/api/administrator/deleted-accounts')
      req.account = administrator.account
      req.session = administrator.session
      const accounts = await req.get()
      assert.strictEqual(accounts.length, global.pageSize)
      assert.strictEqual(accounts[0].accountid, user2.account.accountid)
      assert.strictEqual(accounts[1].accountid, user.account.accountid)
    })

    it('should redact username, password, session key', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      await TestHelper.setDeleted(user)
      const req = TestHelper.createRequest('/api/administrator/deleted-accounts')
      req.account = administrator.account
      req.session = administrator.session
      const accounts = await req.get()
      assert.strictEqual(accounts.length, 1)
      assert.strictEqual(undefined, accounts[0].username)
      assert.strictEqual(undefined, accounts[0].password)
      assert.strictEqual(undefined, accounts[0].sessionKey)
    })

    it('should enforce page size', async () => {
      global.pageSize = 3
      const administrator = await TestHelper.createOwner()
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        const user = await TestHelper.createUser()
        await TestHelper.setDeleted(user)
      }
      const req = TestHelper.createRequest('/api/administrator/deleted-accounts')
      req.account = administrator.account
      req.session = administrator.session
      const accountsNow = await req.get()
      assert.strictEqual(accountsNow.length, global.pageSize)
    })

    it('should enforce specified offset', async () => {
      const offset = 1
      const administrator = await TestHelper.createOwner()
      const accounts = [ ]
      for (let i = 0, len = offset + global.pageSize + 1; i < len; i++) {
        const user = await TestHelper.createUser()
        await TestHelper.setDeleted(user)
        accounts.unshift(user.account)
      }
      const req = TestHelper.createRequest(`/api/administrator/deleted-accounts?offset=${offset}`)
      req.account = administrator.account
      req.session = administrator.session
      const accountsNow = await req.get()
      for (let i = 0, len = global.pageSize; i < len; i++) {
        assert.strictEqual(accountsNow[i].accountid, accounts[offset + i].accountid)
      }
    })
  })
})
