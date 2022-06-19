import hasher from 'node-object-hash'

const ignoreList = new Set(['cookie', 'if-none-match'])

class Cache {
  constructor (m = new Map(), { ignoreHeaderList = ignoreList } = {}) {
    this.m = m
    this.ignoreHeaderList = ignoreHeaderList
    this.hash = hasher({ alg: 'md4' }).hash
  }

  id ({ url, headers, body }) {
    const v = [url, body]
    for (const k in headers) {
      if (this.ignoreHeaderList.has(k)) continue
      v.push(k, headers[k])
    }
    return this.hash(v)
  }

  get (id) {
    return this.m.get(id)
  }

  set (id, obj) {
    return this.m.set(id, obj)
  }

  async save () {}
}
export default Cache
