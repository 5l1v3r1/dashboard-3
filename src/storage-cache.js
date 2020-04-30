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

if (process.env.NODE_ENV === 'testing') {
  module.exports.setStorageCache = () => {
    if (process.env.STORAGE_CACHE) {
      storageCache = require(process.env.STORAGE_CACHE)
    } else {
      storageCache = require('./storage-cache-node.js')
    }
  }
  module.exports.unsetStorageCache = () => {
    if (process.env.STORAGE_CACHE) {
      return
    }
    storageCache = null
  }
}
