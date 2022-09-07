const fs = require('fs')
const https = require('https')
const app = require('./app')

const PORT = 5000

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
}

const server = https.createServer(options, app)

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`)
})
