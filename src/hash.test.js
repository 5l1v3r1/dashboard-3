/* eslint-env mocha */
const assert = require('assert')
const Hash = require('./hash.js')

describe('internal-api/hash', () => {
  describe('Hash#fixedSaltHash', () => {
    it('should produce the same hash each time', async () => {
      const raw = 'this is a string'
      const hashed = await Hash.fixedSaltHash(raw)
      assert.notStrictEqual(raw, hashed)
      const hashed2 = await Hash.fixedSaltHash(raw)
      assert.strictEqual(hashed, hashed2)
    })
  })

  describe('Hash#fixedSaltCompare', () => {
    it('should match text with hash', async () => {
      const raw = 'this is a string'
      const hashed = await Hash.fixedSaltHash(raw)
      const match = await Hash.fixedSaltCompare(raw, hashed)
      assert.strictEqual(match, true)
    })
  })

  describe('Hash#randomSaltHash', () => {
    it('should hash differently each time', async () => {
      const raw = 'this is another string'
      const hashed = await Hash.randomSaltHash(raw)
      const hashed2 = await Hash.randomSaltHash(raw)
      assert.notStrictEqual(raw, hashed)
      assert.notStrictEqual(hashed, hashed2)
    })
  })

  describe('Hash#randomSaltCompare', () => {
    it('should match passwords', async () => {
      const raw = 'this is another string'
      const hashed = await Hash.randomSaltHash(raw)
      const match = await Hash.randomSaltCompare('this is another string', hashed)
      assert.strictEqual(match, true)
    })

    it('should not match invalid passwords', async () => {
      const hashed = await Hash.randomSaltHash('this is another string')
      const match = await Hash.randomSaltCompare('something else', hashed)
      assert.strictEqual(match, false)
    })
  })
})
