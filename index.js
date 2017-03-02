const express = require('express')
const app = express()
const port = process.env.PORT || 8080

app.set('view engine', 'ejs')

// TODO - routes will be in its own file later
// require('./app/routes.js')(app)

app.get('/', (req, res) => {
  res.render('index.ejs')
})

app.get('/login', (req, res) => {
  res.render('login.ejs')
})

app.get('/signup', (req, res) => {
  res.render('signup.ejs')
})

app.get('/profile', (req, res) => {
  res.render('profile.ejs')
})

app.get('/logout', (req, res) => {
  // req.logout()  // TODO - implement this later
  res.redirect('/')
})

app.listen(port, () => {
  console.log(`server running on port: ${port}`)
})
