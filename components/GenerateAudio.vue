<template>
    <div class="container mx-auto">
        <div class="items-center text-center" id="buttons">
            <button class="rounded-md bg-blue-500 px-5 my-2" v-if="!isPlaying" @click="generate">Generate Audio</button>
            <button class="rounded-md bg-red-500 px-5 my-2" v-else @click="stopAudio">Stop Audio</button>
            <Purchase/>

            <GenerativeCanvas class="mx-auto" v-show="false"/>
        </div>
    </div>
   
</template>
<script setup lang="ts">
const audioCtx = useState('audioCtx');
const analyser = useState('analyser');
const canvas = useState('canvas')
const isDone = ref(false)
const isPlaying = ref(false)
let fileWorker;
let recorder;
let blob;
const options = {
      audioBitsPerSecond: 128000,
      videoBitsPerSecond: 2500000,
      mimeType:  "video/webm",
};

onMounted(() => {
    fileWorker = new Worker('workers/FileWriter.js');
    fileWorker.onmessage = (e) => {
        blob = new File([e.data], 'white-noise.webm',{ type: recorder.mimeType });
        console.log(blob)  
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.target="_blank"
        link.download = blob.name
        link.click()
    }
})

async function save() {
    try {
        fileWorker.postMessage({
                    type: 'download'
         })
    } catch (error) {
        console.log(error)
    }
    
}

const stop = () => {
    recorder.stop()
    isDone.value = true
    save()
}
const stopAudio = () => {
    const el = document.getElementsByClassName("random-audio")
    for(var i = 0; i< el.length; ++i) {
        el[i].pause()
        isPlaying.value = false
    }
    stop()
}
const  generate = async () => {
    try {
        const el = document.createElement("video")
        el.controls = "true"
        el.className = "random-audio  text-center mx-auto"
        const btns = document.getElementById('buttons')
        btns.appendChild(el)
        isDone.value = false
        const stream = canvas.value.captureStream(60)
        
        const duration = 10
        const channels = 2
        audioCtx.value = new AudioContext()
        analyser.value = audioCtx.value.createAnalyser();
        const frameCount = 96000 * duration;
        const myArrayBuffer = audioCtx.value.createBuffer(2, frameCount, 96000);
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
           
            source.loop = true;
    
            const audioNode = audioCtx.value.createMediaStreamDestination();
            const audioTrack = audioNode.stream.getAudioTracks()[0]
            
            stream.addTrack(audioTrack) 
            recorder = new MediaRecorder(stream, options)
            recorder.ondataavailable = async (e) => {
                fileWorker.postMessage({
                    type: 'append',
                    data: await e.data.arrayBuffer()
                })     
            };
            recorder.onstop = async (e) => {
                isDone.value = true
                };
                el.srcObject = stream
            const audioEl = audioCtx.value.createMediaElementSource(el)
            
            audioEl.connect(audioCtx.value.destination)
            analyser.value.connect(audioNode)
           
            
            
            source.start();  
            recorder.start();
            setTimeout(()=>{
                stop()
            }, 30000)
            el.play()
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