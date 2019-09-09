/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/administrator/create-reset-code`, () => {
  describe('exceptions', () => {
    describe('invalid-accountid', async () => {
      it('unspecified querystring accountid', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest(`/api/administrator/create-reset-code`)
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          code: '1'
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-accountid')
      })

      it('invalid querystring accountid value', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest(`/api/administrator/create-reset-code?accountid=invalid`)
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          code: '1'
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-accountid')
      })
    })

    describe('invalid-reset-code', () => {
      it('unspecified posted code', async () => {
        const administrator = await TestHelper.createOwner()
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/administrator/create-reset-code?accountid=${user.account.accountid}`)
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          code: ''
        }
        global.minimumResetCodeLength = 100
        let errorMessage
        try {
          await req.route.api.post(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-reset-code')
      })
    })

    describe('invalid-reset-code-length', () => {
      it('invalid posted code length', async () => {
        const administrator = await TestHelper.createOwner()
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/administrator/create-reset-code?accountid=${user.account.accountid}`)
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          code: '1'
        }
        global.minimumResetCodeLength = 100
        let errorMessage
        try {
          await req.route.api.post(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-reset-code-length')
      })
    })
  })

  describe('receives', () => {
    it('querystring accountid', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/administrator/create-reset-code?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        code: '12345678'
      }
      const resetCode = await req.post()
      assert.strictEqual(resetCode.object, 'resetCode')
    })
  })

  describe('returns', () => {
    it('object', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/administrator/create-reset-code?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        code: '12345678'
      }
      const resetCode = await req.post()
      assert.strictEqual(resetCode.object, 'resetCode')
    })
  })

  describe('configuration', () => {
    it('environment MINIMUM_RESET_CODE_LENGTH', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/administrator/create-reset-code?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        code: '1'
      }
      global.minimumResetCodeLength = 100
      let errorMessage
      try {
        await req.route.api.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-reset-code-length')
    })

    it('environment MaxIMUM_RESET_CODE_LENGTH', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/administrator/create-reset-code?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        code: '10000000'
      }
      global.maximumResetCodeLength = 3
      let errorMessage
      try {
        await req.route.api.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-reset-code-length')
    })
  })
})
