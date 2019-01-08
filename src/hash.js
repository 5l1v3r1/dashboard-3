const bcrypt = require('./bcrypt.js')
const util = require('util')
const UUID = require('./uuid.js')

module.exports = {
  fixedSaltCompare: util.promisify(fixedSaltCompare),
  fixedSaltHash: util.promisify(fixedSaltHash),
  randomSaltCompare: util.promisify(randomSaltCompare),
  randomSaltHash: util.promisify(randomSaltHash)
}

function fixedSaltCompare(text, hash, alternativeFixedSalt, alternativeDashboardEncryptionKey, callback) {
  if (!callback) {
    callback = alternativeFixedSalt
    alternativeFixedSalt = null
  }
  return fixedSaltHash(text, alternativeFixedSalt, alternativeDashboardEncryptionKey, (error, textHash) => {
    if (error) {
      return callback(error)
    }
    return callback(null, textHash === hash)
  })
}

const fixedCache = {}
const fixedCacheItems = []

function fixedSaltHash(text, alternativeFixedSalt, alternativeDashboardEncryptionKey, callback) {
  if (!callback) {
    callback = alternativeFixedSalt
    alternativeFixedSalt = null
  }
  const cacheKey = `${text}:${alternativeFixedSalt}:${alternativeDashboardEncryptionKey}`
  const cached = fixedCache[cacheKey]
  if (cached) {
    return callback(null, cached)
  }
  const finalText = text + (alternativeDashboardEncryptionKey || global.dashboardEncryptionKey || '')
  const salt = alternativeFixedSalt || global.bcryptFixedSalt
  return bcrypt.hash(finalText, salt, (error, full) => {
    if (error) {
      return callback(error)
    }
    const hashed = full.substring(salt.length)
    // if the user is ucallbacking 'fs' or 's3' these hashes are used in filenames 
    // so they get hex-callbackncoded for compatibility
    const fileFriendlyFormat = UUID.encode(hashed)
    fixedCache[cacheKey] = fileFriendlyFormat
    fixedCacheItems.unshift(cacheKey)
    if (fixedCacheItems.length > 10000) {
      const removed = fixedCacheItems.pop()
      delete (fixedCache[removed])
    }
    return callback(null, fileFriendlyFormat)
  })
}

const randomCache = {}
const randomCacheItems = []

function randomSaltCompare(text, hash, alternativeDashboardEncryptionKey, callback) {
  if (!callback) {
    callback = alternativeDashboardEncryptionKey
    alternativeDashboardEncryptionKey = null
  }
  const cacheKey = `${text}:${hash}:${alternativeDashboardEncryptionKey}`
  const cached = randomCache[cacheKey]
  if (cached === true || cached === false) {
    return callback(null, cached)
  }
  const key = alternativeDashboardEncryptionKey || global.dashboardEncryptionKey || ''
  return bcrypt.compare(text + key, hash, (error, match) => {
    if (error) {
      return callback(error)
    }
    randomCache[cacheKey] = match
    randomCacheItems.unshift(cacheKey)
    if (randomCacheItems.length > 10000) {
      const removed = randomCacheItems.pop()
      delete (randomCache[removed])
    }
    return callback(null, match)
  })
}

function randomSaltHash(text, alternativeDashboardEncryptionKey, callback) {
  if (!callback) {
    callback = alternativeDashboardEncryptionKey
    alternativeDashboardEncryptionKey = null
  }
  const workload = bcrypt.getRounds(global.bcryptFixedSalt)
  const key = alternativeDashboardEncryptionKey || global.dashboardEncryptionKey || ''
  return bcrypt.genSalt(workload, (error, salt) => {
    if (error) {
      return callback(error)
    }
    return bcrypt.hash(text + key, salt, null, callback)
  })
}
