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
    const o = this.m.get(this.id(req))
    if (!o) return o
    o.body = Buffer.from(o.body, 'base64')
    return o
  }

  set (req, { statusCode, headers, body = '' }) {
    const b64body = body.toString('base64')
    return this.m.set(this.id(req), { statusCode, headers, body: b64body })
  }

  idRes ({ statusCode, headers, body }) {
    const s = JSON.stringify({ statusCode, headers, body })
    const hash = crypto.createHash('md5').update(s).digest('hex')
    return hash
  }

  async save () {}
}
module.exports = Cache
