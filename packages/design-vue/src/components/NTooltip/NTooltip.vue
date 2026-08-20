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
  z-index: var(--n-z-index-tooltip, 1070);
  max-width: 280px;
  padding: var(--n-spacing-2, 0.5rem) var(--n-spacing-3, 0.75rem);
  border-radius: var(--n-radius-md, 0.375rem);
  background-color: var(--n-color-neutral-900, #171717);
  color: var(--n-color-neutral-0, #ffffff);
  font-family: var(--n-font-family-sans, 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Segoe UI', 'Noto Sans KR', sans-serif);
  font-size: var(--n-font-size-xs, 0.75rem);
  font-weight: var(--n-font-weight-medium, 500);
  line-height: 1.4;
  box-shadow: var(--n-shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
  user-select: none;
  animation: n-tooltip-fade-in var(--n-transition-fast, 150ms ease) ease;
}

.n-tooltip__arrow {
  fill: var(--n-color-neutral-900, #171717);
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
