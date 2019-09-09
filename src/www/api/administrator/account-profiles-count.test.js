/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/account-profiles-count', () => {
  describe('exceptions', () => {
    describe('invalid-accountid', async () => {
      it('missing querystring accountid value', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest(`/api/administrator/account-profiles-count`)
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
        const req = TestHelper.createRequest(`/api/administrator/account-profiles-count?accountid=invalid`)
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
    it('querystring accountid', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      global.apiDependencies = []
      const req = TestHelper.createRequest(`/api/administrator/account-profiles-count?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      const result = await req.get()
      assert.strictEqual(result, 1)
    })
  })

  describe('returns', () => {
    it('integer', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/administrator/account-profiles-count?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      const result = await req.get()
      assert.strictEqual(result, 1)
    })
  })
})
