/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe('/administrator/profile', () => {
  describe('Profile#BEFORE', () => {
    it('should bind profile to req', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/administrator/profile?profileid=${user.profile.profileid}`)
      req.account = administrator.account
      req.session = administrator.session
      await req.route.api.before(req)
      assert.strictEqual(req.data.profile.profileid, user.profile.profileid)
    })
  })

  describe('Profile#GET', () => {
    it('should present the profile table', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/administrator/profile?profileid=${user.profile.profileid}`)
      req.account = administrator.account
      req.session = administrator.session
      const page = await req.get()
      const doc = TestHelper.extractDoc(page)
      const table = doc.getElementById('profiles-table')
      const tbody = table.getElementById(user.profile.profileid)
      assert.strictEqual(tbody.tag, 'tbody')
    })
  })
})
