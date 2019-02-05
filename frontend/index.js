const dropArea = document.querySelector('#drop-area')

;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  dropArea.addEventListener(eventName, preventDefaults, false)
})

function preventDefaults(e) {
  e.preventDefault()
  e.stopPropagation()
}

;['dragenter', 'dragover'].forEach(eventName => {
  dropArea.addEventListener(eventName, highlight, false)
})

;['dragleave', 'drop'].forEach(eventName => {
  dropArea.addEventListener(eventName, unhighlight, false)
})

function highlight(e) {
  dropArea.classList.add('highlight')
}

function unhighlight(e) {
  dropArea.classList.remove('highlight')
}

// Drop handler function to get all files
async function getAllFileEntries(dataTransferItemList) {
  let fileEntries = [];
  // Use BFS to traverse entire directory/file structure
  let queue = [];
  // Unfortunately dataTransferItemList is not iterable i.e. no forEach
  for (let i = 0; i < dataTransferItemList.length; i++) {
    queue.push(dataTransferItemList[i].webkitGetAsEntry());
  }
  while (queue.length > 0) {
    let entry = queue.shift();
    if (entry.isFile) {
      fileEntries.push(entry);
    } else if (entry.isDirectory) {
      let reader = entry.createReader();
      queue.push(...await readAllDirectoryEntries(reader));
    }
  }
  return fileEntries;
}

// Get all the entries (files or sub-directories) in a directory by calling readEntries until it returns empty array
async function readAllDirectoryEntries(directoryReader) {
  let entries = [];
  let readEntries = await readEntriesPromise(directoryReader);
  while (readEntries.length > 0) {
    entries.push(...readEntries);
    readEntries = await readEntriesPromise(directoryReader);
  }
  return entries;
}

// Wrap readEntries in a promise to make working with readEntries easier
async function readEntriesPromise(directoryReader) {
  try {
    return await new Promise((resolve, reject) => {
      directoryReader.readEntries(resolve, reject);
    });
  } catch (err) {
    console.log(err);
  }
}

dropArea.addEventListener('drop', handleDrop, false)
let sending = false
let files = []

async function handleDrop(event) {
  if (sending === true) {
    return;
  }

  sending = true
  document.querySelector('#text').innerText = "Uploading..."
  const items = event.dataTransfer.items
  
  getAllFileEntries(items).then((files) => {
    console.log(files)
    uploadFiles(files)
  })
}

async function convertToFile(fileEntry) {
  try {
    return await new Promise((resolve, reject) => fileEntry.file(resolve, reject))
  } catch (err) {
    console.log(err)
  }
}

async function uploadFiles(filesArray) {
  const promises = filesArray.map(async function(file) {
    const formData = new FormData()
    formData.append("file", await convertToFile(file))
    formData.append("path", file.fullPath)
    return sendFile(formData)
  })

  Promise
    .all(promises)
    .then(() => {
      document.querySelector('#text').innerText = "Finished ✅"
      setTimeout(() => {
        sending = false
        document.querySelector('#text').innerText = "Drop your files here"
      }, 2000)
    })
}

async function sendFile(formData) {
  const url = 'http://localhost:8080/upload'
  const data = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json, text/plain, */*',
    },
    body: formData
  })
  
  const response = await data.text()
  console.log(response)
  return response
}

