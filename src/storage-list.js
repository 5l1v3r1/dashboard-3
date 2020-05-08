module.exports = {
  setup: async (storage, moduleName) => {
    let storageList
    const env = moduleName ? `${moduleName}_STORAGE` : 'STORAGE'
    if (env && process.env[env]) {
      const StorageList = require(process.env[env]).StorageList
      storageList = await StorageList.setup(storage, moduleName)
    } else {
      const StorageList = require('./storage-list-fs.js')
      storageList = await StorageList.setup(storage, moduleName)
    }
    const container = {
      add: async (path, itemid) => {
        const added = await storageList.exists(path, itemid)
        if (added) {
          return
        }
        return storageList.add(path, itemid)
      },
      count: async (path) => {
        return storageList.count(path)
      },
      exists: async (path, itemid) => {
        return storageList.exists(path, itemid)
      },
      list: async (path, offset, pageSize) => {
        offset = offset || 0
        if (pageSize === null || pageSize === undefined) {
          pageSize = global.pageSize
        }
        if (offset < 0) {
          throw new Error('invalid-offset')
        }
        const itemids = await storageList.list(path, offset, pageSize)
        if (!itemids || !itemids.length) {
          return null
        }
        for (const i in itemids) {
          if (itemids[i] === 'true' || itemids[i] === 'false') {
            itemids[i] = itemids[i] === 'true'
            continue
          }
          if (itemids[i].indexOf && itemids[i].indexOf('.')) {
            try {
              const float = parseFloat(itemids[i])
              if (float.toString() === itemids[i]) {
                itemids[i] = float
                continue
              }
            } catch (error) {
            }
          }
          if (itemids[i].substring && itemids[i].length) {
            try {
              const int = parseInt(itemids[i], 10)
              if (int.toString() === itemids[i]) {
                itemids[i] = int
                continue
              }
            } catch (error) {
            }
          }
        }
        return itemids
      },
      listAll: async (path) => {
        const itemids = await storageList.listAll(path)
        if (!itemids || !itemids.length) {
          return null
        }
        for (const i in itemids) {
          if (itemids[i] === 'true' || itemids[i] === 'false') {
            itemids[i] = itemids[i] === 'true'
            continue
          }
          if (itemids[i].indexOf && itemids[i].indexOf('.')) {
            try {
              const float = parseFloat(itemids[i])
              if (float.toString() === itemids[i]) {
                itemids[i] = float
                continue
              }
            } catch (error) {
            }
          }
          if (itemids[i].substring && itemids[i].length) {
            try {
              const int = parseInt(itemids[i], 10)
              if (int.toString() === itemids[i]) {
                itemids[i] = int
                continue
              }
            } catch (error) {
            }
          }
        }
        return itemids
      },
      remove: async (path, itemid) => {
        return storageList.remove(path, itemid)
      }
    }
    if (process.env.NODE_ENV === 'testing') {
      container.flush = async () => {
        if (storageList.flush) {
          await storageList.flush()
        }
      }
    }
    return container
  }
}
