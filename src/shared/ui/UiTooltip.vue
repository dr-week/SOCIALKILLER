<script setup lang="ts">
import { TooltipContent, TooltipPortal, TooltipRoot, TooltipTrigger } from 'reka-ui'

defineProps<{ text: string }>()
</script>

<template>
  <TooltipRoot>
    <TooltipTrigger as-child>
      <slot />
    </TooltipTrigger>
    <TooltipPortal>
      <TooltipContent class="ui-tooltip-content" :side-offset="6">
        {{ text }}
      </TooltipContent>
    </TooltipPortal>
  </TooltipRoot>
</template>

<style scoped lang="scss">
:global(.ui-tooltip-content) {
  z-index: 1300;
  padding: 5px 9px;
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.14));
  border-radius: 7px;
  background: var(--glass-bg, rgba(17, 20, 30, 0.92));
  backdrop-filter: blur(14px);
  box-shadow: var(--card-shadow, 0 8px 22px rgba(0, 0, 0, 0.4));
  color: var(--ink, #f8fafc);
  font-size: 10.5px;
  font-weight: 600;
  pointer-events: none;
}
</style>
