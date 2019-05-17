async function getFileTree() {
  const url = '/files'
  const request = await fetch(url)
  const json = await request.json()
  return json
}

async function deleteFile(e) {
  const fileName = e.target.parentElement.getAttribute('data-name');
  fetch("/file", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json, text/plain, */*"
    },
    body: JSON.stringify({
      name: fileName
    })
  })
    .then(createTreeView)
}


async function createTreeView() {
  const fileTree = await getFileTree()
  const fileList = document.querySelector('#file-structure')
  const indent = (depth) => (depth * 10).toString() + 'px'
  const listElems = fileTree.map(obj => {
    return `
      <li data-name="${obj.name}" 
          style="text-indent: ${indent(obj.depth)};
          font-weight: ${obj.type == 'directory' ? 'bold' : 'normal'}"
      >
        <span class="filename">${obj.name}</span>
        <span class="delete">❌</span>
      </li>`
  })
  fileList.innerHTML = `<ul>${listElems.join('')}</ul>`

  const deleteButtons = document.querySelectorAll('.delete')
  deleteButtons.forEach(button => button.addEventListener('click', deleteFile))
}

window.onload = createTreeView()
window.addEventListener('fileupload', createTreeView)