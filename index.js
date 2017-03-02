const express = require('express')
const app = express()
const port = process.env.PORT || 8080

app.set('view engine', 'ejs')

// TODO - routes will be in its own file later
// require('./app/routes.js')(app)

app.get('/', (req, res) => {
  res.send('hello world')
})

app.listen(port, () => {
  console.log(`server running on port: ${port}`)
})
