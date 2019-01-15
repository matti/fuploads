const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const handleFile = require('./handleFile.js')

function handleError(error) {
  console.log(error)
  process.exit(0)
}

// middleware
app.use(fileUpload())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

app.post('/upload', (req, res) => {
  let file = req.files.file
  let path = req.body.path
  console.log(file)

  handleFile(file, path)
    .then(() => {
      res.send('Upload successful!')
      res.end()
    })
    .catch(e => handleError)
})

const port = process.env.PORT || 8080
app.listen(port, () => {
  console.log('listening on ' + port)
})
