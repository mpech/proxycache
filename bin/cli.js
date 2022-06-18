#!/usr/bin/env node
import http from 'http'
import proxy from '../index.js'
import path from 'path'
import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const argv = yargs(hideBin(process.argv))
  .command('proxyCache Usage: $0 -m mapping [-m mapping]... [-v]', 'listen to local url and forward to remote')
  .demand(['m'])
  .options('m', {
    alias: 'mapping',
    describe: 'mapping of the form port->target. e.g 3004->http://127.0.0.1:3005'
  })
  .options('v', {
    alias: 'verbose',
    describe: 'log cache hit, target hit'
  })
  .options('s', {
    alias: 'secure',
    describe: 'rejectUnauthorized (ignore invalid certs name)',
    default: false
  })
  .parse()

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
    http.createServer(proxy(to, { secure: !!argv.secure, log, fname: path.join(__dirname, '../cache-lmdb') })).listen(port)
  })
