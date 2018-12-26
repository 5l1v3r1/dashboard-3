/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe('/account/lock-session', () => {
  describe('LockSession#GET', () => {
    it('should reject invalid session', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/lock-session`)
      req.account = user.account
      req.session = user.session
      const page = await req.get()
      const doc = await TestHelper.extractDoc(page)
      const errorHeading = doc.getElementById('error-title')
      assert.equal(errorHeading.attr.error, 'invalid-session')
    })

    it('should remove unlocked status', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      await TestHelper.lockSession(user)
      await TestHelper.unlockSession(user)
      const req = TestHelper.createRequest(`/account/lock-session`)
      req.account = user.account
      req.session = user.session
      await req.get()
      const req2 = TestHelper.createRequest(`/api/administrator/session?sessionid=${user.session.sessionid}`)
      req2.account = administrator.account
      req2.session = administrator.session
      const session = await req2.get(req2)
      assert.strictEqual(session.unlocked, undefined)
    })
  })
})
