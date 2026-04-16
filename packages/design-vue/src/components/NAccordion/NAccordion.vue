<template>
  <AccordionRoot
    v-model="value"
    :type="type"
    :collapsible="collapsible"
    class="n-accordion"
  >
    <slot>
      <AccordionItem
        v-for="item in items"
        :key="item.value"
        :value="item.value"
        class="n-accordion__item"
      >
        <slot name="item" :item="item">
          <AccordionHeader class="n-accordion__header">
            <AccordionTrigger class="n-accordion__trigger">
              <span class="n-accordion__trigger-text">{{ item.title }}</span>
              <svg
                class="n-accordion__chevron"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M4 6L8 10L12 6"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionContent class="n-accordion__content">
            <div class="n-accordion__content-inner">
              {{ item.content }}
            </div>
          </AccordionContent>
        </slot>
      </AccordionItem>
    </slot>
  </AccordionRoot>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  AccordionRoot,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionContent,
} from 'reka-ui'

export interface NAccordionItem {
  value: string
  title: string
  content?: string
}

export interface NAccordionProps {
  type?: 'single' | 'multiple'
  modelValue?: string | string[]
  collapsible?: boolean
  items?: NAccordionItem[]
}

const props = withDefaults(defineProps<NAccordionProps>(), {
  type: 'single',
  modelValue: undefined,
  collapsible: true,
  items: () => [],
})

const emit = defineEmits<{
  'update:modelValue': [value: string | string[]]
}>()

const value = computed({
  get: () => props.modelValue,
  set: (val) => {
    if (val !== undefined) {
      emit('update:modelValue', val)
    }
  },
})
</script>

<style scoped>
.n-accordion {
  font-family: var(--font-fontFamily-sans, sans-serif);
  width: 100%;
  border: var(--borderWidth-1, 1px) solid var(--color-neutral-200, #e5e5e5);
  border-radius: var(--radius-lg, 0.5rem);
  overflow: hidden;
}

.n-accordion__item {
  border-bottom: var(--borderWidth-1, 1px) solid var(--color-neutral-200, #e5e5e5);
}

.n-accordion__item:last-child {
  border-bottom: none;
}

.n-accordion__header {
  margin: 0;
}

.n-accordion__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: var(--spacing-4, 1rem) var(--spacing-4, 1rem);
  border: none;
  background: transparent;
  font-size: var(--font-fontSize-base, 1rem);
  font-weight: var(--font-fontWeight-medium, 500);
  font-family: var(--font-fontFamily-sans, sans-serif);
  color: var(--color-neutral-800, #262626);
  cursor: pointer;
  text-align: left;
  transition: background-color var(--transition-fast, 150ms ease);
  outline: none;
}

.n-accordion__trigger:hover {
  background-color: var(--color-neutral-50, #fafafa);
}

.n-accordion__trigger:focus-visible {
  box-shadow: inset 0 0 0 2px var(--color-primary-500, #3b82f6);
}

.n-accordion__trigger-text {
  flex: 1;
}

.n-accordion__chevron {
  flex-shrink: 0;
  color: var(--color-neutral-500, #737373);
  transition: transform var(--transition-normal, 250ms ease);
}

.n-accordion__trigger[data-state='open'] .n-accordion__chevron {
  transform: rotate(180deg);
}

.n-accordion__content {
  overflow: hidden;
  background-color: var(--color-neutral-0, #ffffff);
}

.n-accordion__content[data-state='open'] {
  animation: n-accordion-slide-down var(--transition-normal, 250ms ease);
}

.n-accordion__content[data-state='closed'] {
  animation: n-accordion-slide-up var(--transition-normal, 250ms ease);
}

.n-accordion__content-inner {
  padding: var(--spacing-0, 0) var(--spacing-4, 1rem) var(--spacing-4, 1rem);
  font-size: var(--font-fontSize-base, 1rem);
  color: var(--color-neutral-600, #525252);
  line-height: 1.6;
}

@keyframes n-accordion-slide-down {
  from {
    height: 0;
  }
  to {
    height: var(--reka-accordion-content-height);
  }
}

@keyframes n-accordion-slide-up {
  from {
    height: var(--reka-accordion-content-height);
  }
  to {
    height: 0;
  }
}
</style>
