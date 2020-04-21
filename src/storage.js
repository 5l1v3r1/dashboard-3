const crypto = require('crypto')
let storage, cache
if (process.env.STORAGE_ENGINE) {
  storage = require(process.env.STORAGE_ENGINE).Storage
} else {
  storage = require('./storage-fs.js')
}
if (process.env.STORAGE_CACHE) {
  cache = require('./storage-cache.js')
}

module.exports = {
  setup: storage.setup,
  exists: async (file) => {
    if (!file) {
      throw new Error('invalid-file')
    }
    return storage.exists(file)
  },
  read: async (file) => {
    if (!file) {
      throw new Error('invalid-file')
    }
    if (cache) {
      const cached = await cache.get(file)
      if (cached) {
        return cached
      }
    }
    const exists = await module.exports.exists(file)
    if (!exists) {
      return undefined
    }
    const contents = await storage.read(file)
    if (!contents) {
      return null
    }
    const data = decrypt(contents)
    if (cache) {
      await cache.set(file, data)
    }
    return data
  },
  readMany: async (prefix, files) => {
    if (!files || !files.length) {
      throw new Error('invalid-files')
    }
    const data = {}
    if (cache) {
      for (const file of files) {
        const cached = await cache.get(file)
        if (cached) {
          data[file] = cached
          files.splice(files.indexOf(file), 1)
        }
      }
    }
    const uncachedData = await storage.readMany(prefix, files)
    for (const file of files) {
      if (!uncachedData[file]) {
        continue
      }
      data[file] = decrypt(uncachedData[file])
      if (cache) {
        await cache.set(file, data[file])
      }
    }
    return data
  },
  readImage: async (file) => {
    if (!file) {
      throw new Error('invalid-file')
    }
    const data = storage.readImage(file)
    if (cache) {
      await cache.set(file, data)
    }
    return data
  },
  write: async (file, contents) => {
    if (!file) {
      throw new Error('invalid-file')
    }
    if (!contents && contents !== '') {
      throw new Error('invalid-contents')
    }
    if (contents && !contents.substring) {
      contents = JSON.stringify(contents)
    }
    await storage.write(file, encrypt(contents))
    if (cache) {
      await cache.set(file, contents)
    }
  },
  writeImage: async (file, buffer) => {
    if (!file) {
      throw new Error('invalid-file')
    }
    if (!buffer) {
      throw new Error('invalid-buffer')
    }
    await storage.writeImage(file, buffer)
    if (cache) {
      await cache.set(file, buffer)
    }
  },
  deleteFile: async (file) => {
    if (!file) {
      throw new Error('invalid-file')
    }
    await storage.deleteFile(file)
    if (cache) {
      await cache.remove(file)
    }
  }
}

if (process.env.NODE_ENV === 'testing') {
  module.exports.flush = async () => {
    await storage.flush()
  }
}

function decrypt (value) {
  if (!process.env.ENCRYPTION_KEY) {
    return value
  }
  try {
    return crypto.createDecipheriv('aes-256-ctr', process.env.ENCRYPTION_KEY, Buffer.from(process.env.ENCRYPTION_SECRET_IV)).update(value.toString('hex'), 'hex', 'utf-8')
  } catch (error) {
  }
  return value
}

function encrypt (value) {
  if (!process.env.ENCRYPTION_KEY) {
    return value
  }
  if (!value.substring) {
    value = value.toString()
  }
  return crypto.createCipheriv('aes-256-ctr', process.env.ENCRYPTION_KEY, Buffer.from(process.env.ENCRYPTION_SECRET_IV)).update(value, 'utf-8', 'hex')
}
