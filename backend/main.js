const express = require('express')
const bodyParser = require('body-parser')
const handleFile = require('./handleFile.js')
const cors = require('cors')
const app = express()

// middleware
app.use(bodyParser.json({ limit: '99999mb' }))
app.use(bodyParser.urlencoded({ limit: '99999mb', extended: false }))
app.use(cors())

app.post('/upload', (req, res) => {
  const file = req.body
  console.log(file.path)
  
  handleFile(file)
    .then(() => {
      res.send('Upload successful!')
      res.end()
    })
    .catch(e => console.log(e))
})

const port = process.env.PORT || 8080
app.listen(port, () => {
  console.log('listening on ' + port)
})