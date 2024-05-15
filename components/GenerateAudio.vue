<template>
    <button @click="generate">Generate Audio</button>
    <button v-if="isDone" @click="save">Save Audio</button>
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
                        accept: { "audio/mpeg": [".webm"] },
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
const  generate = async () => {
    try {
        isDone.value = false
        const stream = canvas.value.captureStream(30)
        
        const duration = 5000
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
            const source = audioCtx.value.createBufferSource();
            // set the buffer in the AudioBufferSourceNode
            source.buffer = myArrayBuffer;
            source.loop = true
            // connect the AudioBufferSourceNode to the
            // destination so we can hear the sound
            source.connect(analyser.value);
            // start the source playing
            source.loop = false;
    
            const audioNode = audioCtx.value.createMediaStreamDestination();
            const audioTrack = audioNode.stream.getAudioTracks()[0]
            
            stream.addTrack(audioTrack) 
            
            recorder = new MediaRecorder(audioNode.stream, options)
            recorder.ondataavailable = (e) => {
                console.log('DATA')
                chunks.push(e.data);         
            };
            recorder.onstop = async (e) => {
                console.log("data available after MediaRecorder.stop() called.");

                blob = new File(chunks, 'white-noise',{ type: recorder.mimeType });
               
                console.log("recorder stopped", blob);
                
                };
            analyser.value.connect(audioNode)
            source.connect(audioCtx.value.destination)
            recorder.start();
            source.start(0,0,duration);
            setTimeout(() => {
                stop()
            }, 30000);
    } catch (error) {
        console.log(error)
    }
}


</script>