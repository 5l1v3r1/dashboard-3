const crypto = require('crypto')

module.exports = {
  encode,
  generateID,
  random,
  v4
}

// this is the 'uuid' module v4 function abbreviated from https://github.com/kelektiv/node-uuid/
const byteToHex = []
for (let i = 0; i < 256; ++i) {
  byteToHex[i] = (i + 0x100).toString(16).substring(1)
}

function v4 () {
  const buffer = crypto.randomBytes(16)
  buffer[6] = (buffer[6] & 0x0f) | 0x40
  buffer[8] = (buffer[8] & 0x3f) | 0x80
  let i = 0
  return byteToHex[buffer[i++]] + byteToHex[buffer[i++]] + byteToHex[buffer[i++]] + byteToHex[buffer[i++]] + '-' +
    byteToHex[buffer[i++]] + byteToHex[buffer[i++]] + '-' +
    byteToHex[buffer[i++]] + byteToHex[buffer[i++]] + '-' +
    byteToHex[buffer[i++]] + byteToHex[buffer[i++]] + '-' +
    byteToHex[buffer[i++]] + byteToHex[buffer[i++]] + byteToHex[buffer[i++]] + byteToHex[buffer[i++]] + byteToHex[buffer[i++]] + byteToHex[buffer[i++]]
}

function random (length) {
  if (!length) {
    return null
  }
  let str = ''
  const buffer = crypto.randomBytes(length)
  for (const byte of buffer) {
    str += byteToHex[byte]
  }
  return str
}

function encode (string) { 
  if (!string || !string.length) {
    return null
  }
  let str = ''
  const buffer = Buffer.from(string)
  for (const byte of buffer) {
    str += byteToHex[byte]
  }
  return str
}

// via https://coligo.io/create-url-shortener-with-node-express-mongo/
function generateID () {
  return random(16)
}
