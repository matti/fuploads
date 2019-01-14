const fs = require('fs')
const mkdirp = require('mkdirp')

function getFileDirectory(path) {
  const directory = path.split('/')
  directory.splice(-1,1)
  return directory.join('/')
}

async function checkIfDirectoryExists(dirPath) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(dirPath)){
      mkdirp.sync(dirPath, (err) => {
        if (err) reject(err)
        console.log('Created directory: ' + dirPath)
        resolve(dirPath)
      })

      resolve(dirPath)
    }
  })
}

function createFile(file, path) {  
  file.mv('./uploads/' + path, (err) => {
    if (err) console.log(err)
    
    console.log("created file: " + path)
  })
  // fs.appendFile(uploadDir + path, contents, (err) => {
  //   if (err) throw err
  //   console.log('Created file: ' + path)
  // })
}

function handleFile(file, path) {
  const uploadDir = __dirname + '/uploads'
  const dirPath = getFileDirectory(uploadDir + path)

  return new Promise((resolve, reject) => {
    checkIfDirectoryExists(dirPath)
      .then(resolve(createFile(file, path)))
      .catch(e => reject(e))
  })
  // const { contents, path } = file
  // const uploadDir = __dirname + '/uploads'
  // const dirPath = getFileDirectory(uploadDir + path)

  // return new Promise((resolve, reject) => {
  //   checkIfDirectoryExists(dirPath)
  //     .then(resolve(createFile(uploadDir, path, contents)))
  //     .catch(e => reject(e))
  // })
}

module.exports = handleFile 