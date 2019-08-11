const cache = {}
const cacheList = []

module.exports = {
  get: async (key) => {
    return cache[key]
  },
  set: async (key, value) => {
    if (cache[key] === undefined) {
      cacheList.push(key)
    } else if (value === undefined) {
      delete (cache[key])
      cacheList.splice(cacheList.indexOf(key), 1)
    }
    cache[key] = value
    cacheList.unshift(key)
    if (cacheList.length > 100000) {
      const remove = cacheList.pop()
      delete (cache[remove])
    }
  },
  remove: async (key) => {
    delete cache[key]
  }
}
