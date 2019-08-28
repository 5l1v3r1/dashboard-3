/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/profiles', async () => {
  describe('Profiles#GET', () => {
    it('should limit profiles to one page', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/api/administrator/profiles')
      req.account = administrator.account
      req.session = administrator.session
      const profilesNow = await req.get()
      assert.strictEqual(profilesNow.length, global.pageSize)
      assert.strictEqual(profilesNow[0].profileid, user.profile.profileid)
      assert.strictEqual(profilesNow[1].profileid, administrator.profile.profileid)
    })

    it('should enforce page size', async () => {
      global.pageSize = 3
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        await TestHelper.createProfile(user, {
          'first-name': user.profile.firstName,
          'last-name': user.profile.lastName,
          'contact-email': user.profile.contactEmail,
          default: 'true'
        })
      }
      const req = TestHelper.createRequest('/api/administrator/profiles')
      req.account = administrator.account
      req.session = administrator.session
      const profilesNow = await req.get()
      assert.strictEqual(profilesNow.length, global.pageSize)
    })

    it('should enforce specified offset', async () => {
      const offset = 1
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const profiles = [ administrator.profile, user.profile ]
      for (let i = 0, len = offset + global.pageSize + 1; i < len; i++) {
        await TestHelper.createProfile(user, {
          'first-name': user.profile.firstName,
          'last-name': user.profile.lastName,
          'contact-email': user.profile.contactEmail,
          default: 'true'
        })
        profiles.unshift(user.profile)
      }
      const req = TestHelper.createRequest(`/api/administrator/profiles?offset=${offset}`)
      req.account = administrator.account
      req.session = administrator.session
      const profilesNow = await req.get()
      for (let i = 0, len = global.pageSize; i < len; i++) {
        assert.strictEqual(profilesNow[i].profileid, profiles[offset + i].profileid)
      }
    })

    it('should return all records', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const profiles = [user.profile]
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        await TestHelper.createProfile(user, {
          'first-name': user.profile.firstName,
          'last-name': user.profile.lastName,
          'contact-email': user.profile.contactEmail,
          default: 'true'
        })
        profiles.unshift(user.profile)
      }
      const req = TestHelper.createRequest(`/api/administrator/profiles?all=true`)
      req.account = administrator.account
      req.session = administrator.session
      const profilesNow = await req.get()
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        assert.strictEqual(profilesNow[i].profileid, profiles[i].profileid)
      }
    })
  })
})
