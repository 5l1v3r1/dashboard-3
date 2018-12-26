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
        password: '',
        confirm: ''
      }
      const page = await req.post()
      const doc = TestHelper.extractDoc(page)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-password')
    })

    it('should reject short password', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/change-password')
      req.account = user.account
      req.session = user.session
      req.body = {
        password: '1',
        confirm: '1'
      }
      global.minimumPasswordLength = 100
      const page = await req.post()
      const doc = TestHelper.extractDoc(page)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-password-length')
    })

    it('should reject mismatched passwords', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/change-password')
      req.account = user.account
      req.session = user.session
      req.body = {
        password: '123',
        confirm: '456'
      }
      const page = await req.post()
      const doc = TestHelper.extractDoc(page)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-confirm')
    })

    it('should apply after authorization', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/change-password')
      req.account = user.account
      req.session = user.session
      req.body = {
        password: '123456890',
        confirm: '123456890'
      }
      const page = await req.post()
      const doc = TestHelper.extractDoc(page)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })
  })
})
