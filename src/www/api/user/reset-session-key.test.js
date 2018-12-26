/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

/* eslint-env mocha */
describe('/api/user/reset-session-key', async () => {
  describe('ResetSessionKey#PATCH', () => {
    it('should end current session', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/reset-session-key?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      await req.patch()
      const req2 = TestHelper.createRequest(`/api/administrator/session?sessionid=${user.session.sessionid}`)
      req2.account = administrator.account
      req2.session = administrator.session
      const session = await req2.get(req2)
      assert.notStrictEqual(session.ended, undefined)
      assert.notStrictEqual(session.ended, null)
    })

    it('should update account sessionKeyLastReset', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/reset-session-key?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      const account = await req.patch()
      assert.notStrictEqual(account.sessionKeyLastReset, undefined)
      assert.notStrictEqual(account.sessionKeyLastReset, null)
    })
  })
})
