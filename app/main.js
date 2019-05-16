const express = require("express");
const fs = require('fs')
const path = require('path')
const app = express();
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const handleFile = require("./handleFile.js");

// middleware
app.use(fileUpload({ limits: { fileSize: 99999999999999 } }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get("/ping", (req, res) => {
  res.send("pong!");
});

app.post("/upload", (req, res) => {
  let file = req.files.file;
  let path = req.body.path;
  console.log(file);

  handleFile(file, path)
    .then(() => {
      res.send("Upload successful!");
      res.end();
    })
    .catch(console.log);
});

app.get('/files', (req, res) => {
  const read = (dir) =>
    fs.readdirSync(dir)
      .reduce((files, file) =>
        fs.statSync(path.join(dir, file)).isDirectory() ?
          files.concat(read(path.join(dir, file))) :
          files.concat(path.join(dir, file)),
        []);
        
  const tree = read('./uploads')
  res.json(tree)
  res.end()
})

app.delete('/file', (req, res) => {
  let fileName = req.body.name
  try {
    fs.unlinkSync(fileName)
    res.send('Deleted')
  } catch(err) {
    console.error(err)
  }
})

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log("listening on " + port);
});
