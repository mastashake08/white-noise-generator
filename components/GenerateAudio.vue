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
  
        blob = new File([e.data], Date.now()+'-bounty-hunter.webm', {type: recorder.mimeType });
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
    // save()
}
const stopAudio = () => {
    const el = document.getElementsByClassName("random-audio")
    for(var i = 0; i< el.length; ++i) {
        el[i].pause()
        isPlaying.value = false
    }
    stop()
}
const setUpText = (video) => {
    console.log(video)
    const cues = video.textTracks
    console.log(cues)
}
const  generate = async () => {
    try {
        const ctx = canvas.value.getContext('2d');
        
        const img = new Image()
        img.onload = function() {
                     ctx.drawImage(img, 0, 0);
                 }
        img.src = '/bounty.JPG';
        const el = document.createElement("video")
        const text = document.createElement('track')
        text.kind = "captions"
        text.src = 'lyrics.vtt'
        text.type = "text/vtt"
        text.mode = 'showing'
        
        el.appendChild(text)
        el.controls = "true"
        el.className = "random-audio  text-center mx-auto"
        el.onplay = () => {
            setUpText(el)
        }
        const btns = document.getElementById('buttons')
        btns.appendChild(el)
        isDone.value = false
        const stream = canvas.value.captureStream()
        const req = await fetch('music.m4a')
        const duration = 10
        const channels = 2
        audioCtx.value = new AudioContext()
        analyser.value = audioCtx.value.createAnalyser();

        const myArrayBuffer = await audioCtx.value.decodeAudioData(await req.arrayBuffer());
        
        
            const source = createBufferSource(myArrayBuffer, analyser.value)
           
            source.loop = false;
    
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
                save()
                };
                el.srcObject = stream
            const audioEl = audioCtx.value.createMediaElementSource(el)
            
            audioEl.connect(audioCtx.value.destination)
            analyser.value.connect(audioNode)
           
            
            
            source.start();  
            recorder.start();
            const actionHandlers = [
                // play
                [
                    "play",
                    () => {
                    // play our audio
                    el.play();
                    // set playback state
                    navigator.mediaSession.playbackState = "playing";
                    // update our status element
                    //updateStatus(allMeta[index], "Action: play  |  Track is playing…");
                    },
                ],
                [
                    "pause",
                    () => {
                    // pause out audio
                    el.pause();
                    // set playback state
                    navigator.mediaSession.playbackState = "paused";
                    // update our status element
                    //updateStatus(allMeta[index], "Action: pause  |  Track has been paused…");
                    },
                ],
                [
                    "stop",
                    () => {
                    // pause out audio
                    stop();
                    source.stop()
                    // set playback state
                    navigator.mediaSession.playbackState = "inactive";
                    // update our status element
                    //updateStatus(allMeta[index], "Action: pause  |  Track has been paused…");
                    },
                ]
            ];
            for (const [action, handler] of actionHandlers) {
                try {
                    navigator.mediaSession.setActionHandler(action, handler);
                } catch (error) {
                    console.log(`The media session action "${action}" is not supported yet.`);
                }
                }
            el.play()
            .catch((error) => {
            console.error(error);
            });
            isPlaying.value = true
           
    } catch (error) {
        console.log(error)
    }
}
function createBufferSource(buffer, connect) {
    const source = audioCtx.value.createBufferSource();
            // set the buffer in the AudioBufferSourceNode
            source.buffer = buffer;
            source.loop = false
            // connect the AudioBufferSourceNode to the
            // destination so we can hear the sound
            source.connect(connect);
    return source;
}
</script>
<style>
video::cue {
  background-image: linear-gradient(to bottom, dimgray, lightgray);
  color: papayawhip;
}

video::cue(b) {
  color: peachpuff;
}

</style>