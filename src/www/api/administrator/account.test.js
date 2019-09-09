/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/administrator/account`, () => {
  describe('exceptions', () => {
    describe('invalid-accountid', async () => {
      it('unspecified querystring accountid', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest(`/api/administrator/account`)
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

      it('invalid querystring accountid value', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest(`/api/administrator/account?accountid=invalid`)
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
    it('requires querystring accountid', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/administrator/account?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      const account = await req.get()
      assert.strictEqual(account.accountid, user.account.accountid)
    })
  })

  describe('returns', () => {
    it('object', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/administrator/account?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      const account = await req.get()
      assert.strictEqual(account.accountid, user.account.accountid)
    })

    it('redacted username, password, session key', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/administrator/account?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      const account = await req.get()
      assert.strictEqual(account.accountid, user.account.accountid)
      assert.strictEqual(undefined, account.usernameHash)
      assert.strictEqual(undefined, account.passwordHash)
      assert.strictEqual(undefined, account.sessionKey)
    })
  })
})
