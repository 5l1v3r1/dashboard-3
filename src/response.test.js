/* eslint-env mocha */
const assert = require('assert')
const HTML = require('./html.js')
const Response = require('./response.js')
const TestHelper = require('../test-helper.js')

describe('internal-api/response', () => {
  describe('Response#wrapTemplateWithSrcDoc', async () => {
    it('should add session unlocked message to header', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.wait(2200)
      await TestHelper.createSession(user)
      await TestHelper.lockSession(user)
      user.session = await TestHelper.unlockSession(user, true)
      const req = TestHelper.createRequest(`/account/change-username`)
      req.account = user.account
      req.session = user.session
      const doc = HTML.parse('<html><body></body></html>')
      const combined = await Response.wrapTemplateWithSrcDoc(req, null, doc)
      const templateDoc = HTML.parse(combined)
      const notificationsContainer = templateDoc.getElementById('notifications-container')
      assert.strictEqual(notificationsContainer.child.length, 1)
    })
  })

  describe('Response#throw404()', () => {
    it('should set 404 status', async () => {
      const res = {
        setHeader: () => {
        },
        end: () => {
          assert.strictEqual(res.statusCode, 404)
        }
      }
      return Response.throw404({}, res)
    })

    it('should contain 404 code', async () => {
      const res = {
        setHeader: () => {
        },
        end: (html) => {
          assert.strictEqual(html.indexOf('404') > -1, true)
        }
      }
      return Response.throw404({}, res)
    })

    it('should contain 404 error', async () => {
      const res = {
        setHeader: () => {
        },
        end: (html) => {
          assert.strictEqual(html.indexOf('Unknown URL or page') > -1, true)
        }
      }
      return Response.throw404({}, res)
    })
  })

  describe('Response#throw500()', () => {
    it('should set 500 status', async () => {
      const res = {
        setHeader: () => {
        },
        end: () => {
          assert.strictEqual(res.statusCode, 500)
        }
      }
      return Response.throw500({}, res)
    })

    it('should contain 500 code', async () => {
      const res = {
        setHeader: () => {
        },
        end: (html) => {
          assert.strictEqual(html.indexOf('500') > -1, true)
        }
      }
      return Response.throw500({}, res)
    })

    it('should contain error message', async () => {
      const res = {
        setHeader: () => {
        },
        end: (html) => {
          assert.strictEqual(html.indexOf('a huge error happened') > -1, true)
        }
      }
      return Response.throw500({}, res, 'a huge error happened')
    })
  })

  describe('Response#throw511()', () => {
    it('should set 511 status', async () => {
      const res = {
        setHeader: () => {
        },
        end: () => {
          assert.strictEqual(res.statusCode, 511)
        }
      }
      return Response.throw511({}, res)
    })

    it('should contain 511 code', async () => {
      const res = {
        setHeader: () => {
        },
        end: (html) => {
          assert.strictEqual(html.indexOf('511') > -1, true)
        }
      }
      return Response.throw511({}, res)
    })
  })
})
