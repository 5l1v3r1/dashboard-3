const API = require('./api.js')
const assert = require('assert')
const TestHelper = require('../test-helper.js')

/* eslint-env mocha */
describe('internal-api/api', () => {
  describe('API#createFromSitemap', () => {
    it ('should remap urls to object', () => {
      global.sitemap = {
        '/api/this/is/an/example': {
          api: {
            get: () => {
              return 1
            }
          }
        },
        '/api/something/else': {
          api: {
            post: () => {
              return 2
            }
          }
        }
      }
      const api = API.createFromSitemap()
      assert.notStrictEqual(api.this.is.an.Example, undefined)
      assert.notStrictEqual(api.this.is.an.Example, null)
      const getResult = api.this.is.an.Example.get()
      assert.strictEqual(getResult, 1)
      const postResult = api.something.Else.post()
      assert.strictEqual(postResult, 2)
    })

    it ('should capitalize the last segment', () => {
      global.sitemap = {
        '/api/this/is/an/example': {
          api: {
            get: () => {
              return 1
            }
          }
        }
      }
      const api = API.createFromSitemap()
      assert.notStrictEqual(api.this.is.an.Example, undefined)
      assert.notStrictEqual(api.this.is.an.Example, null)
      assert.strictEqual(api.this.is.an.example, undefined)
    })

    it ('should capitalize hyphenated last segment', () => {
      global.sitemap = {
        '/api/this/is/an/example-two': {
          api: {
            get: () => {
              return 1
            }
          }
        }
      }
      const api = API.createFromSitemap()
      assert.notStrictEqual(api.this.is.an.ExampleTwo, undefined)
      assert.notStrictEqual(api.this.is.an.ExampleTwo, null)
    })
  })
})
