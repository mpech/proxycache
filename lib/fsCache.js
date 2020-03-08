const fs = require('fs')
const Cache = require('./cache')
class FsCache extends Cache {
  constructor (m, fname) {
    super(m)
    this.fname = fname
  }

  async save () {
    return fs.promises.writeFile(this.fname, JSON.stringify([...this.m.entries()]))
  }
}
FsCache.from = f => new FsCache(new Map((fs.existsSync(f) && require(f)) || []), f)
module.exports = FsCache
