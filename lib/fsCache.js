import Cache from './cache.js'
import { open } from 'lmdb'
class FsCache extends Cache {
  constructor (fname, options = {}) {
    const db = open({
      path: fname,
      compression: true

      // noSync: true,
      // noMemInit: true
    })
    super({
      get: db.get.bind(db),
      set: db.put.bind(db)
    }, options)
  }
}

FsCache.from = (f, options) => new FsCache(f, options)

export default FsCache
