/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe('/account/create-reset-code', () => {
  describe('CreateResetCode#GET', () => {
    it('should present the form', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/create-reset-code')
      req.account = user.account
      req.session = user.session
      const page = await req.get()
      const doc = TestHelper.extractDoc(page)
      assert.strictEqual(doc.getElementById('submit-form').tag, 'form')
      assert.strictEqual(doc.getElementById('submit-button').tag, 'button')
    })
  })

  describe('CreateResetCode#POST', () => {
    it('should reject missing code', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/create-reset-code')
      req.account = user.account
      req.session = user.session
      req.body = {
        code: ''
      }
      const page = await req.post()
      const doc = TestHelper.extractDoc(page)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-reset-code')
    })

    it('should reject short code', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/create-reset-code')
      req.account = user.account
      req.session = user.session
      req.body = {
        code: '1'
      }
      global.minimumResetCodeLength = 100
      const page = await req.post()
      const doc = TestHelper.extractDoc(page)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-reset-code-length')
    })

    it('should create after authorization', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/create-reset-code')
      req.account = user.account
      req.session = user.session
      req.body = {
        code: '123456890'
      }
      global.minimumResetCodeLength = 1
      const page = await req.post()
      const doc = TestHelper.extractDoc(page)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })
  })
})
