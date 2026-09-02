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
  z-index: var(--n-z-index-popover, 1060);
  min-width: 200px;
  max-width: 360px;
  padding: var(--n-spacing-4, 1rem);
  border-radius: var(--n-radius-lg, 0.5rem);
  background-color: var(--n-color-neutral-0, #ffffff);
  border: var(--n-border-width-1, 1px) solid var(--n-color-neutral-200, #e5e5e5);
  box-shadow: var(--n-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
  font-family: var(--n-font-family-sans, 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Segoe UI', 'Noto Sans KR', sans-serif);
  font-size: var(--n-font-size-sm, 0.875rem);
  color: var(--n-color-neutral-800, #262626);
  animation: n-popover-enter var(--n-transition-fast, 150ms ease) ease;
  will-change: transform, opacity;
}

.n-popover__content:focus {
  outline: none;
}

.n-popover__arrow {
  fill: var(--n-color-neutral-0, #ffffff);
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
