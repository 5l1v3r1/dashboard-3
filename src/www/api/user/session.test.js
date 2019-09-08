/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/user/session`, () => {
  describe('Session#GET', () => {
    it('should reject invalid sessionid', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/session?sessionid=invalid`)
      req.account = user.account
      req.session = user.session
      let errorMessage
      try {
        await req.get(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-sessionid')
    })

    it('should require own sessionid', async () => {
      const user = await TestHelper.createUser()
      const user2 = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/session?sessionid=${user2.session.sessionid}`)
      req.account = user.account
      req.session = user.session
      let errorMessage
      try {
        await req.get(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-account')
    })

    it('should return session data', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/session?sessionid=${user.session.sessionid}`)
      req.account = user.account
      req.session = user.session
      const session = await req.get()
      assert.strictEqual(session.accountid, user.account.accountid)
    })

    it('should redact token', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/session?sessionid=${user.session.sessionid}`)
      req.account = user.account
      req.session = user.session
      const session = await req.get()
      assert.strictEqual(session.accountid, user.account.accountid)
      assert.strictEqual(session.token, undefined)
    })
  })
})
