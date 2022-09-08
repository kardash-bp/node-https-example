const express = require('express')
const { default: helmet } = require('helmet')
const cors = require('cors')
const morgan = require('morgan')
const app = express()
app.use(helmet())
app.use(cors())
app.use(morgan('short'))
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.send('unprotected')
})
app.get('/login', (req, res) => {
  res.send('login')
})
app.get('/secret', (req, res) => {
  res.send('Secret value is 42')
})
module.exports = app
