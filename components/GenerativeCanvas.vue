<template>
    <canvas v-show="true" ref="canvas" width="3840" height="2160" ></canvas>
   
</template>
<script setup>
import matrix from "cmatrix/dist/matrix";
const canvas = ref('canvas')
const vid = ref('video')
onMounted(() => {
    const video = useState('video-display',() => vid.value)
    const c = useState('canvas', () => canvas.value)
    const ctx = canvas.value.getContext('2d')
    const text = matrix.range(0x30A1, 0x30F6).concat(matrix.range(0x0030, 0x0039))
    const chars = 'Code Life Mastashake'
    for (const c in chars) {
        text.concat(c.charCodeAt())
    }
    matrix(canvas.value, {
        chars: text,
        font_size: 32,
        width: canvas.value.width,
        height: canvas.value.height,
        background:  'rgba(0,0,0,0.005)'
    
    }) 
})
</script>
<style>
    canvas {
        filter: url('fade.svg#fadeFilter');
        /* background-color: black; */
        animation:fading 10s infinite
    }

    @keyframes fading{
        0% {
            opacity:1
            }
        50% {
            opacity:.2
            }
        100% {
            opacity:1
            }
        }
</style>