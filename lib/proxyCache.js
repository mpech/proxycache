const httpProxy = require('http-proxy')
const Cache = require('./cache')
const FsCache = require('./fsCache')
const through2 = require('through2')
const streambufs = readable => {
  const buffers = []
  const stream = readable.pipe(through2(function (chunk, enc, cb) {
    buffers.push(chunk)
    this.push(chunk)
    cb()
  }))
  return { stream, buffers }
}
function proxy (target, options = {}) {
  const cache = options.fname ? FsCache.from(options.fname) : new Cache()
  const proxy = httpProxy.createProxyServer({})
  proxy.on('proxyRes', (proxyRes, req, res) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers)
    const { stream, buffers } = streambufs(proxyRes)
    stream.on('end', () => {
      proxyRes.body = Buffer.concat(buffers)
      options.log && options.log('target it', req.url, cache.id(req), cache.idRes(proxyRes))
      cache.set(req, proxyRes)
      cache.save()
    })
    stream.pipe(res)
  })
  proxy.on('error', (e, req, res) => {
    res.statusCode = 500
    return res.end(e.message)
  })
  return (req, res) => {
    const { stream, buffers } = streambufs(req)
    req.on('end', _ => {
      req.body = Buffer.concat(buffers)
      const cRes = cache.get(req)
      if (cRes) {
        options.log && options.log('from cache', req.url, cache.id(req))
        res.writeHead(cRes.statusCode, cRes.headers)
        res.write(cRes.body)
        return res.end()
      }
      return proxy.web(req, res, { target, buffer: stream, selfHandleResponse: true })
    })
  }
}

module.exports = {
  proxy
}
