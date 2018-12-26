/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../test-helper.js')

describe(`content/session-unlocked-header`, () => {
  describe('SessionUnlockedHeader#AFTER', () => {
    it('should do nothing for not-unlocked accounts', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/change-username`)
      req.account = user.account
      req.session = user.session
      const page = await req.get()
      const notificationsContainer = page.getElementById('notifications-container')
      assert.strictEqual(undefined, notificationsContainer.child)
    })

    it('should add lock message to header', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.lockSession(user)
      await TestHelper.unlockSession(user, true)
      const req = TestHelper.createRequest(`/account/change-username`)
      req.account = user.account
      req.session = user.session
      const page = await req.get()
      const notificationsContainer = page.getElementById('notifications-container')
      assert.strictEqual(notificationsContainer.child.length, 1)
    })
  })
})
