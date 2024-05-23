<template>
    <canvas v-show="true" ref="canvas" width="1080" height="720" ></canvas>
   
</template>
<script setup>
import matrix from "cmatrix/dist/matrix";
const canvas = ref('canvas')
const vid = ref('video')
onMounted(() => {
    const video = useState('video-display',() => vid.value)
    const c = useState('canvas', () => canvas.value)
    matrix(canvas.value, {
        chars: matrix.range(0x30A1, 0x30F6).concat(matrix.range(0x0030, 0x0039)),
        font_size: 16,
        width: canvas.value.width,
        height: canvas.value.height
    })
})
</script>
<style>
    canvas {
        filter: url('fade.svg#fadeFilter');
        background-color: black;
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