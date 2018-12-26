/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe('/account/delete-account', () => {
  describe('DeleteAccount#GET', () => {
    it('should present the form', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/delete-account')
      req.account = user.account
      req.session = user.session
      const page = await req.get()
      const doc = TestHelper.extractDoc(page)
      assert.strictEqual(doc.getElementById('submit-form').tag, 'form')
      assert.strictEqual(doc.getElementById('submit-button').tag, 'button')
    })
  })

  describe('DeleteAccount#POST', () => {
    it('should apply after authorization', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/delete-account')
      req.account = user.account
      req.session = user.session
      await req.post()
      const req2 = TestHelper.createRequest(`/api/administrator/account?accountid=${user.account.accountid}`)
      req2.account = administrator.account
      req2.session = administrator.session
      const account = await req2.get()
      assert.notStrictEqual(account.deleted, undefined)
      assert.notStrictEqual(account.deleted, null)
    })
  })
})
