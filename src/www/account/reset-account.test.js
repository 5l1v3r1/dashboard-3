/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe('/account/reset-account', () => {
  describe('ResetAccount#GET', () => {
    it('should present the form', async () => {
      const req = TestHelper.createRequest('/account/reset-account')
      const page = await req.get()
      assert.strictEqual(page.getElementById('submit-form').tag, 'form')
      assert.strictEqual(page.getElementById('submit-button').tag, 'button')
    })
  })

  describe('ResetAccount#POST', () => {
    it('should reject missing username', async () => {
      const req = TestHelper.createRequest('/account/reset-account')
      req.body = {
        username: null,
        password: 'new-password',
        confirm: 'new-password',
        code: 'reset-code'
      }
      const page = await req.post()
      const message = page.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-username')
    })

    it('should enforce username length', async () => {
      const req = TestHelper.createRequest('/account/reset-account')
      req.body = {
        username: '1',
        password: 'new-password',
        confirm: 'new-password',
        code: 'reset-code'
      }
      global.minimumUsernameLength = 100
      const page = await req.post()
      const message = page.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-username-length')
    })

    it('should reject missing reset code', async () => {
      const req = TestHelper.createRequest('/account/reset-account')
      req.body = {
        username: 'username',
        password: 'new-password',
        confirm: 'new-password',
        code: null
      }
      const page = await req.post()
      const message = page.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-reset-code')
    })

    it('should enforce reset code length', async () => {
      const req = TestHelper.createRequest('/account/reset-account')
      req.body = {
        username: 'username',
        password: 'new-password',
        confirm: 'new-password',
        code: '1'
      }
      global.minimumResetCodeLength = 100
      const page = await req.post()
      const message = page.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-reset-code-length')
    })

    it('should reject missing password', async () => {
      const req = TestHelper.createRequest('/account/reset-account')
      req.body = {
        username: 'username',
        password: '',
        confirm: 'new-password',
        code: 'reset-code'
      }
      const page = await req.post()
      const message = page.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-password')
    })

    it('should enforce password length', async () => {
      const req = TestHelper.createRequest('/account/reset-account')
      req.body = {
        username: 'username',
        password: '1',
        confirm: '1',
        code: 'reset-code'
      }
      global.minimumPasswordLength = 100
      const page = await req.post()
      const message = page.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-password-length')
    })

    it('should require confirm', async () => {
      const req = TestHelper.createRequest('/account/reset-account')
      req.body = {
        username: 'username',
        password: 'new-password',
        confirm: '',
        code: 'reset-code'
      }
      const page = await req.post()
      const message = page.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-confirm')
    })

    it('should not reset deleted account', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createResetCode(user)
      global.deleteDelay = -1
      await TestHelper.setDeleted(user)
      const req = TestHelper.createRequest('/account/reset-account')
      req.body = {
        username: user.account.username,
        password: 'my-new-password',
        confirm: 'my-new-password',
        code: user.resetCode.code
      }
      const page = await req.post()
      const message = page.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-account')
    })

    it('should reset session key', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      await TestHelper.createResetCode(user)
      const req = TestHelper.createRequest('/account/reset-account')
      req.body = {
        username: user.account.username,
        password: 'my-new-password',
        confirm: 'my-new-password',
        code: user.resetCode.code
      }
      await req.post()
      const req2 = TestHelper.createRequest(`/api/administrator/account?accountid=${user.account.accountid}`)
      req2.account = administrator.account
      req2.session = administrator.session
      const account = await req2.get(req2)
      assert.notStrictEqual(account.resetCodeLastUsed, undefined)
      assert.notStrictEqual(account.resetCodeLastUsed, null)
      assert.notStrictEqual(account.sessionKeyLastReset, undefined)
      assert.notStrictEqual(account.sessionKeyLastReset, null)
    })

    it('should reset code last used', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      await TestHelper.createResetCode(user)
      const req = TestHelper.createRequest('/account/reset-account')
      req.body = {
        username: user.account.username,
        password: 'my-new-password',
        confirm: 'my-new-password',
        code: user.resetCode.code
      }
      await req.post()
      const req2 = TestHelper.createRequest(`/api/administrator/account?accountid=${user.account.accountid}`)
      req2.accout = administrator.account
      req2.session = administrator.session
      const account = await req2.get(req2)
      assert.notStrictEqual(account.resetCodeLastUsed, undefined)
      assert.notStrictEqual(account.resetCodeLastUsed, null)
    })

    it('should sign in', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createResetCode(user)
      const req = TestHelper.createRequest('/account/reset-account')
      req.body = {
        username: user.account.username,
        password: 'my-new-password',
        confirm: 'my-new-password',
        code: user.resetCode.code
      }
      const res = {
        setHeader: () => {
        },
        end: () => {
          assert.notStrictEqual(res.headers['set-cookie'], undefined)
          assert.notStrictEqual(res.headers['set-cookie'], null)
        }
      }
      return req.post()
    })
  })
})
