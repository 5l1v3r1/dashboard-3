const fs = require('fs')
const util = require('util')

module.exports = {
  exists: util.promisify(exists),
  read: util.promisify(read),
  readImage: util.promisify(readImage),
  readMany: util.promisify(readMany),
  write: util.promisify(write),
  writeImage: util.promisify(writeImage),
  deleteFile: util.promisify(deleteFile)
}

let storagePath
if (!process.env.STORAGE_ENGINE) {
  storagePath = process.env.STORAGE_PATH || `${global.applicationPath}/data`
  if (!fs.existsSync(storagePath)) {
    createFolderSync(storagePath)
  }
}

function exists (file, callback) {
  return fs.access(`${storagePath}/${file}`, fs.constants.F_OK | fs.constants.W_OK, (error) => {
    return callback(null, error === null || error === undefined)
  })
}

function deleteFile (path, callback) {
  if (!path) {
    return callback(new Error('invalid-file'))
  }
  return exists(path, (_, exists) => {
    if (!exists) {
      return callback(new Error('invalid-file'))
    }
    return fs.unlink(`${storagePath}/${path}`, (error) => {
      return callback(error)
    })
  })
}

function write (file, contents, callback) {
  if (!file) {
    return callback(new Error('invalid-file'))
  }
  if (!contents && contents !== '') {
    return callback(new Error('invalid-contents'))
  }
  if (!contents.substring) {
    contents = JSON.stringify(contents)
  }
  const pathPart = file.substring(0, file.lastIndexOf('/'))
  return exists(pathPart, (_, exists) => {
    if (!exists) {
      return createFolder(`${storagePath}/${pathPart}`, (error) => {
        if (error) {
          return callback(error)
        }
        return fs.writeFile(`${storagePath}/${file}`, contents.toString(), callback)
      })
    }
    return fs.writeFile(`${storagePath}/${file}`, contents.toString(), callback)
  })
}

function writeImage (file, buffer, callback) {
  if (!file) {
    throw new Error('invalid-file')
  }
  if (!buffer || !buffer.length) {
    throw new Error('invalid-buffer')
  }
  const pathPart = file.substring(0, file.lastIndexOf('/'))
  return exists(pathPart, (_, exists) => {
    if (!exists) {
      return createFolder(`${storagePath}/${pathPart}`, (error) => {
        if (error) {
          return callback(error)
        }
        return fs.writeFile(`${storagePath}/${file}`, buffer, callback)
      })
    }
    return fs.writeFile(`${storagePath}/${file}`, buffer, callback)
  })
}

function read (file, callback) {
  if (!file) {
    throw new Error('invalid-file')
  }
  return exists(file, (_, exists) => {
    if (!exists) {
      return undefined
    }
    return fs.readFile(`${storagePath}/${file}`, (error, contents) => {
      if (error) {
        return callback(error)
      }
      if (contents) {
        return callback(null, contents.toString())
      }
      return callback()
    })
  })
}

function readMany (prefix, files, callback) {
  if (!files || !files.length) {
    return callback(new Error('invalid-files'))
  }
  const data = {}
  let index = 0
  function nextFile () {
    const file = files[index]
    return exists(`${prefix}/${file}`, (_, exists) => {
      if (!exists) {
        index++
        if (index < files.length) {
          return nextFile()
        }
        return callback(null, data)
      }
      return fs.readFile(`${storagePath}/${prefix}/${file}`, (error, contents) => {
        if (error) {
          return callback(error)
        }
        if (contents) {
          data[file] = contents.toString()
        }
        index++
        if (index < files.length) {
          return nextFile()
        }
        return callback(null, data)
      })
    })
  }
  return nextFile()
}

function readImage (file, callback) {
  if (!file) {
    throw new Error('invalid-file')
  }
  return exists(file, (_, exists) => {
    if (!exists) {
      return callback()
    }
    return fs.readFile(`${storagePath}/${file}`, callback)
  })
}

function createFolderSync (path) {
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

function createFolder (path, callback) {
  const nested = path.substring(storagePath.length + 1)
  const nestedParts = nested.split('/')
  let nestedPath = storagePath
  let index = 0
  function nextPart () {
    const part = nestedParts[index]
    nestedPath += `/${part}`
    return fs.access(nestedPath, fs.constants.F_OK | fs.constants.W_OK, (error) => {
      if (!error) {
        index++
        if (index < nestedParts.length) {
          return nextPart()
        }
        return callback()
      }
      return fs.mkdir(nestedPath, (error) => {
        if (error) {
          return callback(error)
        }
        index++
        if (index < nestedParts.length) {
          return nextPart()
        }
        return callback()
      })
    })
  }
  return nextPart()
}
