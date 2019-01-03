const bcrypt = require('bcrypt-node')
const UUID = require('./uuid.js')

module.exports = {
  fixedSaltCompare,
  fixedSaltHash,
  randomSaltCompare,
  randomSaltHash
}

function fixedSaltCompare(text, hash, alternativeFixedSalt, alternativeDashboardEncryptionKey) {
  return fixedSaltHash(text, alternativeFixedSalt, alternativeDashboardEncryptionKey) === hash
}

const fixedCache = {}
const fixedCacheItems = []

function fixedSaltHash(text, alternativeFixedSalt, alternativeDashboardEncryptionKey) {
  const cacheKey = `${text}:${alternativeFixedSalt}:${alternativeDashboardEncryptionKey}`
  const cached = fixedCache[cacheKey]
  if (cached) {
    return cached
  }
  const finalText = text + (alternativeDashboardEncryptionKey || global.dashboardEncryptionKey || '')
  const salt = alternativeFixedSalt || global.bcryptFixedSalt
  const full = bcrypt.hashSync(finalText, salt)
  const hashed = full.substring(salt.length)
  // if the user is using 'fs' or 's3' these hashes are used in filenames 
  // so they get hex-encoded for compatibility
  const fileFriendlyFormat = UUID.encode(hashed)
  fixedCache[cacheKey] = fileFriendlyFormat
  fixedCacheItems.unshift(cacheKey)
  if (fixedCacheItems.length > 10000) {
    const removed = fixedCacheItems.pop()
    delete (fixedCache[removed])
  }
  return fileFriendlyFormat
}

const randomCache = {}
const randomCacheItems = []

function randomSaltCompare(text, hash, alternativeDashboardEncryptionKey) {
  const cacheKey = `${text}:${hash}:${alternativeDashboardEncryptionKey}`
  const cached = randomCache[cacheKey]
  if (cached === true || cached === false) {
    return cached
  }
  const key = alternativeDashboardEncryptionKey || global.dashboardEncryptionKey || ''
  const match = bcrypt.compareSync(text + key, hash)
  randomCache[cacheKey] = match
  randomCacheItems.unshift(cacheKey)
  if (randomCacheItems.length > 10000) {
    const removed = randomCacheItems.pop()
    delete (randomCache[removed])
  }
  return match
}

function randomSaltHash(text, alternativeWorkloadFactor, alternativeDashboardEncryptionKey) {
  const workload = alternativeWorkloadFactor || global.bcryptWorkloadFactor
  const key = alternativeDashboardEncryptionKey || global.dashboardEncryptionKey || ''
  const salt = bcrypt.genSaltSync(workload)
  return bcrypt.hashSync(text + key, salt)
}
