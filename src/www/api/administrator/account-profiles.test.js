/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/account-profiles', () => {
  describe('exceptions', () => {
    describe('invalid-accountid', () => {
      it('unspecified querystring accountid', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/account-profiles')
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-accountid')
      })

      it('invalid querystring accountid', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/account-profiles?accountid=invalid')
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-accountid')
      })
    })
  })

  describe('receives', () => {
    it('optional querystring offset (integer)', async () => {
      global.delayDiskWrites = true
      const offset = 1
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const profiles = [user.profile.profileid]
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        await TestHelper.createProfile(user, {
          'first-name': user.profile.firstName,
          'last-name': user.profile.lastName,
          'contact-email': user.profile.contactEmail,
          default: 'true'
        })
        profiles.unshift(user.profile.profileid)
      }
      const req = TestHelper.createRequest(`/api/administrator/account-profiles?accountid=${user.account.accountid}&offset=${offset}`)
      req.account = administrator.account
      req.session = administrator.session
      const profilesNow = await req.get()
      for (let i = 0, len = global.pageSize; i < len; i++) {
        assert.strictEqual(profilesNow[i].profileid, profiles[offset + i])
      }
    })

    it('optional querystring limit (integer)', async () => {
      const limit = 1
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      for (let i = 0, len = limit + 1; i < len; i++) {
        await TestHelper.createProfile(user, {
          'first-name': user.profile.firstName,
          'last-name': user.profile.lastName,
          'contact-email': user.profile.contactEmail,
          default: 'true'
        })
      }
      const req = TestHelper.createRequest(`/api/administrator/account-profiles?accountid=${user.account.accountid}&limit=${limit}`)
      req.account = administrator.account
      req.session = administrator.session
      const profilesNow = await req.get()
      assert.strictEqual(profilesNow.length, limit)
    })

    it('optional querystring all (boolean)', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const profiles = [user.profile.profileid]
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        await TestHelper.createProfile(user, {
          'first-name': user.profile.firstName,
          'last-name': user.profile.lastName,
          'contact-email': user.profile.contactEmail,
          default: 'true'
        })
        profiles.unshift(user.profile.profileid)
      }
      const req = TestHelper.createRequest(`/api/administrator/account-profiles?accountid=${user.account.accountid}&all=true`)
      req.account = administrator.account
      req.session = administrator.session
      const profilesNow = await req.get()
      assert.strictEqual(profilesNow.length, profiles.length)
    })
  })

  describe('returns', () => {
    it('array', async () => {
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
      req.filename = __filename
      req.saveResponse = true
      const profilesNow = await req.get()
      assert.strictEqual(profilesNow.length, global.pageSize)
    })
  })

  describe('configuration', () => {
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
