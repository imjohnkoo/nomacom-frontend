<template>
  <PopoverRoot v-model:open="open">
    <PopoverTrigger as-child>
      <slot />
    </PopoverTrigger>
    <PopoverPortal>
      <PopoverContent
        :side="side"
        :align="align"
        :side-offset="8"
        class="n-popover__content"
      >
        <slot name="content" />
        <PopoverArrow class="n-popover__arrow" />
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>

<script setup lang="ts">
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
  PopoverPortal,
  PopoverArrow,
} from 'reka-ui'

export interface NPopoverProps {
  /** Preferred side to render the popover */
  side?: 'top' | 'bottom' | 'left' | 'right'
  /** Preferred alignment */
  align?: 'start' | 'center' | 'end'
  /** Controlled open state */
  open?: boolean
}

withDefaults(defineProps<NPopoverProps>(), {
  side: 'bottom',
  align: 'center',
  open: undefined,
})

const open = defineModel<boolean>('open', { default: false })
</script>

<style>
.n-popover__content {
  z-index: var(--zIndex-popover, 1050);
  min-width: 200px;
  max-width: 360px;
  padding: var(--spacing-4, 1rem);
  border-radius: var(--radius-lg, 0.5rem);
  background-color: var(--color-neutral-0, #ffffff);
  border: var(--borderWidth-1, 1px) solid var(--color-neutral-200, #e5e7eb);
  box-shadow: var(--shadow-lg, 0 10px 15px -3px rgb(0 0 0 / 0.1));
  font-family: var(--font-fontFamily-sans, sans-serif);
  font-size: var(--font-fontSize-sm, 0.875rem);
  color: var(--color-neutral-800, #1f2937);
  animation: n-popover-enter var(--transition-fast, 150ms) ease;
  will-change: transform, opacity;
}

.n-popover__content:focus {
  outline: none;
}

.n-popover__arrow {
  fill: var(--color-neutral-0, #ffffff);
}

@keyframes n-popover-enter {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
