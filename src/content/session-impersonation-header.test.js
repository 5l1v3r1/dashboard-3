/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../test-helper.js')

describe(`content/session-impersonation-header`, () => {
  describe('SessionImpersionationHeader#AFTER', () => {
    it('should do nothing for non-administrator', async () => {
      await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/change-username`)
      req.account = user.account
      req.session = user.session
      const page = await req.get()
      const notificationsContainer = page.getElementById('notifications-container')
      assert.strictEqual(undefined, notificationsContainer.child)
    })

    it('should do nothing when not impersonating', async () => {
      const administrator = await TestHelper.createOwner()
      const req = TestHelper.createRequest(`/account/change-username`)
      req.account = administrator.account
      req.session = administrator.session
      const page = await req.get()
      const notificationsContainer = page.getElementById('notifications-container')
      assert.strictEqual(undefined, notificationsContainer.child)
    })

    it('should add impersonation message to header', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      await TestHelper.setImpersonate(administrator, user.account.accountid)
      const req = TestHelper.createRequest(`/account/change-username`)
      req.account = administrator.account
      req.session = administrator.session
      const page = await req.get()
      const notificationsContainer = page.getElementById('notifications-container')
      assert.strictEqual(notificationsContainer.child.length, 1)
    })
  })
})
