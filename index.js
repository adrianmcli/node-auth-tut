const express = require('express')
const app = express()
const port = process.env.PORT || 8080

/*
 * 0. MISCELLANEOUS SETUP
 */

// Setup EJS view template engine
app.set('view engine', 'ejs')

// Setup logging
const morgan = require('morgan')
app.use(morgan('dev'))

// Setup the cookie and body parser
const cookieParser = require('cookie-parser') // read cookies (for auth)
const bodyParser = require('body-parser')     // parse post requests
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }))

// Setup session (and the session secret)
const session = require('express-session')
app.use(session({
  secret: 'thisismysecret',
  resave: false,
  saveUninitialized: false,
}))

/*
 * 1. DATABASE SETUP
 */

const mongoose = require('mongoose')
mongoose.Promise = global.Promise  // use native promises
const dbConfig = {
  url: 'mongodb://127.0.0.1:27017/node-auth-tut',
}

const bcrypt = require('bcryptjs')
const userSchema = mongoose.Schema({
  local: {
    email: String,
    password: String,
  },
})

// attach hashgen and password validator methods
userSchema.methods.generateHash = password =>
  bcrypt.hashSync(password, bcrypt.genSaltSync(8), null)

userSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.local.password)
}

// expose the model for usage
const User = mongoose.model('User', userSchema)

// connect to the DB
mongoose.connect(dbConfig.url)

/*
 * 2. PASSPORT SETUP
 */

const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

// Methods for serializing/deserializing user to the session
// a. pick out user id to be used for serialization
// b. when given the user id, grab user object from database
passport.serializeUser((user, done) => done(null, user.id))
passport.deserializeUser((id, done) =>
  User.findOne({ _id: id }, (err, user) => done(err, user)))

// Given the email/password, decide what to do
// a. wrap mongo operation in process.nextTick() because
//    mongo is async, but node cannot wait for it
// b. in Mongo, we try to find the user, if it doesn't exist
//    then we create a new user
const signupHandler = (req, email, password, done) => {
  process.nextTick(() => {
    User.findOne({ 'local.email': email }, (err, user) => {
      if (err) {
        console.log(err)
        return done(err)
      }
      if (user) {
        console.log('User already exists!')
        return done(null, false)
      }

      const newUser = new User()
      newUser.local.email = email
      newUser.local.password = newUser.generateHash(password)

      return newUser.save((saveError) => {
        if (saveError) throw saveError
        return done(null, newUser)
      })
    })
  })
}

const loginHandler = (req, email, password, done) => {
  User.findOne({ 'local.email': email }, (err, user) => {
    if (err) {
      console.log(err)
      return done(err)
    }
    if (!user) {
      console.log('User not found!')
      return done(null, false)
    }
    if (!user.validPassword(password)) {
      console.log('Invalid passowrd!')
      return done(null, false)
    }
    // all good, return the user object
    return done(null, user)
  })
}

// Build and use the "local-signup" strategy
const localSignupOptions = {
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true,
}
passport.use('local-signup', new LocalStrategy(localSignupOptions, signupHandler))

// Build and use the "local-login" strategy
const localLoginOptions = {
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true,
}
passport.use('local-login', new LocalStrategy(localLoginOptions, loginHandler))

// Initialize passport
app.use(passport.initialize())
app.use(passport.session())

/*
 * 2. ROUTES SETUP
 */

// Route middleware/helper to ensure authenticated users only
const isLoggedIn = (req, res, next) => req.isAuthenticated() ? next() : res.redirect('/')

// GET Routes

app.get('/', (req, res) => {
  res.render('index.ejs')
})

app.get('/login', (req, res) => {
  res.render('login.ejs')
})

app.get('/signup', (req, res) => {
  res.render('signup.ejs')
})

app.get('/profile', isLoggedIn, (req, res) => {
  res.render('profile.ejs', { user: req.user })
})

app.get('/logout', (req, res) => {
  // req.logout()  // TODO - implement this later
  res.redirect('/')
})

// POST Routes

// authenticate with the local-signup strategy declared above
app.post('/signup', passport.authenticate('local-signup', {
  successRedirect: '/profile',
  failureRedirect: '/signup',
}))

app.post('/login', passport.authenticate('local-login', {
  successRedirect: '/profile',
  failureRedirect: '/login',
}))

/*
 * 3. START THE SERVER
 */

app.listen(port, () => {
  console.log(`server running on port: ${port}`)
})
