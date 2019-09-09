/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/user/profiles`, () => {
  describe('Profiles#GET', () => {
    it('should limit profiles to one page', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createProfile(user, {
        'first-name': user.profile.firstName,
        'last-name': user.profile.lastName,
        'contact-email': user.profile.contactEmail,
        default: 'true'
      })
      const req = TestHelper.createRequest(`/api/user/profiles?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      const profilesNow = await req.get()
      assert.strictEqual(profilesNow.length, global.pageSize)
    })

    it('redacted profile hash', async () => {
      const user = await TestHelper.createUser()
      const profile1 = user.profile
      await TestHelper.createProfile(user, {
        'first-name': user.profile.firstName,
        'last-name': user.profile.lastName,
        'contact-email': user.profile.contactEmail,
        default: 'true'
      })
      const profile2 = user.profile
      const req = TestHelper.createRequest(`/api/user/profiles?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      const profilesNow = await req.get()
      assert.strictEqual(profilesNow.length, global.pageSize)
      assert.strictEqual(profilesNow[0].profileid, profile2.profileid)
      assert.strictEqual(profilesNow[1].profileid, profile1.profileid)
    })

    it('environment PAGE_SIZE', async () => {
      global.pageSize = 3
      const user = await TestHelper.createUser()
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        await TestHelper.createProfile(user, {
          'first-name': user.profile.firstName,
          'last-name': user.profile.lastName,
          'contact-email': user.profile.contactEmail,
          default: 'true'
        })
      }
      const req = TestHelper.createRequest(`/api/user/profiles?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      const profilesNow = await req.get()
      assert.strictEqual(profilesNow.length, global.pageSize)
    })

    it('optional querystring offset (integer)', async () => {
      const offset = 1
      const user = await TestHelper.createUser()
      const profiles = [ user.profile ]
      for (let i = 0, len = offset + global.pageSize + 1; i < len; i++) {
        await TestHelper.createProfile(user, {
          'first-name': user.profile.firstName,
          'last-name': user.profile.lastName,
          'contact-email': user.profile.contactEmail,
          default: 'true'
        })
        profiles.unshift(user.profile)
      }
      const req = TestHelper.createRequest(`/api/user/profiles?accountid=${user.account.accountid}&offset=${offset}`)
      req.account = user.account
      req.session = user.session
      const profilesNow = await req.get()
      for (let i = 0, len = global.pageSize; i < len; i++) {
        assert.strictEqual(profilesNow[i].profileid, profiles[offset + i].profileid)
      }
    })

    it('optional querystring all (boolean)', async () => {
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
      const req = TestHelper.createRequest(`/api/user/profiles?accountid=${user.account.accountid}&all=true`)
      req.account = user.account
      req.session = user.session
      const profilesNow = await req.get()
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        assert.strictEqual(profilesNow[i].profileid, profiles[i].profileid)
      }
    })
  })
})
