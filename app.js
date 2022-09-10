const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const passport = require('passport')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const { default: helmet } = require('helmet')
const GoogleStrategy = require('passport-google-oauth20').Strategy
require('dotenv').config()

const app = express()

app.use(helmet())
app.use(cors())
app.use(morgan('short'))
app.use(express.static('public'))

app.use(
  session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
  })
)
app.use(cookieParser())

app.use(passport.initialize())
app.use(passport.session())

const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET

const authUser = function (request, accessToken, refreshToken, user, cb) {
  return cb(null, user)
}
passport.use(
  new GoogleStrategy(
    {
      clientID: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
      passReqToCallback: true,
    },
    authUser
  )
)
//Save session to the cookie
passport.serializeUser((user, done) => {
  // The USER object is the "authenticated user" from the done() in authUser function.
  // serializeUser() will attach this user to "req.session.passport.user.{user}", so that it is tied to the session object for each session.
  console.log(`\n--------> Serialize User:`)
  console.log(user)
  done(null, user.id)
})
//Read the session from the cookie
passport.deserializeUser((obj, done) => {
  // This is the {user} that was saved in req.session.passport.user.{user} in the serializationUser()
  // deserializeUser will attach this {user} to the "req.user.{user}", so that it can be used anywhere in the App.
  console.log('\n--------- Deserialized User:')
  console.log(obj)
  done(null, obj)
})

function checkLoggedIn(req, res, next) {
  console.log(`Current user is: ${req.user}`)
  const isLogged = req.isAuthenticated()
  if (!isLogged) {
    return res.status(401).json({
      error: 'You must log in!',
    })
  }
  next()
}
app.get('/auth/google', passport.authenticate('google', { scope: ['email'] }))
app.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/',
    successRedirect: '/secret',
  })
)
app.get('/auth/logout', (req, res) => {
  req.logOut(function (err) {
    if (err) {
      return res.status(400).json({ error: err.message })
    }
    console.log(`-------> User Logged out`)
    res.redirect('/')
  })
})
app.get('/', (req, res) => {
  res.send('home')
})

app.get('/secret', checkLoggedIn, (req, res) => {
  console.log(req.session.passport.user)
  res.send('Secret value is 42 ')
})
app.get('/test', checkLoggedIn, (req, res) => {
  console.log(req.user)

  res.send('Secret value is 42 :TEST PAGE')
})
module.exports = app
