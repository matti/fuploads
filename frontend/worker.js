self.addEventListener("message", async ({ data }) => {
  console.log(data)

  while(data.length !== 0) {
    let file = data.shift()
    try {
      await sendFile(createFormData(file))
    } catch (e) {
      console.error(e)
    } 

    if (data.length === 0) {
      self.postMessage("done")
    }
  }
  // Promise.all(data.map(async (file) => await sendFile(createFormData(data))))
}, false)

function createFormData(file) {
  const form = new FormData()
  form.append("file", file.file)
  form.append("path", file.path)
  return form
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
  return await response
}
