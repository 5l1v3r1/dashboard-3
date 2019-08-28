/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe('/account/change-username', () => {
  describe('ChangeUsername#GET', () => {
    it('should present the form', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/change-username')
      req.account = user.account
      req.session = user.session
      const page = await req.get()
      const doc = TestHelper.extractDoc(page)
      assert.strictEqual(doc.getElementById('submit-form').tag, 'form')
      assert.strictEqual(doc.getElementById('submit-button').tag, 'button')
    })
  })

  describe('ChangeUsername#POST', () => {
    it('should reject missing username', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/change-username')
      req.account = user.account
      req.session = user.session
      req.body = {
        'new-username': null,
        password: user.account.password
      }
      const page = await req.post()
      const doc = TestHelper.extractDoc(page)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-new-username')
    })

    it('should reject short username', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/change-username')
      req.account = user.account
      req.session = user.session
      req.body = {
        'new-username': '1',
        password: user.account.password
      }
      global.minimumUsernameLength = 100
      const page = await req.post()
      const doc = TestHelper.extractDoc(page)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-new-username-length')
    })

    it('should reject invalid password', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/change-username')
      req.account = user.account
      req.session = user.session
      req.body = {
        'new-username': 'new-username-' + new Date().getTime() + '-' + Math.ceil(Math.random() * 1000),
        password: 'invalid'
      }
      const page = await req.post()
      const doc = TestHelper.extractDoc(page)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-password')
    })

    it('should apply new username', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/change-username')
      req.account = user.account
      req.session = user.session
      req.body = {
        'new-username': 'new-username-' + new Date().getTime() + '-' + Math.ceil(Math.random() * 1000),
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
