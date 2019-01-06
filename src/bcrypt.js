// bcrypt only uses the first 72 characters in a string
// so hash and compare are wrapped to transparently convert
// to SHA hashes first ensuring bcrypt uses the entire string
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const util = require('util')

function hash (text, salt, progress, callback) {
  callback = callback || progress
  const sha = crypto.createHash('sha256')
  const textHash = sha.update(text).digest('hex')
  return bcrypt.hash(textHash, salt, callback)
}

function compare (text, hash, callback) {
  const sha = crypto.createHash('sha256')
  const textHash = sha.update(text).digest('hex')
  return bcrypt.compare(textHash, hash, callback)
}

module.exports = {
  compare,
  compareSync: util.promisify(compare),
  hash,
  hashSync: util.promisify(hash),
  genSalt: bcrypt.genSalt,
  genSaltSync: bcrypt.genSaltSync
}