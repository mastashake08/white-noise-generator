<template>
    <div class="container mx-auto">
        <div class="items-center text-center" id="buttons">
            <button class="rounded-md bg-blue-500 px-5 my-2" v-if="!isPlaying" @click="generate">Generate Audio</button>
            <button class="rounded-md bg-red-500 px-5 my-2" v-else @click="stopAudio">Stop Audio</button>
        </div>
        <GenerativeCanvas class="mx-auto"/>
    </div>
   
</template>
<script setup lang="ts">
const audioCtx = useState('audioCtx');
const analyser = useState('analyser');
const canvas = useState('canvas')
const isDone = ref(false)
const isPlaying = ref(false)
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
                        suggestedName: Date.now()+'.webm'
                    },
                    ],
                };
         //fh = await showSaveFilePicker(opts); 
    //await writeFile(fh, blob)
}
function interleave (inputL, inputR) {
  var length = inputL.length + inputR.length
  var result = new Float32Array(length)

  var index = 0
  var inputIndex = 0

  while (index < length) {
    result[index++] = inputL[inputIndex]
    result[index++] = inputR[inputIndex]
    inputIndex++
  }
  return result
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
        isPlaying.value = false
    }
    stop()
}
const  generate = async () => {
    try {
        const el = document.createElement("audio")
        el.className = "random-audio"
        const btns = document.getElementById('buttons')
        btns.appendChild(el)
        isDone.value = false
        const stream = canvas.value.captureStream(30)
        
        const duration = 600
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
            console.log(myArrayBuffer)
            console.log([myArrayBuffer.getChannelData(0),myArrayBuffer.getChannelData(1)])
            const source = createBufferSource(myArrayBuffer, analyser.value)
            // const inter = interleave(myArrayBuffer.getChannelData(0),myArrayBuffer.getChannelData(1))
            // console.log(inter)
            blob = new Blob([myArrayBuffer.getChannelData(0),myArrayBuffer.getChannelData(1)],{ type: 'audio/webm' });
            console.log(await blob.arrayBuffer())
            // start the source playing
            source.loop = true;
    
            const audioNode = audioCtx.value.createMediaStreamDestination();
            const audioTrack = audioNode.stream.getAudioTracks()[0]
            
            stream.addTrack(audioTrack) 
            
            // recorder = new MediaRecorder(audioNode.stream, options)
            // recorder.ondataavailable = (e) => {
            //     chunks.push(e.data);         
            // };
            // recorder.onstop = async (e) => {
            //     blob = new File(chunks, 'white-noise',{ type: recorder.mimeType });
               
            //     console.log("recorder stopped", blob);
                
            //     };
                el.srcObject = stream
            const audioEl = audioCtx.value.createMediaElementSource(el)
            
            audioEl.connect(audioCtx.value.destination)
            analyser.value.connect(audioNode)
           
                
            //recorder.start();
            source.start();
            el.play().then(() => {
                console.log(navigator.mediaSession)
            /* Set up media session controls, as shown above. */
            //navigator.mediaSession.playbackState = "playing";
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: "White Noise",
                    artist: "Jyrone Parker",
                    album: "Random White Noise",
                });

                navigator.mediaSession.setActionHandler("play", () => {
                    /* Code excerpted. */
                    const el = document.getElementsByClassName("random-audio")
                    el[0].play()

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
            
            })
            .catch((error) => {
            console.error(error);
            });;
            isPlaying.value = true
           
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