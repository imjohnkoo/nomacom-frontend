<template>
  <ScrollAreaRoot
    :type="type"
    class="n-scroll-area"
  >
    <ScrollAreaViewport class="n-scroll-area__viewport">
      <slot />
    </ScrollAreaViewport>

    <ScrollAreaScrollbar
      v-if="orientation === 'vertical' || orientation === 'both'"
      orientation="vertical"
      class="n-scroll-area__scrollbar n-scroll-area__scrollbar--vertical"
    >
      <ScrollAreaThumb class="n-scroll-area__thumb" />
    </ScrollAreaScrollbar>

    <ScrollAreaScrollbar
      v-if="orientation === 'horizontal' || orientation === 'both'"
      orientation="horizontal"
      class="n-scroll-area__scrollbar n-scroll-area__scrollbar--horizontal"
    >
      <ScrollAreaThumb class="n-scroll-area__thumb" />
    </ScrollAreaScrollbar>
  </ScrollAreaRoot>
</template>

<script setup lang="ts">
import {
  ScrollAreaRoot,
  ScrollAreaViewport,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
} from 'reka-ui'

export interface NScrollAreaProps {
  type?: 'auto' | 'always' | 'scroll' | 'hover'
  orientation?: 'vertical' | 'horizontal' | 'both'
}

withDefaults(defineProps<NScrollAreaProps>(), {
  type: 'hover',
  orientation: 'vertical',
})
</script>

<style scoped>
.n-scroll-area {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
}

.n-scroll-area__viewport {
  width: 100%;
  height: 100%;
  border-radius: inherit;
}

.n-scroll-area__scrollbar {
  display: flex;
  touch-action: none;
  user-select: none;
  padding: 2px;
  transition: background-color var(--transition-fast, 150ms ease);
}

.n-scroll-area__scrollbar:hover {
  background-color: var(--color-neutral-100, #f5f5f5);
}

.n-scroll-area__scrollbar--vertical {
  width: 10px;
}

.n-scroll-area__scrollbar--horizontal {
  flex-direction: column;
  height: 10px;
}

.n-scroll-area__thumb {
  position: relative;
  flex: 1;
  border-radius: var(--radius-full, 9999px);
  background-color: var(--color-neutral-300, #d4d4d4);
  transition: background-color var(--transition-fast, 150ms ease);
}

.n-scroll-area__thumb::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  min-width: 44px;
  min-height: 44px;
}

.n-scroll-area__thumb:hover {
  background-color: var(--color-neutral-400, #a3a3a3);
}
</style>
