// Get handle to draft file
const root = await navigator.storage.getDirectory();
const fileName = new Date().toJSON()+'-white-noise.webm';
const draftHandle = await root.getFileHandle(fileName, { create: true });
// Get sync access handle
const accessHandle = await draftHandle.createSyncAccessHandle();

// …

onmessage = async (e) => {
    // Retrieve message sent to work from main script
    const message = e.data;
    switch(message.type) {
        case 'append':
            accessHandle.write(message.data);
            accessHandle.flush();
            break;
        case 'close':
            accessHandle.close()
            break;
        case 'download':
            navigator.serviceWorker.ready.then(async (swReg) => {
                const file = await draftHandle.getFile()
                const bgFetch = await swReg.backgroundFetch.fetch(
                  fileName,
                  [URL.createObjectURL(file)],
                  {
                    title: "White Noise",
                    icons: [
                      {
                        sizes: "300x300",
                        src: "/favicon.svg",
                        type: "image/svg",
                      },
                    ],
                    downloadTotal: file.size,
                  },
                );
              });
              break;
              // Always close FileSystemSyncAccessHandle if done.
    accessHandle.close();
    }
    
    
  };
  