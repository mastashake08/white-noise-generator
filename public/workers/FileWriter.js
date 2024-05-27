// Get handle to draft file

const fileName = new Date().toJSON()+'-white-noise.webm';
let root, draftHandle, accessHandle;
// …

onmessage =  async(e) => {
    // Retrieve message sent to work from main script
    const message = e.data;
    switch(message.type) {
        case 'append':
          root = await navigator.storage.getDirectory();
          draftHandle = await root.getFileHandle(fileName, { create: true });
// Get sync access handle
            accessHandle = await draftHandle.createSyncAccessHandle();
            accessHandle.write(message.data);
            accessHandle.close();
            console.log('appends')
            break;
        case 'download':
         const file = await draftHandle.getFile()
          const url = URL.createObjectURL(file);
          console.log(url)
          break;
    }
    
    
  };
  