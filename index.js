const express = require('express')
const app = express()
const port = process.env.PORT || 8080

app.set('view engine', 'ejs')

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

userSchema.methods.validPassword = password =>
  bcrypt.compareSync(password, this.local.password)

// expose the model for usage
const User = mongoose.model('User', userSchema)

// connect to the DB
mongoose.connect(dbConfig.url)

// EXAMPLE:
// const testUser = new User({
//   local: {
//     email: 'hi@example.com',
//     password: 'mysecret',
//   },
// })

// testUser.save((err) => {
//   if (err) throw err
//   console.log('testUser saved successfully!')
// })



// TODO - routes will be in its own file later
// require('./app/routes.js')(app)

// temp route middleware to ensure authenticated users only
const isLoggedIn = (req, res, next) => false ? next() : res.redirect('/')

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
  res.render('profile.ejs')
})

app.get('/logout', (req, res) => {
  // req.logout()  // TODO - implement this later
  res.redirect('/')
})

app.listen(port, () => {
  console.log(`server running on port: ${port}`)
})
