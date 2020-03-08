#!/usr/bin/nodejs
const http = require('http')
const { proxy } = require('../')
const argv = require('optimist')
  .usage('Usage: $0 -m mapping [-m mapping]... [-v]')
  .demand(['m'])
  .options('m', {
    alias: 'mapping',
    describe: 'mapping of the form port->target. e.g 3004->http://127.0.0.1:3005'
  })
  .options('v', {
    alias: 'verbose',
    describe: 'log cache hit, target hit'
  })
  .argv

const log = argv.verbose ? console.log.bind(console) : false
;[argv.mapping]
  .flat()
  .map(x => x.split('->').map(y => y.trim()))
  .forEach(([port, to], i) => {
    if (!port) {
      throw new Error('invalid port', port)
    }
    if (!to) {
      throw new Error('invalid target', to)
    }
    console.log('forwarding', port, '->', to)
    http.createServer(proxy(to, { log, fname: './cache.json' })).listen(port)
  })
