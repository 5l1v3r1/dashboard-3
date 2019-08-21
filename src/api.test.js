const API = require('./api.js')
const assert = require('assert')
const TestHelper = require('../test-helper.js')

/* eslint-env mocha */
describe('internal-api/api', () => {
  describe('API#wrapAPIRequest', () => {
    it('should allow guest access', async () => {
      const handler = API.wrapAPIRequest({
        auth: false,
        get: async () => {
          return true
        }
      })
      const req = TestHelper.createRequest('/api/user/delete-account')
      const result = await handler.get(req)
      assert.strictEqual(result, true)
    })

    it('should return object', async () => {
      const handler = API.wrapAPIRequest({
        get: async (req) => {
          return req.account
        }
      })
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/account?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      const account = await handler.get(req)
      assert.strictEqual(account.accountid, user.account.accountid)
    })

    it('should end response with JSON', async () => {
      const handler = API.wrapAPIRequest({
        get: async () => {
          return { this: 'thing' }
        }
      })
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/account?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      const res = {
        setHeader: () => {
        },
        end: async (str) => {
          const object = JSON.parse(str)
          assert.strictEqual(object.this, 'thing')
        }
      }
      return handler.get(req, res)
    })
  })
})
