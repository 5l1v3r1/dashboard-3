/* eslint-env mocha */
const assert = require('assert')
const Storage = require('./storage.js')

describe('internal-api/storage', () => {
  describe('Storage#read', () => {
    it('should require file', async () => {
      let errorMessage
      try {
        await Storage.read(null)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-file')
    })

    it('should return file contents', async () => {
      await Storage.write('test-read/1', { test: true })
      const file = await Storage.read('test-read/1')
      assert.strictEqual(file, '{"test":true}')
    })
  })

  describe('Storage#readMany', () => {
    it('should require files array', async () => {
      let errorMessage
      try {
        await Storage.readMany(null)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-files')
      errorMessage = null
      try {
        await Storage.readMany([])
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-files')
    })

    it('should return files contents', async () => {
      await Storage.write('test/1', { test: 1 })
      await Storage.write('test/2', { test: 2 })
      await Storage.write('test/3', { test: 3 })
      const files = await Storage.readMany('test', ['1', '2', '3'])
      assert.strictEqual(files['1'], '{"test":1}')
      assert.strictEqual(files['2'], '{"test":2}')
      assert.strictEqual(files['3'], '{"test":3}')
    })
  })

  describe('Storage#write', async () => {
    it('should require file', async () => {
      let errorMessage
      try {
        await Storage.write(null, {})
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-file')
    })

    it('should require contents', async () => {
      let errorMessage
      try {
        await Storage.write('test-write', null)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-contents')
    })

    it('should accept content object', async () => {
      await Storage.write('test-object', { test: true })
      const file = await Storage.read('test-object')
      assert.strictEqual(file, '{"test":true}')
    })

    it('should accept content string', async () => {
      await Storage.write('test-object', 'string')
      const file = await Storage.read('test-object')
      assert.strictEqual(file, 'string')
    })

    it('should write file contents', async () => {
      await Storage.write('test-write', { test: true })
      const file = await Storage.read('test-write')
      assert.strictEqual(file, '{"test":true}')
    })

    it('should encrypt contents', async () => {
      global.encryptionSecret = '12345678901234567890123456789012'
      global.encryptionSecretIV = '1234123412341234'
      await Storage.write('test-write', { test: true })
      const decryptedVersion = await Storage.read('test-write')
      assert.strictEqual(decryptedVersion, '{"test":true}')
      global.encryptionSecret = ''
      global.encryptionSecretIV = ''
      if (process.env.STORAGE_CACHE) {
        const StorageCache = require('./storage-cache.js')
        await StorageCache.remove('test-write')
      }
      const cannotDecrypt = await Storage.read('test-write')
      assert.notStrictEqual(cannotDecrypt, '{"test":true}')
    })
  })

  describe('Storage#deleteFile', async () => {
    it('should require file', async () => {
      let errorMessage
      try {
        await Storage.deleteFile(null)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-file')
    })

    it('should delete file', async () => {
      await Storage.write('test-delete', { test: true })
      await Storage.deleteFile('test-delete')
      const file = await Storage.read('test-delete')
      assert.strictEqual(file, undefined)
    })
  })
})
