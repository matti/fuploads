const dropArea = document.querySelector("#drop-area");

["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
  dropArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

["dragenter", "dragover"].forEach(eventName => {
  dropArea.addEventListener(eventName, highlight, false);
});
["dragleave", "drop"].forEach(eventName => {
  dropArea.addEventListener(eventName, unhighlight, false);
});

function highlight() {
  dropArea.classList.add("highlight");
}

function unhighlight() {
  dropArea.classList.remove("highlight");
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
      queue.push(...(await readAllDirectoryEntries(reader)));
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

dropArea.addEventListener("drop", handleDrop, false);
let sending = false;

async function handleDrop(event) {
  if (sending === true) {
    return;
  }

  sending = true;
  document.querySelector("#text").innerText = "Uploading...";
  const items = event.dataTransfer.items;

  getAllFileEntries(items)
    .then(files => uploadFiles(files))
}

async function convertToFile(fileEntry) {
  try {
    return await new Promise((resolve, reject) =>
      fileEntry.file(resolve, reject)
    );
  } catch (err) {
    console.log(err);
  }
}

function requestsFinished() {
  document.querySelector("#text").innerText = "Finished ✅";
  setTimeout(() => {
    sending = false;
    document.querySelector("#text").innerText = "Drop your files here";
  }, 2000);
}

function chunkArray(myArray, chunk_size) {
  let results = [];
  let len = Math.ceil(myArray.length / chunk_size);

  while (myArray.length) {
    results.push(myArray.splice(0, len));
  }

  return results;
}

function computeNumberOfWorkers(numberOfFiles) {
  return Math.round(0.01 * numberOfFiles + 1);
}

async function uploadFiles(filesArray) {
  let requestDoneCounter = 0;

  if (typeof Worker !== undefined) {
    let workers = Array(computeNumberOfWorkers(filesArray.length)).fill(
      new Worker("worker.js")
    );

    console.log(filesArray.length + " files uploading.");
    console.log(workers.length + " active workers.");

    Promise.all(
      filesArray.map(async fileEntry => {
        return {
          file: await convertToFile(fileEntry),
          path: fileEntry.fullPath
        };
      })
    )
      .then(files => {
        let currentWorkerIndex = 0;
        chunkArray(files, workers.length).forEach(chunk => {
          workers[currentWorkerIndex].postMessage(chunk);
          currentWorkerIndex++;
        });
      })
      .catch(console.log);

    workers.forEach(worker => {
      worker.onmessage = function(msg) {
        if (msg.data === "done") {
          requestDoneCounter++;

          if (requestDoneCounter == workers.length) {
            workers.forEach(worker => worker.terminate());
            requestsFinished();
            requestDoneCounter = 0;

            // let file tree know when to recreate new structure 
            const fileUploadEvent = new CustomEvent("fileupload")
            window.dispatchEvent(fileUploadEvent);
          }
        }
      };

      worker.onerror = console.log;
    });
  }
}
