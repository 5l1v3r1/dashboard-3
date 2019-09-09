/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/delete-account', () => {
  describe('exceptions', () => {
    describe('invalid-accountid', async () => {
      it('missing querystring accountid value', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest(`/api/administrator/delete-account`)
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.delete()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-accountid')
      })

      it('invalid querystring accountid value', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest(`/api/administrator/delete-account?accountid=invalid`)
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.delete()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-accountid')
      })
    })
  })

  describe('receieves', () => {
    it('querystring accountid', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      await TestHelper.setDeleted(user)
      const req = TestHelper.createRequest(`/api/administrator/delete-account?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      await req.delete()
      const req2 = TestHelper.createRequest(`/api/administrator/account?accountid=${user.account.accountid}`)
      req2.account = administrator.account
      req2.session = administrator.session
      let errorMessage
      try {
        await req2.get(req2)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-accountid')
    })
  })

  describe('returns', () => {
    it('boolean', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      await TestHelper.setDeleted(user)
      const req = TestHelper.createRequest(`/api/administrator/delete-account?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      const deleted = await req.delete()
      assert.strictEqual(deleted, true)
    })
  })
})
