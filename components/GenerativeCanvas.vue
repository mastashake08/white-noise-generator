<template>
   <canvas ref="canvas" width="1080" height="720" ></canvas>

</template>
<script setup>
const canvas = ref('canvas')
onMounted(() => {

    const c = useState('canvas', () => canvas.value)
    const img = new Image() 
    const url = '/space.jpg'
    const ctx = canvas.value.getContext('2d')
   
    img.src = url
    img.addEventListener("load", (e) => {
        ctx.drawImage(img, 0, 0, 1080, 720)
    });
    console.log(img)
})
</script>
<style>
    canvas {
        filter: url('/fade.svg#fadeFilter');
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