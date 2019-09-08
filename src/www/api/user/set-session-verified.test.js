/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

/* eslint-env mocha */
describe(`/api/user/set-session-verified`, () => {
  describe('SetSessionVerified#PATCH', () => {
    it('should reject invalid sessionid', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/api/user/set-session-verified?sessionid=invalid')
      req.account = user.account
      req.session = user.session
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-session')
    })

    it('should reject other account credentials', async () => {
      const user = await TestHelper.createUser()
      const user2 = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/set-session-verified?sessionid=${user.session.sessionid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        username: user2.account.username,
        password: user2.account.password
      }
      let errorMessage
      try {
        await req.patch()
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-username')
    })

    it('should mark the session as verified', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/set-session-verified?sessionid=${user.session.sessionid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        username: user.account.username,
        password: user.account.password
      }
      const sessionNow = await req.patch()
      assert.notStrictEqual(sessionNow.lastVerified, undefined)
      assert.notStrictEqual(sessionNow.lastVerified, null)
    })
  })
})
