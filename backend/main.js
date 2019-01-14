const express = require('express')
const bodyParser = require('body-parser')
const handleFile = require('./handleFile.js')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const app = express()

// middleware
app.use(fileUpload())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

app.post('/upload', (req, res) => {
  if (Object.keys(req.files).length == 0) {
    return res.status(400).send('Empty payload of files.')
  }

  let file = req.files.file
  let path = req.body.path
  console.log(file)

  handleFile(file, path)
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