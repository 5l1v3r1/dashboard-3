const crypto = require('crypto')

module.exports = {
  setup: async (moduleName) => {
    let storage, cache
    if (process.env.STORAGE) {
      const Storage = require(process.env.STORAGE).Storage
      storage = await Storage.setup(moduleName)
    } else {
      const Storage = require('./storage-fs.js')
      storage = await Storage.setup(moduleName)
    }
    if (process.env.CACHE) {
      cache = require('./storage-cache.js')
    }
    const container = {
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
        const exists = await storage.exists(file)
        if (!exists) {
          return undefined
        }
        const contents = await storage.read(file)
        if (!contents) {
          return null
        }
        const data = decrypt(contents)
        if (cache) {
          if (data.substring || data < 0 || data >= 0) {
            await cache.set(file, data)
          } else {
            await cache.set(file, JSON.stringify(data))
          }
        }
        return data
      },
      readMany: async (prefix, files) => {
        if (!files || !files.length) {
          throw new Error('invalid-files')
        }
        const data = {}
        let noncachedFiles
        if (cache) {
          noncachedFiles = []
          for (const file of files) {
            const cached = await cache.get(file)
            if (cached) {
              if (cached.indexOf('{') === 0) {
                data[file] = JSON.parse(cached)
              } else {
                data[file] = JSON.parse(cached)
              }
            } else {
              noncachedFiles.push(file)
            }
          }
        } else {
          noncachedFiles = [].concat(files)
        }
        let uncachedData
        if (noncachedFiles.length) {
          uncachedData = await storage.readMany(prefix, noncachedFiles)
        } else {
          return data
        }
        for (const file of files) {
          if (!uncachedData[file]) {
            continue
          }
          data[file] = decrypt(uncachedData[file])
          if (data[file].indexOf('{') === 0) {
            data[file] = JSON.parse(data[file])
          }
          if (cache) {
            if (data[file].substring || data[file] < 0 || data[file] >= 0) {
              await cache.set(file, data[file])
            } else {
              await cache.set(file, JSON.stringify(data[file]))
            }
          }
        }
        return data
      },
      readBinary: async (file) => {
        if (!file) {
          throw new Error('invalid-file')
        }
        if (cache) {
          const cached = await cache.get(file)
          if (cached) {
            return Buffer.from(cached)
          }
        }
        const data = storage.readBinary(file)
        if (cache) {
          await cache.set(file, data.toString('hex'))
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
        let string = contents
        if (string && !string.substring) {
          string = JSON.stringify(string)
        }
        await storage.write(file, encrypt(string))
        if (cache) {
          await cache.set(file, string)
        }
      },
      writeBinary: async (file, buffer) => {
        if (!file) {
          throw new Error('invalid-file')
        }
        if (!buffer) {
          throw new Error('invalid-buffer')
        }
        await storage.writeBinary(file, buffer)
        if (cache) {
          await cache.set(file, buffer.toString('hex'))
        }
      },
      delete: async (file) => {
        if (!file) {
          throw new Error('invalid-file')
        }
        await storage.delete(file)
        if (cache) {
          await cache.remove(file)
        }
      }
    }
    if (process.env.NODE_ENV === 'testing') {
      container.flush = async () => {
        await storage.flush()
      }
    }
    return container
  }
}

function decrypt (value) {
  if (!global.encryptionSecret) {
    return value
  }
  try {
    return crypto.createDecipheriv('aes-256-ctr', global.encryptionSecret, Buffer.from(global.encryptionSecretIV)).update(value.toString('hex'), 'hex', 'utf-8')
  } catch (error) {
  }
  return value
}

function encrypt (value) {
  if (!global.encryptionSecret) {
    return value
  }
  if (!value.substring) {
    value = value.toString()
  }
  return crypto.createCipheriv('aes-256-ctr', global.encryptionSecret, Buffer.from(global.encryptionSecretIV)).update(value, 'utf-8', 'hex')
}
