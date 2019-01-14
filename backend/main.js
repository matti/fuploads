const express = require('express')
const bodyParser = require('body-parser')
const handleFile = require('./handleFile.js')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const app = express()
const cluster = require("cluster")

// middleware
app.use(fileUpload())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

const numCPUs = require('os').cpus().length

if (cluster.isMaster) {

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork()
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log('worker ' + worker.process.pid + ' died')
  })

} else {
  app.post('/upload', (req, res) => {
    if (Object.keys(req.files).length == 0) {
      return res.status(200)
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
}