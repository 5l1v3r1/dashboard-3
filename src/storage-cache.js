let storageCache
if (process.env.STORAGE_CACHE) {
  if (process.env.STORAGE_CACHE === 'node') {
    storageCache = require('./storage-cache-node.js')
  } else {
    storageCache = require(process.env.STORAGE_CACHE)
  }
}

module.exports = {
  get: async (key) => {
    if (!storageCache) {
      return
    }
    if (!key || !key.length) {
      throw new Error('invalid-key')
    }
    return storageCache.get(key)
  },
  set: async (key, value) => {
    if (!storageCache) {
      return
    }
    if (!key || !key.length) {
      throw new Error('invalid-key')
    }
    return storageCache.set(key, value)
  },
  remove: async (key) => {
    if (!storageCache) {
      return
    }
    if (!key || !key.length) {
      throw new Error('invalid-key')
    }
    return storageCache.remove(key)
  }
}