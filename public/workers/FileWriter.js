// Get handle to draft file

const fileName = 'white-noise.webm';

// …
async function writeFile(fileHandle, contents) {
  // Create a FileSystemWritableFileStream to write to.
  const writable = await fileHandle.createWritable({
    keepExistingData: true
  });

  // Write the contents of the file to the stream.
  await writable.write(contents);
  console.log(writable)
  // Close the file and write the contents to disk.
  await writable.close();
}

async function setHandles () {
  let root, draftHandle;
  root = await navigator.storage.getDirectory();
    draftHandle = await root.getFileHandle(fileName, { create: true });
    // Get sync access handle
   
    return {draftHandle}
}
onmessage =  async(e) => {
    // Retrieve message sent to work from main script
    const message = e.data; 
    console.log(message)
    const {draftHandle} = await setHandles()   
    switch(message.type) {
        case 'append':
             
       
            writeFile(draftHandle, message.data);
            
            break;
        case 'download':

         
          const file = await draftHandle.getFile();
          console.log(file)
          const buff = await file.arrayBuffer()
          self.postMessage(buff,[buff]);
          break;
    }
    
    
  };
  