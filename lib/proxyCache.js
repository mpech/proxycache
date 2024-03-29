import httpProxy from 'http-proxy'
import Cache from './cache.js'
import FsCache from './fsCache.js'
import through2 from 'through2'

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
  const proxy = httpProxy.createProxyServer({ secure: options.secure })
  proxy.on('proxyRes', (proxyRes, req, res) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers)
    const { stream, buffers } = streambufs(proxyRes)
    const reqId = cache.id(req)
    stream.on('end', () => {
      options.log && options.log('target it', req.url.substring(0, 100) + '...', reqId)
      cache.set(reqId, { statusCode: proxyRes.statusCode, headers: proxyRes.headers, body: Buffer.concat(buffers) })
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
      const reqId = cache.id(req)
      const cRes = cache.get(reqId)
      if (cRes) {
        options.log && options.log('from cache', req.url.substring(0, 100) + '...', cache.id(req))
        cRes.headers['x-proxied'] = 'proxycache'
        res.writeHead(cRes.statusCode, cRes.headers)
        res.write(cRes.body)
        return res.end()
      }
      return proxy.web(req, res, { target, buffer: stream, selfHandleResponse: true })
    })
  }
}

export default proxy
