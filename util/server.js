const http = require('http')
http.createServer(function (req, res) {
  res.end('ok')
}).listen(3005)
console.log('listening to 3005')
