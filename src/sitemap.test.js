const assert = require('assert')
const HTML = require('./html.js')
const Server = require('./server.js')
const Sitemap = require('./sitemap.js')
const Timestamp = require('./timestamp.js')
const TestHelper = require('../test-helper.js')

/* eslint-env mocha */
describe('internal-api/sitemap', () => {
  describe('Sitemap#authenticateRequest', () => {
    it('should substitute language HTML file', async () => {
      Timestamp.now -= 10000
      const user = await TestHelper.createUser()
      user.session = await TestHelper.createSession(user, 'days')
      Timestamp.now += 10000
      const req = TestHelper.createRequest('/account/change-password')
      req.account = user.account
      req.session = user.session
      req.method = 'GET'
      req.headers = {}
      req.body = {
        username: user.account.username,
        password: user.account.password
      }
      const res = {
        setHeader: () => {
        },
        end: (page) => {
          const doc = HTML.parse(page)
          const redirectURL = TestHelper.extractRedirectURL(doc)
          assert.strictEqual(redirectURL, '/account/verify?returnURL=/account/change-password')
        }
      }
      return Server.receiveRequest(req, res)
    })
  })

  describe('Sitemap#wrapAPIRequest', () => {
    it('should allow guest access', async () => {
      const handler = Sitemap.wrapAPIRequest({
        auth: false,
        get: async () => {
          return true
        }
      }, '/api/user/delete-account')
      const req = TestHelper.createRequest('/api/user/delete-account')
      const result = await handler.get(req)
      assert.strictEqual(result, true)
    })

    it('should return object', async () => {
      const handler = Sitemap.wrapAPIRequest({
        get: async (req) => {
          return req.account
        }
      }, '/api/user/account')
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/account?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      const account = await handler.get(req)
      assert.strictEqual(account.accountid, user.account.accountid)
    })

    it('should end response with JSON', async () => {
      const handler = Sitemap.wrapAPIRequest({
        get: async () => {
          return { this: 'thing' }
        }
      }, '/api/user/account')
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
