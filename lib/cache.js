const crypto = require('crypto')
class Cache {
  constructor (m = new Map()) {
    this.m = m
  }

  id ({ url, headers, body }) {
    const s = JSON.stringify({ url, headers, body })
    const hash = crypto.createHash('md5').update(s).digest('hex')
    return hash
  }

  get (req) {
    return this.m.get(this.id(req))
  }

  set (req, { statusCode, headers, body }) {
    return this.m.set(this.id(req), { statusCode, headers, body })
  }

  async save () {}
}
module.exports = Cache
