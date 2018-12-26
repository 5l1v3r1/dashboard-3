const bcrypt = require('bcrypt-node')

module.exports = {
  fixedSaltCompare,
  fixedSaltHash,
  randomSaltCompare,
  randomSaltHash
}

function fixedSaltCompare(text, hash) {
  return fixedSaltHash(text) === hash
}

const fixedCache = {}
const fixedCacheItems = []

function fixedSaltHash(text) {
  const cached = fixedCache[text]
  if (cached) {
    return cached
  }
  const finalText = text + (global.applicationEncryptionKey || '')
  const full = bcrypt.hashSync(finalText, global.bcryptFixedSalt)
  const hashed = full.substring(global.bcryptFixedSalt.length)
  const fileSafe = makeFileNameSafe(hashed)
  fixedCache[text] = fileSafe
  fixedCacheItems.unshift(text)
  if (fixedCacheItems.length > 10000) {
    const removed = fixedCacheItems.pop()
    delete (fixedCache[removed])
  }
  return fileSafe
}

const randomCache = {}
const randomCacheItems = []

function randomSaltCompare(text, hash) {
  const cacheKey = `${text}:${hash}`
  const cached = randomCache[cacheKey]
  if (cached === true || cached === false) {
    return cached
  }
  const match = bcrypt.compareSync(text + (global.applicationEncryptionKey || ''), hash)
  randomCache[cacheKey] = match
  randomCacheItems.unshift(cacheKey)
  if (randomCacheItems.length > 10000) {
    const removed = randomCacheItems.pop()
    delete (randomCache[removed])
  }
  return match
}

function randomSaltHash(text) {
  const salt = bcrypt.genSaltSync(global.bcryptWorkloadFactor || 11)
  return bcrypt.hashSync(text + (global.applicationEncryptionKey || ''), salt)
}

function makeFileNameSafe(str) {
  let string = ''
  const buffer = Buffer.from(str)
  for (const byte of buffer) {
    const characterPosition = byte % global.uuidEncodingCharacters.length
    string += global.uuidEncodingCharacters.charAt(characterPosition)
  }
  return string
}
