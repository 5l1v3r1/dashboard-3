/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/session', () => {
  describe('Session#GET', () => {
    it('should return user session', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/administrator/session?sessionid=${user.session.sessionid}`)
      req.account = administrator.account
      req.session = administrator.session
      const session = await req.get()
      assert.strictEqual(session.sessionid, user.session.sessionid)
      assert.strictEqual(session.accountid, user.session.accountid)
    })

    it('should redact token', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/administrator/session?sessionid=${user.session.sessionid}`)
      req.account = administrator.account
      req.session = administrator.session
      const session = await req.get()
      assert.strictEqual(session.sessionid, user.session.sessionid)
      assert.strictEqual(session.accountid, user.session.accountid)
      assert.strictEqual(session.token, undefined)
    })
  })
})
