const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const handleFile = require("./handleFile.js");

// middleware
app.use(fileUpload({ limits: { fileSize: 99999999999999 } }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/ping", () => res.send("pong!"));

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

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log("listening on " + port);
});
