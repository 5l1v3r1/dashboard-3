/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe('/account/delete-account-complete', () => {
  describe('DeleteAccountComplete#GET', () => {
    it('should present 3 days remaining message', async () => {
      global.deleteDelay = 3
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/delete-account-complete')
      req.account = user.account
      req.account.deleted = req.account.created
      req.session = user.session
      const page = await req.get()
      const doc = TestHelper.extractDoc(page)
      const duration = doc.getElementById('scheduled-delete')
      assert.strictEqual(duration.tag, 'div')
    })

    it('should present 7 days remaining message', async () => {
      global.deleteDelay = 7
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/delete-account-complete')
      req.account = user.account
      req.account.deleted = req.account.created
      req.session = user.session
      const page = await req.get()
      const doc = TestHelper.extractDoc(page)
      const duration = doc.getElementById('scheduled-delete')
      assert.strictEqual(duration.tag, 'div')
    })

    it('should present instant delete message', async () => {
      global.deleteDelay = 0
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/delete-account-complete')
      req.account = user.account
      req.account.deleted = req.account.created
      req.session = user.session
      const page = await req.get()
      const doc = TestHelper.extractDoc(page)
      const instant = doc.getElementById('instant-delete')
      assert.strictEqual(instant.tag, 'div')
    })
  })
})
