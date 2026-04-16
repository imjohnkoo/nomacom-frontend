<template>
  <TooltipProvider :delay-duration="delayDuration">
    <TooltipRoot>
      <TooltipTrigger as-child>
        <slot />
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipContent
          :side="side"
          :side-offset="5"
          class="n-tooltip__content"
        >
          <slot name="content">
            {{ content }}
          </slot>
          <TooltipArrow class="n-tooltip__arrow" />
        </TooltipContent>
      </TooltipPortal>
    </TooltipRoot>
  </TooltipProvider>
</template>

<script setup lang="ts">
import {
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  TooltipContent,
  TooltipPortal,
  TooltipArrow,
} from 'reka-ui'

export interface NTooltipProps {
  /** Text content of the tooltip */
  content?: string
  /** Preferred side to render the tooltip */
  side?: 'top' | 'bottom' | 'left' | 'right'
  /** Delay in ms before showing the tooltip */
  delayDuration?: number
}

withDefaults(defineProps<NTooltipProps>(), {
  content: '',
  side: 'top',
  delayDuration: 200,
})
</script>

<style>
.n-tooltip__content {
  z-index: var(--zIndex-tooltip, 1100);
  max-width: 280px;
  padding: var(--spacing-2, 0.5rem) var(--spacing-3, 0.75rem);
  border-radius: var(--radius-md, 0.375rem);
  background-color: var(--color-neutral-900, #111827);
  color: var(--color-neutral-0, #ffffff);
  font-family: var(--font-fontFamily-sans, sans-serif);
  font-size: var(--font-fontSize-xs, 0.75rem);
  font-weight: var(--font-fontWeight-medium, 500);
  line-height: 1.4;
  box-shadow: var(--shadow-md, 0 4px 6px -1px rgb(0 0 0 / 0.1));
  user-select: none;
  animation: n-tooltip-fade-in var(--transition-fast, 150ms) ease;
}

.n-tooltip__arrow {
  fill: var(--color-neutral-900, #111827);
}

@keyframes n-tooltip-fade-in {
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
