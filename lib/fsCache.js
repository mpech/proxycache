import Cache from './cache.js'
import { open } from 'lmdb'

class FsCache extends Cache {
  constructor (__, fname) {
    const db = open({
      path: fname,
      compression: true,

      // noSync: true,
      // noMemInit: true
    })
    super({
      get: db.get.bind(db),
      set: db.put.bind(db)
    })
  }
}

FsCache.from = f => new FsCache(null, f)

export default FsCache
