<template>
    <button @click="generate">Generate Audio</button>
    <button @click="stopAudio">Stop Audio</button>
    <button v-if="isDone" @click="save">Save Audio</button>
    <br/>
    <GenerativeCanvas />
</template>
<script setup lang="ts">
const audioCtx = useState('audioCtx');
const analyser = useState('analyser');
const canvas = useState('canvas')
const isDone = ref(false)
let recorder;
let blob;
let fh;
const timeslice = 1000
const chunks = []
const options = {
      audioBitsPerSecond: 128000,
      videoBitsPerSecond: 2500000,
      mimeType:  "audio/webm;codecs=opus",
};
async function save() {

    const opts = {
                    types: [
                    {
                        description: "White Noise Generator",
                        accept: { "audio/webm": [".webm"] },
                        suggestedName: Date.now()
                    },
                    ],
                };
         fh = await showSaveFilePicker(opts); 
    await writeFile(fh, blob)
}
async function writeFile(fileHandle, contents) {
  // Create a FileSystemWritableFileStream to write to.
  const writable = await fileHandle.createWritable();

  // Write the contents of the file to the stream.
  await writable.write(contents);

  // Close the file and write the contents to disk.
  await writable.close();
}
const stop = () => {
    recorder.stop()
    isDone.value = true
}
const stopAudio = () => {
    const el = document.getElementsByClassName("random-audio")
    console.log(el)
    for(var i = 0; i< el.length; ++i) {
        el[i].pause()
    }
}
const  generate = async () => {
    try {
        const el = document.createElement("audio")
        el.className = "random-audio"
        document.body.appendChild(el)
        isDone.value = false
        const stream = canvas.value.captureStream(30)
        
        const duration = 3000
        const channels = 2
        audioCtx.value = new AudioContext()
        analyser.value = audioCtx.value.createAnalyser();
        const frameCount = audioCtx.value.sampleRate * duration;
        const myArrayBuffer = audioCtx.value.createBuffer(2, frameCount, audioCtx.value.sampleRate);
        for (let channel = 0; channel < channels; channel++) {
            // This gives us the actual ArrayBuffer that contains the data
            const nowBuffering = myArrayBuffer.getChannelData(channel);
            for (let i = 0; i < frameCount; i++) {
            // Math.random() is in [0; 1.0]
            // audio needs to be in [-1.0; 1.0]
            nowBuffering[i] = Math.random() * 2 - 1;
            }
    
            }

            const source = createBufferSource(myArrayBuffer, analyser.value)
            
            // start the source playing
            source.loop = true;
    
            const audioNode = audioCtx.value.createMediaStreamDestination();
            const audioTrack = audioNode.stream.getAudioTracks()[0]
            
            stream.addTrack(audioTrack) 
            
            recorder = new MediaRecorder(audioNode.stream, options)
            recorder.ondataavailable = (e) => {
                chunks.push(e.data);         
            };
            recorder.onstop = async (e) => {
                blob = new File(chunks, 'white-noise',{ type: recorder.mimeType });
               
                console.log("recorder stopped", blob);
                
                };
                el.srcObject = stream
            const audioEl = audioCtx.value.createMediaElementSource(el)
            
            audioEl.connect(audioCtx.value.destination)
            analyser.value.connect(audioNode)
            if ("mediaSession" in navigator) {
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: "White Noise",
                    artist: "Jyrone Parker",
                    album: "Random White Noise",
                    artwork: [
                    {
                        src: "https://dummyimage.com/96x96",
                        sizes: "96x96",
                        type: "image/png",
                    },
                    {
                        src: "https://dummyimage.com/128x128",
                        sizes: "128x128",
                        type: "image/png",
                    },
                    {
                        src: "https://dummyimage.com/192x192",
                        sizes: "192x192",
                        type: "image/png",
                    },
                    {
                        src: "https://dummyimage.com/256x256",
                        sizes: "256x256",
                        type: "image/png",
                    },
                    {
                        src: "https://dummyimage.com/384x384",
                        sizes: "384x384",
                        type: "image/png",
                    },
                    {
                        src: "https://dummyimage.com/512x512",
                        sizes: "512x512",
                        type: "image/png",
                    },
                    ],
                });

                navigator.mediaSession.setActionHandler("play", () => {
                    /* Code excerpted. */
                });
                navigator.mediaSession.setActionHandler("pause", () => {
                    /* Code excerpted. */
                });
                navigator.mediaSession.setActionHandler("stop", () => {
                    /* Code excerpted. */
                });
                navigator.mediaSession.setActionHandler("seekbackward", () => {
                    /* Code excerpted. */
                });
                navigator.mediaSession.setActionHandler("seekforward", () => {
                    /* Code excerpted. */
                });
                navigator.mediaSession.setActionHandler("seekto", () => {
                    /* Code excerpted. */
                });
                navigator.mediaSession.setActionHandler("previoustrack", () => {
                    /* Code excerpted. */
                });
                navigator.mediaSession.setActionHandler("nexttrack", () => {
                    /* Code excerpted. */
                });
                navigator.mediaSession.setActionHandler("skipad", () => {
                    /* Code excerpted. */
                });
                navigator.mediaSession.setActionHandler("togglecamera", () => {
                    /* Code excerpted. */
                });
                navigator.mediaSession.setActionHandler("togglemicrophone", () => {
                    /* Code excerpted. */
                });
                navigator.mediaSession.setActionHandler("hangup", () => {
                    /* Code excerpted. */
                });
            }
            recorder.start();
            source.start();
            el.play();
           
            setTimeout(() => {
                stop()
            }, 30000);
    } catch (error) {
        console.log(error)
    }
}



function createBufferSource(buffer, connect) {
    const source = audioCtx.value.createBufferSource();
            // set the buffer in the AudioBufferSourceNode
            source.buffer = buffer;
            source.loop = true
            // connect the AudioBufferSourceNode to the
            // destination so we can hear the sound
            source.connect(connect);
    return source;
}
</script>