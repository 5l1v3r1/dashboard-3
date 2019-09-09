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
        await TestHelper.createProfile(user, {
          'first-name': user.profile.firstName,
          'last-name': user.profile.lastName,
          'contact-email': user.profile.contactEmail,
          default: 'true'
        })
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
        await TestHelper.createProfile(user, {
          'first-name': user.profile.firstName,
          'last-name': user.profile.lastName,
          'contact-email': user.profile.contactEmail,
          default: 'true'
        })
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

    it('should show fields if data exists', async () => {
      const administrator = await TestHelper.createOwner()
      const req = TestHelper.createRequest(`/administrator/profiles`)
      req.account = administrator.account
      req.session = administrator.session
      const page = await req.get()
      const doc = TestHelper.extractDoc(page)
      assert.strictEqual(doc.getElementById('full-name').tag, 'th')
      assert.strictEqual(doc.getElementById('contact-email').tag, 'th')
      const fields = {
        'display-email': 'test2@test.com',
        dob: '2000-01-01',
        'display-name': 'tester',
        phone: '456-789-0123',
        occupation: 'Programmer',
        location: 'USA',
        'company-name': administrator.profile.contactEmail.split('@')[1].split('.')[0],
        website: 'https://' + administrator.profile.contactEmail.split('@')[1]
      }
      for (const field in fields) {
        assert.strictEqual(doc.getElementById(field), undefined)
      }
      for (const field in fields) {
        global.userProfileFields = ['full-name', 'contact-email', field]
        await TestHelper.createProfile(administrator, {
          'first-name': 'Test',
          'last-name': 'Person',
          'contact-email': 'test1@test.com',
          [field]: fields[field]
        })
        const page2 = await req.get()
        const doc2 = TestHelper.extractDoc(page2)
        assert.strictEqual(doc2.getElementById(field).tag, 'th')
        assert.strictEqual(doc2.getElementById('contact-email').tag, 'th')
        assert.strictEqual(doc2.getElementById('full-name').tag, 'th')
      }
    })
  })
})
