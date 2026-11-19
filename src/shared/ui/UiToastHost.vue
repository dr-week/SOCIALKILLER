<script setup lang="ts">
import { Toaster } from 'vue-sonner'
import 'vue-sonner/style.css'
</script>

<template>
  <Toaster position="bottom-right" theme="dark" :rich-colors="true" :close-button="true" />
</template>

<style scoped lang="scss">
:global([data-sonner-toaster]) {
  font-family: inherit;
}

:global([data-sonner-toast]) {
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.14)) !important;
  background: var(--glass-bg, rgba(17, 20, 30, 0.88)) !important;
  backdrop-filter: blur(18px);
}
</style>
