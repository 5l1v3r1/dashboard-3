/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

/* eslint-env mocha */
describe(`/api/user/reset-session-locked`, () => {
  describe('ResetSessionLocked#PATCH', () => {
    it('should reject not-locked session', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/reset-session-locked?sessionid=${user.session.sessionid}`)
      req.account = user.account
      req.session = user.session
      const session = await req.patch()
      assert.strictEqual(session.message, 'invalid-session')
    })

    it('should reject unlocked session', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.wait(2200)
      await TestHelper.createSession(user)
      await TestHelper.lockSession(user)
      await TestHelper.unlockSession(user)
      const req = TestHelper.createRequest(`/api/user/reset-session-locked?sessionid=${user.session.sessionid}`)
      req.account = user.account
      req.session = user.session
      const session = await req.patch()
      assert.strictEqual(session.message, 'invalid-session')
    })

    it('should remove lock from the session', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.wait(2200)
      await TestHelper.createSession(user)
      await TestHelper.lockSession(user)
      const req = TestHelper.createRequest(`/api/user/reset-session-locked?sessionid=${user.session.sessionid}`)
      req.account = user.account
      req.session = user.session
      const session = await req.patch()
      assert.strictEqual(session.unlocked, undefined)
    })
  })
})
