<script setup lang="ts">
import { CollapsibleRoot, CollapsibleTrigger, CollapsibleContent } from 'reka-ui'

export interface NCollapsibleProps {
  modelValue?: boolean
  disabled?: boolean
}

withDefaults(defineProps<NCollapsibleProps>(), {
  modelValue: false,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<template>
  <CollapsibleRoot
    :open="modelValue"
    :disabled="disabled"
    :class="[
      'n-collapsible',
      { 'n-collapsible--disabled': disabled },
    ]"
    @update:open="emit('update:modelValue', $event)"
  >
    <CollapsibleTrigger class="n-collapsible__trigger">
      <slot name="trigger">
        <span class="n-collapsible__trigger-text">Toggle</span>
        <svg
          class="n-collapsible__chevron"
          :class="{ 'n-collapsible__chevron--open': modelValue }"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </slot>
    </CollapsibleTrigger>
    <CollapsibleContent class="n-collapsible__content">
      <div class="n-collapsible__content-inner">
        <slot />
      </div>
    </CollapsibleContent>
  </CollapsibleRoot>
</template>

<style scoped>
.n-collapsible {
  width: 100%;
}

.n-collapsible--disabled {
  opacity: 0.5;
  pointer-events: none;
}

.n-collapsible__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4);
  background: none;
  border: var(--borderWidth-1) solid var(--color-neutral-200);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-family: var(--font-fontFamily-sans);
  font-size: var(--font-fontSize-sm);
  font-weight: var(--font-fontWeight-medium);
  color: var(--color-neutral-800);
  transition: background-color var(--transition-fast);
}

.n-collapsible__trigger:hover {
  background-color: var(--color-neutral-50);
}

.n-collapsible__chevron {
  transition: transform var(--transition-fast);
  flex-shrink: 0;
}

.n-collapsible__chevron--open {
  transform: rotate(180deg);
}

.n-collapsible__content {
  overflow: hidden;
}

.n-collapsible__content[data-state='open'] {
  animation: n-collapsible-slideDown var(--transition-fast) ease-out;
}

.n-collapsible__content[data-state='closed'] {
  animation: n-collapsible-slideUp var(--transition-fast) ease-out;
}

.n-collapsible__content-inner {
  padding: var(--spacing-3) var(--spacing-4);
}

@keyframes n-collapsible-slideDown {
  from {
    height: 0;
  }
  to {
    height: var(--reka-collapsible-content-height);
  }
}

@keyframes n-collapsible-slideUp {
  from {
    height: var(--reka-collapsible-content-height);
  }
  to {
    height: 0;
  }
}
</style>
