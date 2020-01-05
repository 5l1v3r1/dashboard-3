/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe('/account', () => {
  describe('Index#GET', () => {
    it('should return page (screenshots)', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account')
      req.account = user.account
      req.session = user.session
      req.filename = __filename
      req.screenshots = [
        { hover: '#account-menu-container' },
        { click: '/account' }
      ]
      const page = await req.get()
      const doc = TestHelper.extractDoc(page)
      assert.notStrictEqual(doc, undefined)
      assert.notStrictEqual(doc, null)
    })
  })
})
