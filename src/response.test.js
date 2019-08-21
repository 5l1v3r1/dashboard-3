/* eslint-env mocha */
const assert = require('assert')
const Response = require('./response.js')

describe('internal-api/response', () => {
  describe('Response#throw404', () => {
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

  describe('Response#throw500', () => {
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

  describe('Response#throw511', () => {
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
