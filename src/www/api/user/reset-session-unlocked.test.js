/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

/* eslint-env mocha */
describe(`/api/user/reset-session-unlocked`, () => {
  describe('ResetSessionUnlocked#PATCH', () => {
    it('should reject not-unlocked session', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/reset-session-unlocked?sessionid=${user.session.sessionid}`)
      req.account = user.account
      req.session = user.session
      const session = await req.patch()
      assert.strictEqual(session.message, 'invalid-session')
    })

    it('should remove unlocked status from the session', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.lockSession(user)
      await TestHelper.unlockSession(user, true)
      const req = TestHelper.createRequest(`/api/user/reset-session-unlocked?sessionid=${user.session.sessionid}`)
      req.account = user.account
      req.session = user.session
      const session = await req.patch()
      assert.strictEqual(session.unlocked, undefined)
    })
  })
})
