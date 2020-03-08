const httpProxy = require('http-proxy')
const textBody = require('body')
const Cache = require('./cache')
const FsCache = require('./fsCache')
function proxy (target, options = {}) {
  const cache = options.fname ? FsCache.from(options.fname) : new Cache()
  const proxy = httpProxy.createProxyServer({})
  proxy.on('proxyRes', (proxyRes, req) => textBody(proxyRes, (e, body) => {
    proxyRes.body = body
    options.log && options.log('target it', req.url, cache.id(req))
    cache.set(req, proxyRes)
    cache.save()
  }))
  proxy.on('error', (e, req, res) => console.log(e))
  return (req, res) => textBody(req, (e, body) => {
    req.body = body
    const cRes = cache.get(req)
    if (cRes) {
      options.log && options.log('from cache', req.url, cache.id(req))
      return res.writeHead(cRes.statusCode, cRes.headers).end(cRes.body)
    }
    return proxy.web(req, res, { target })
  })
}

module.exports = {
  proxy
}
