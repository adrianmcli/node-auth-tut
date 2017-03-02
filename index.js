const express = require('express')
const app = express()
const port = process.env.PORT || 8080

app.set('view engine', 'ejs')

// TODO - routes will be in its own file later
// require('./app/routes.js')(app)

app.get('/', (req, res) => {
  res.send('hello world')
})

app.get('/login', (req, res) => {
  res.send('login page')
})

app.get('/signup', (req, res) => {
  res.send('signup page')
})

app.get('/profile', (req, res) => {
  res.send('profile page')
})

app.get('/logout', (req, res) => {
  // req.logout()  // TODO - implement this later
  res.redirect('/')
})

app.listen(port, () => {
  console.log(`server running on port: ${port}`)
})
