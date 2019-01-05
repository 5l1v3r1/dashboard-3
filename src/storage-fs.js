const fs = require('fs')

module.exports = {
  exists,
  read,
  readImage,
  readMany,
  write,
  writeImage,
  deleteFile
}

let storagePath
if (!process.env.STORAGE_ENGINE) {
  storagePath = process.env.STORAGE_PATH || `${global.applicationPath}/data`
  if (!fs.existsSync(storagePath)) {
    createFolder(storagePath)
  }
}

async function exists (file) {
  return fs.existsSync(`${storagePath}/${file}`)
}

async function deleteFile (path) {
  if (!path) {
    throw new Error('invalid-file')
  }
  if (!fs.existsSync(`${storagePath}/${path}`)) {
    throw new Error(`invalid-file`)
  }
  fs.unlinkSync(`${storagePath}/${path}`)
}

async function write (file, contents) {
  if (!file) {
    throw new Error('invalid-file')
  }
  if (!contents && contents !== '') {
    throw new Error('invalid-contents')
  }
  if (!contents.substring) {
    contents = JSON.stringify(contents)
  }
  const pathPart = file.substring(0, file.lastIndexOf('/'))
  if (!fs.existsSync(`${storagePath}/${pathPart}`)) {
    createFolder(`${storagePath}/${pathPart}`)
  }
  return fs.writeFileSync(`${storagePath}/${file}`, contents.toString('utf-8'))
}

async function writeImage (file, buffer) {
  if (!file) {
    throw new Error('invalid-file')
  }
  if (!buffer || !buffer.length) {
    throw new Error('invalid-buffer')
  }
  const pathPart = file.substring(0, file.lastIndexOf('/'))
  if (!fs.existsSync(`${storagePath}/${pathPart}`)) {
    createFolder(`${storagePath}/${pathPart}`)
  }
  return fs.writeFileSync(`${storagePath}/${file}`, buffer)
}

async function read (file) {
  if (!file) {
    throw new Error('invalid-file')
  }
  if (!fs.existsSync(`${storagePath}/${file}`)) {
    return undefined
  }
  return fs.readFileSync(`${storagePath}/${file}`).toString('utf-8')
}

async function readMany(prefix, files) {
  if (!files || !files.length) {
    throw new Error('invalid-files')
  }
  const data = {}
  for (const file of files) {
    if (!fs.existsSync(`${storagePath}/${prefix}/${file}`)) {
      return undefined
    }
    data[file] = fs.readFileSync(`${storagePath}/${prefix}/${file}`).toString('utf-8')
  }
  return data
}

async function readImage (file) {
  if (!file) {
    throw new Error('invalid-file')
  }
  if (!fs.existsSync(`${storagePath}/${file}`)) {
    return undefined
  }
  return fs.readFileSync(`${storagePath}/${file}`)
}

function createFolder (path) {
  const nested = path.substring(storagePath.length + 1)
  const nestedParts = nested.split('/')
  let nestedPath = storagePath
  for (const part of nestedParts) {
    nestedPath += `/${part}`
    if (!fs.existsSync(nestedPath)) {
      fs.mkdirSync(nestedPath)
    }
  }
}
