/* eslint-env mocha */
const assert = require('assert')
const Hash = require('./hash.js')

describe('internal-api/hash', () => {
  describe('Hash#fixedSaltHash()', () => {
    it('should produce the same hash each time', async () => {
      const raw = 'this is a string'
      const hashed = Hash.fixedSaltHash(raw)
      assert.notStrictEqual(raw, hashed)
      const hashed2 = Hash.fixedSaltHash(raw)
      assert.strictEqual(hashed, hashed2)
    })
  })

  describe('Hash#fixedSaltCompare()', () => {
    it('should match text with hash', async () => {
      const raw = 'this is a string'
      const hashed = Hash.fixedSaltHash(raw)
      const match = Hash.fixedSaltCompare(raw, hashed)
      assert.strictEqual(match, true)
    })
  })

  describe('Hash#randomSaltHash()', () => {
    it('should hash differently each time', async () => {
      const raw = 'this is another string'
      const hashed = Hash.randomSaltHash(raw)
      const hashed2 = Hash.randomSaltHash(raw)
      assert.notStrictEqual(raw, hashed)
      assert.notStrictEqual(hashed, hashed2)
    })
  })

  describe('Hash#randomSaltCompare()', () => {
    it('should match passwords', async () => {
      const raw = 'this is another string'
      const hashed = Hash.randomSaltHash(raw)
      assert.strictEqual(Hash.randomSaltCompare(raw, hashed), true)
    })

    it('should not match invalid passwords', async () => {
      const hashed = Hash.randomSaltHash('this is another string')
      assert.strictEqual(Hash.randomSaltCompare('something else', hashed), false)
    })
  })
})
