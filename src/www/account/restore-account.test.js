/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe('/account/restore-account', () => {
  describe('RestoreAccount#GET', () => {
    it('should present the form', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/restore-account')
      req.account = user.account
      req.session = user.session
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      assert.strictEqual(doc.getElementById('submit-form').tag, 'form')
      assert.strictEqual(doc.getElementById('submit-button').tag, 'button')
    })
  })

  describe('RestoreAccount#POST', () => {
    it('should reject missing username', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/restore-account')
      req.account = user.account
      req.session = user.session
      req.body = {
        username: '',
        password: user.account.password
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-username')
    })

    it('should enforce username length', async () => {
      const req = TestHelper.createRequest('/account/restore-account')
      req.body = {
        username: '1',
        password: '123456789123'
      }
      global.minimumUsernameLength = 100
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-username-length')
    })

    it('should reject missing password', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/restore-account')
      req.account = user.account
      req.session = user.session
      req.body = {
        username: user.account.username,
        password: ''
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-password')
    })

    it('should enforce password length', async () => {
      const req = TestHelper.createRequest('/account/restore-account')
      req.body = {
        username: '1234567890123',
        password: '1'
      }
      global.minimumPasswordLength = 100
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-password-length')
    })

    it('should reject invalid password', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.setDeleted(user)
      const req = TestHelper.createRequest('/account/restore-account')
      req.body = {
        username: user.account.username,
        password: 'invalid-password'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-password')
    })

    it('should reject if after deletion date', async () => {
      global.deleteDelay = -1
      const user = await TestHelper.createUser()
      await TestHelper.setDeleted(user)
      const req = TestHelper.createRequest('/account/restore-account')
      req.body = {
        username: user.account.username,
        password: user.account.password
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-account')
    })

    it('should unset account deleted (screenshots)', async () => {
      global.deleteDelay = 1
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      await TestHelper.setDeleted(user)
      const req = TestHelper.createRequest('/account/restore-account')
      req.body = {
        username: user.account.username,
        password: user.account.password
      }
      req.filename = __filename
      req.screenshots = [
        { click: '/account/signin' },
        { click: '/account/restore-account' },
        { fill: '#submit-form' }
      ]
      await req.post()
      const req2 = TestHelper.createRequest(`/api/administrator/account?accountid=${user.account.accountid}`)
      req2.account = administrator.account
      req2.session = administrator.session
      const account = await req2.get()
      assert.strictEqual(account.deleted, undefined)
    })
  })
})
