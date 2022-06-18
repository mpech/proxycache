const Cache = require('./cache')
const { open } = require('lmdb')

class FsCache extends Cache {
  constructor (__, fname) {
    const db = open({
      path: fname,
      compression: true
    })
    super({
      get: db.get.bind(db),
      set: db.put.bind(db)
    })
  }
}
FsCache.from = f => new FsCache(null, f)
module.exports = FsCache
