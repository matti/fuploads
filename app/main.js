const express = require("express");
const app = express();
const del = require('del');
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const { 
  handleFile, 
  getAllFiles
} = require("./handleFile.js");

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
  getAllFiles('uploads')
    .then(files => res.json(files))
    .catch(console.log)
})

app.delete('/file', async (req, res) => {
  let folderOrFileName = './uploads/' + req.body.name
  const deletedPaths = await del([folderOrFileName]);
  res.send('Deleted')
})

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log("listening on " + port);
});
