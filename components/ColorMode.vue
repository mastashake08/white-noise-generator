<template>
    <div>
      <h1 class="text-color-red-500">Color mode: {{ $colorMode.value }}</h1>
      <select v-model="$colorMode.preference">
        <option value="system" >System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="sepia" selected="true">Sepia</option>
      </select>
    </div>
  </template>
  
  <script setup>
  const colorMode = useColorMode()
  colorMode.preference = "system"
  </script>
  
  <style>
  body {
    background-color: #fff;
    color: rgba(0,0,0,0.8);
  }
  .dark-mode body {
    background-color: #091a28;
    color: #ebf4f1;
  }
  .sepia-mode body {
    background-color: #f1e7d0;
    color: #433422;
  }
  </style>
  