/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/set-owner-account', () => {
  describe('SetOwnerAccount#PATCH', () => {
    it('should reject invalid accountid', async () => {
      const owner = await TestHelper.createOwner()
      const req = TestHelper.createRequest(`/api/administrator/set-owner-account?accountid=invalid`)
      req.account = owner.account
      req.session = owner.session
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-accountid')
    })

    it('should reject non-owner administrators', async () => {
      const owner = await TestHelper.createOwner()
      const administrator = await TestHelper.createAdministrator(owner)
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/administrator/set-owner-account?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-account')
    })

    it('should reject transferring to self accountid', async () => {
      const owner = await TestHelper.createOwner()
      const req = TestHelper.createRequest(`/api/administrator/set-owner-account?accountid=${owner.account.accountid}`)
      req.account = owner.account
      req.session = owner.session
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-account')
    })
    
    it('should apply authorized new ownership', async () => {
      const owner = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/administrator/set-owner-account?accountid=${user.account.accountid}`)
      req.account = owner.account
      req.session = owner.session
      const accountNow = await req.patch()
      assert.notStrictEqual(accountNow.owner, undefined)
      assert.notStrictEqual(accountNow.owner, null)
    })

    it('should revoke own ownership', async () => {
      const owner = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/administrator/set-owner-account?accountid=${user.account.accountid}`)
      req.account = owner.account
      req.session = owner.session
      const userAccountNow = await req.patch()
      const req2 = TestHelper.createRequest(`/api/administrator/account?accountid=${owner.account.accountid}`)
      req2.account = req.account
      req2.session = req.session
      const ownerAccountNow = await req2.get()
      assert.strictEqual(ownerAccountNow.owner, undefined)
      assert.notStrictEqual(userAccountNow.owner, undefined)
      assert.notStrictEqual(userAccountNow.owner, null)
    })
  })
})
