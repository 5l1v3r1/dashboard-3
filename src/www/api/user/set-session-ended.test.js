/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

/* eslint-env mocha */
describe(`/api/user/set-session-ended`, () => {
  describe('SetSessionEnded#PATCH', () => {
    it('should reject invalid sessionid', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/api/user/set-session-ended?sessionid=invalid')
      req.account = user.account
      req.session = user.session
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-sessionid')
    })

    it('should reject ended session', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/set-session-ended?sessionid=${user.session.sessionid}`)
      req.account = user.account
      req.session = user.session
      await req.patch()
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-session')
    })

    it('should end the session', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/set-session-ended?sessionid=${user.session.sessionid}`)
      req.account = user.account
      req.session = user.session
      const sessionNow = await req.patch()
      assert.notStrictEqual(sessionNow.ended, undefined)
      assert.notStrictEqual(sessionNow.ended, null)
    })
  })
})
