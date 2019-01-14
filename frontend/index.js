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

async function traverseFileTree(item, path) {
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

async function convertToFile(fileEntry) {
  try {
    return await new Promise((resolve, reject) => fileEntry.file(resolve, reject))
  } catch (err) {
    console.log(err)
  }
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

async function uploadFiles(filesArray) {
  console.log(filesArray)
  for(const file of filesArray) {
    const formData = new FormData();
    formData.append("file", await convertToFile(file))
    formData.append("path", file.fullPath)
    await sendFile(formData)
  }
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

  files = []
  const response = await data.text()
  console.log(response)
  return response
}

