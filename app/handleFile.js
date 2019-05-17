const fs = require("fs")
const path = require('path')
const promiseFS = require('fs').promises
const mkdirp = require("mkdirp")

function getFileDirectory(path) {
  const directory = path.split("/")
  directory.splice(-1,1)
  return directory.join("/")
}

async function checkIfDirectoryExists(dirPath) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(dirPath)){
      mkdirp.sync(dirPath, (err) => {
        if (err) reject(err)
        console.log("Created directory: " + dirPath)
        resolve(dirPath)
      })

      resolve(dirPath)
    }
  })
}

function createFile(file, path) { 
  if (file) {
    file.mv("./uploads/" + path, (err) => {
      if (err) console.log(err)
      console.log("created file: " + path)
    })
  } else {
    // create empty file
    fs.writeFile("./uploads/" + path, " ", (err) => {
      if (err) throw err
      console.log("create empty file: " + path)
    })
  }
}

function handleFile(file, path) {
  const uploadDir = __dirname + "/uploads"
  const dirPath = getFileDirectory(uploadDir + path)

  return new Promise((resolve, reject) => {
    checkIfDirectoryExists(dirPath)
      .then(resolve(createFile(file, path)))
      .catch(e => reject(e))
  })
}

async function getAllFiles(dir, filelist = [], depth=0) {
  const files = await promiseFS.readdir(dir);

  for (file of files) {
    const filepath = path.join(dir, file);
    const stat = await promiseFS.stat(filepath);

    if (stat.isDirectory()) {
      filelist.push({ 
        'type': 'directory', 
        'depth': depth,
        'name': filepath.replace('uploads/', '') // directory
      })
      depth++
      filelist = await getAllFiles(filepath, filelist, depth);
    } else {
      filelist.push({
        'type': 'file',
        'depth': depth,
        'name': filepath.replace('uploads/', '')
      })
    }
  }
  return filelist;
}

module.exports = {
  handleFile,
  getAllFiles
}