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

dropArea.addEventListener('drop', handleDrop, false)
let files = []

function handleDrop(event) {
  files = []
  const items = event.dataTransfer.items

  for (let i = 0; i < items.length; i++) {
    let item = items[i].webkitGetAsEntry()
    if (item) {
      traverseFileTree(item)
    }
  }

  const timeout = setInterval(() => {
    if (files.length >= 1) {
      const filteredFiles = files.filter(file => !file.name.includes(".DS_Store"))
      uploadFiles(filteredFiles)
      clearInterval(timeout)
    }
  }, 200)
}

function traverseFileTree(item, path) {
  path = path || ""
  if (item.isFile) {
    files.push(item)
  } else if (item.isDirectory) {
    let dirReader = item.createReader()
    dirReader.readEntries(entries => {
      for (let i = 0; i < entries.length; i++) {
        traverseFileTree(entries[i], path + item.name + "/")
      }
    })
  }
}

function getContents(fileEntry) {
  const reader = new FileReader()
  
  return new Promise((resolve, reject) => {
    reader.onload = event => resolve(event.target.result)
    reader.onerror = error => reject(error)
    fileEntry.file(file => reader.readAsText(file))
  })
}

async function uploadFiles(filesArray) {
  for(const file of filesArray) {
    await sendFile({
      "contents": await getContents(file),
      "path": file.fullPath
    })

    delete file
  }
}

async function sendFile(file) {
  console.log(file.path)
  const url = 'http://localhost:8080/upload'
  const data = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(file)
  })

  files = []
  const response = await data.text()
  console.log(response)
  return response
}

