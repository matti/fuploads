self.addEventListener("message", handleMessage, false);

async function handleMessage({ data }) {
  while (data.length !== 0) {
    try {
      let file = data.shift();
      let formData = createFormData(file);
      await sendFile(formData);
    } catch (e) {
      console.error(e);
    }

    // all files have been sent
    if (data.length === 0) {
      self.postMessage("done");
    }
  }
}

function createFormData(file) {
  const form = new FormData();
  form.append("file", file.file);
  form.append("path", file.path);
  return form;
}

async function sendFile(formData) {
  const url = "/upload";
  const data = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json, text/plain, */*"
    },
    body: formData
  });

  const response = await data.text();
  return await response;
}
