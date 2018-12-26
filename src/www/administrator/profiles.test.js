/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe('/administrator/profiles', () => {
  describe('Profiles#BEFORE', () => {
    it('should bind profiles to req', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/administrator/profiles`)
      req.account = administrator.account
      req.session = administrator.session
      await req.route.api.before(req)
      assert.strictEqual(req.data.profiles.length, global.pageSize)
      assert.strictEqual(req.data.profiles[0].profileid, user.profile.profileid)
      assert.strictEqual(req.data.profiles[1].profileid, administrator.profile.profileid)
    })
  })

  describe('Profiles#GET', () => {
    it('should limit profiles to one page', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        await TestHelper.createProfile(user)
      }
      const req = TestHelper.createRequest('/administrator/profiles')
      req.account = administrator.account
      req.session = administrator.session
      const page = await req.get()
      const doc = TestHelper.extractDoc(page)
      const table = doc.getElementById('profiles-table')
      const rows = table.getElementsByTagName('tr')
      assert.strictEqual(rows.length, global.pageSize + 1)
    })

    it('should enforce page size', async () => {
      global.pageSize = 3
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        await TestHelper.createProfile(user)
      }
      const req = TestHelper.createRequest('/administrator/profiles')
      req.account = administrator.account
      req.session = administrator.session
      const page = await req.get()
      const doc = TestHelper.extractDoc(page)
      const table = doc.getElementById('profiles-table')
      const rows = table.getElementsByTagName('tr')
      assert.strictEqual(rows.length, global.pageSize + 1)
    })

    it('should enforce specified offset', async () => {
      const offset = 1
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const profiles = [ user.profile ]
      for (let i = 0, len = offset + global.pageSize + 1; i < len; i++) {
        await TestHelper.createProfile(user)
        profiles.unshift(user.profile)
      }
      const req = TestHelper.createRequest(`/administrator/profiles?offset=${offset}`)
      req.account = administrator.account
      req.session = administrator.session
      const page = await req.get()
      const doc = TestHelper.extractDoc(page)
      for (let i = 0, len = global.pageSize; i < len; i++) {
        assert.strictEqual(doc.getElementById(profiles[offset + i].profileid).tag, 'tr')
      }
    })
  })
})
