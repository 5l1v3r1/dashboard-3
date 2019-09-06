/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe('/account/change-password', () => {
  describe('ChangePassword#GET', () => {
    it('should present the form', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/change-password', 'GET')
      req.account = user.account
      req.session = user.session
      const page = await req.get()
      const doc = TestHelper.extractDoc(page)
      assert.strictEqual(doc.getElementById('submit-form').tag, 'form')
      assert.strictEqual(doc.getElementById('submit-button').tag, 'button')
    })
  })

  describe('ChangePassword#POST', () => {
    it('should reject missing password', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/change-password')
      req.account = user.account
      req.session = user.session
      req.body = {
        'new-password': ' ',
        'confirm-password': ' ',
        password: user.account.password
      }
      const page = await req.post()
      const doc = TestHelper.extractDoc(page)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-new-password')
    })

    it('should reject short password', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/change-password')
      req.account = user.account
      req.session = user.session
      req.body = {
        'new-password': '1',
        'confirm-password': '1',
        password: user.account.password
      }
      global.minimumPasswordLength = 100
      const page = await req.post()
      const doc = TestHelper.extractDoc(page)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-new-password-length')
    })

    it('should reject mismatched passwords', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/change-password')
      req.account = user.account
      req.session = user.session
      req.body = {
        'new-password': '123456789',
        'confirm-password': '4567890123',
        password: user.account.password
      }
      const page = await req.post()
      const doc = TestHelper.extractDoc(page)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-confirm-password')
    })

    it('should reject invalid current password', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/change-password')
      req.account = user.account
      req.session = user.session
      req.body = {
        'new-password': '123456789',
        'confirm-password': '123456789',
        password: 'invalid'
      }
      const page = await req.post()
      const doc = TestHelper.extractDoc(page)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-password')
    })

    it('should apply new password', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/change-password')
      req.account = user.account
      req.session = user.session
      req.body = {
        'new-password': '123456789',
        'confirm-password': '123456789',
        password: user.account.password
      }
      const page = await req.post()
      const doc = TestHelper.extractDoc(page)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })
  })
})
