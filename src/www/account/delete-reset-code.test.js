/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe('/account/delete-reset-code', () => {
  describe('DeleteResetCode#BEFORE', () => {
    it('should reject invalid code', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/delete-reset-code?codeid=invalid')
      req.account = user.account
      req.session = user.session
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-codeid')
    })

    it('should reject other account\'s code', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createResetCode(user)
      const user2 = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/delete-reset-code?codeid=${user.resetCode.codeid}`)
      req.account = user2.account
      req.session = user2.session
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-account')
    })
  })

  describe('DeleteResetCode#GET', () => {
    it('should present the form', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createResetCode(user)
      const req = TestHelper.createRequest(`/account/delete-reset-code?codeid=${user.resetCode.codeid}`)
      req.account = user.account
      req.session = user.session
      const page = await req.get()
      const doc = TestHelper.extractDoc(page)
      assert.strictEqual(doc.getElementById('submit-form').tag, 'form')
      assert.strictEqual(doc.getElementById('submit-button').tag, 'button')
    })

    it('should present the reset code table', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createResetCode(user)
      const req = TestHelper.createRequest(`/account/delete-reset-code?codeid=${user.resetCode.codeid}`)
      req.account = user.account
      req.session = user.session
      const page = await req.get()
      const doc = TestHelper.extractDoc(page)
      const table = doc.getElementById('reset-codes-table')
      const row = table.getElementById(user.resetCode.codeid)
      assert.strictEqual(row.tag, 'tr')
    })
  })

  describe('DeleteResetCode#POST', () => {
    it('should delete', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createResetCode(user)
      const req = TestHelper.createRequest(`/account/delete-reset-code?codeid=${user.resetCode.codeid}`)
      req.account = user.account
      req.session = user.session
      await req.post()
      const req2 = TestHelper.createRequest(`/account/reset-code?codeid=${user.resetCode.codeid}`)
      req2.account = user.account
      req2.session = user.session
      let page = await req2.get()
      const doc = TestHelper.extractDoc(page)
      const errorTitle = doc.getElementById('error-title')
      assert.strictEqual(errorTitle.attr.error, 'invalid-codeid')
    })
  })
})
