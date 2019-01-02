const bcrypt = require('bcrypt-node')
const UUID = require('./uuid.js')

module.exports = {
  fixedSaltCompare,
  fixedSaltHash,
  randomSaltCompare,
  randomSaltHash
}

function fixedSaltCompare(text, hash, alternativeFixedSalt, alternativeEncryptionKey) {
  return fixedSaltHash(text, alternativeFixedSalt, alternativeEncryptionKey) === hash
}

const fixedCache = {}
const fixedCacheItems = []

function fixedSaltHash(text, alternativeFixedSalt, alternativeEncryptionKey) {
  const cached = fixedCache[text]
  if (cached) {
    return cached
  }
  const finalText = text + (alternativeEncryptionKey || global.applicationEncryptionKey || '')
  const full = bcrypt.hashSync(finalText, alternativeFixedSalt || global.bcryptFixedSalt)
  const hashed = full.substring(alternativeFixedSalt ? alternativeFixedSalt.length : global.bcryptFixedSalt.length)
  // if the user is using 'fs' or 's3' there are restrictions and fixed 
  // hashes are often used for indexes
  const fileFriendlyFormat = UUID.encode(hashed)
  fixedCache[text] = fileFriendlyFormat
  fixedCacheItems.unshift(text)
  if (fixedCacheItems.length > 10000) {
    const removed = fixedCacheItems.pop()
    delete (fixedCache[removed])
  }
  return fileFriendlyFormat
}

const randomCache = {}
const randomCacheItems = []

function randomSaltCompare(text, hash, alternativeEncryptionKey) {
  const cacheKey = `${text}:${hash}`
  const cached = randomCache[cacheKey]
  if (cached === true || cached === false) {
    return cached
  }
  const match = bcrypt.compareSync(text + (alternativeEncryptionKey || global.applicationEncryptionKey || ''), hash)
  randomCache[cacheKey] = match
  randomCacheItems.unshift(cacheKey)
  if (randomCacheItems.length > 10000) {
    const removed = randomCacheItems.pop()
    delete (randomCache[removed])
  }
  return match
}

function randomSaltHash(text, alternativeWorkloadFactor, alternativeEncryptionKey) {
  const salt = bcrypt.genSaltSync(alternativeWorkloadFactor || global.bcryptWorkloadFactor || 11)
  return bcrypt.hashSync(text + (alternativeEncryptionKey || global.applicationEncryptionKey || ''), salt)
}
