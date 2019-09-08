/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/account-profiles', () => {
  describe('exceptions', () => {
    describe('invalid-accountid', async () => {
      it('unspecified querystring accountid', async () => {
        const administrator = await TestHelper.createOwner()
        const user = await TestHelper.createUser()
        await TestHelper.createUser()
        await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/administrator/account-profiles-count?accountid=${user.account.accountid}`)
        req.account = administrator.account
        req.session = administrator.session
        const result = await req.get()
        assert.strictEqual(result, 1)
      })
      it('invalid querystring accountid', async () => {
        const administrator = await TestHelper.createOwner()
        const user = await TestHelper.createUser()
        await TestHelper.createUser()
        await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/administrator/account-profiles-count?accountid=${user.account.accountid}`)
        req.account = administrator.account
        req.session = administrator.session
        const result = await req.get()
        assert.strictEqual(result, 1)
      })
    })
  })

  describe('recieves', () => {
    it('required querystring accountid', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/administrator/account-profiles?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      const profilesNow = await req.get()
      assert.strictEqual(profilesNow.length, 1)
      assert.strictEqual(profilesNow[0].profileid, user.profile.profileid)
    })

    it('optional querystring offset (integer)', async () => {
      const offset = 1
      const administrator = await TestHelper.createOwner()
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
      const req = TestHelper.createRequest(`/api/administrator/account-profiles?accountid=${user.account.accountid}&offset=${offset}`)
      req.account = administrator.account
      req.session = administrator.session
      const profilesNow = await req.get()
      for (let i = 0, len = global.pageSize; i < len; i++) {
        assert.strictEqual(profilesNow[i].profileid, profiles[offset + i].profileid)
      }
    })

    it('optional querystring all (boolean)', async () => {
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
      const req = TestHelper.createRequest(`/api/administrator/account-profiles?accountid=${user.account.accountid}&all=true`)
      req.account = administrator.account
      req.session = administrator.session
      const profilesNow = await req.get()
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        assert.strictEqual(profilesNow[i].profileid, profiles[i].profileid)
      }
    })
  })

  describe('returns', () => {
    it('array', async () => {
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
      const req = TestHelper.createRequest(`/api/administrator/account-profiles?accountid=${user.account.accountid}&all=true`)
      req.account = administrator.account
      req.session = administrator.session
      const profilesNow = await req.get()
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        assert.strictEqual(profilesNow[i].profileid, profiles[i].profileid)
      }
    })
  })

  describe('configuration', () =>{ 
    it('environment PAGE_SIZE', async () => {
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
      const req = TestHelper.createRequest(`/api/administrator/account-profiles?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      const profilesNow = await req.get()
      assert.strictEqual(profilesNow.length, global.pageSize)
    })
  })
})
