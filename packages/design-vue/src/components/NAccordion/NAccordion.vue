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
  font-family: var(--n-font-family-sans, 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Segoe UI', 'Noto Sans KR', sans-serif);
  width: 100%;
  border: var(--n-border-width-1, 1px) solid var(--n-color-neutral-200, #e5e5e5);
  border-radius: var(--n-radius-lg, 0.5rem);
  overflow: hidden;
}

.n-accordion__item {
  border-bottom: var(--n-border-width-1, 1px) solid var(--n-color-neutral-200, #e5e5e5);
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
  padding: var(--n-spacing-4, 1rem) var(--n-spacing-4, 1rem);
  border: none;
  background: transparent;
  font-size: var(--n-font-size-base, 1rem);
  font-weight: var(--n-font-weight-medium, 500);
  font-family: var(--n-font-family-sans, 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Segoe UI', 'Noto Sans KR', sans-serif);
  color: var(--n-color-neutral-800, #262626);
  cursor: pointer;
  text-align: left;
  transition: background-color var(--n-transition-fast, 150ms ease);
  outline: none;
}

.n-accordion__trigger:hover {
  background-color: var(--n-color-neutral-50, #fafafa);
}

.n-accordion__trigger:focus-visible {
  box-shadow: inset 0 0 0 2px var(--n-color-primary-500, #6239FF);
}

.n-accordion__trigger-text {
  flex: 1;
}

.n-accordion__chevron {
  flex-shrink: 0;
  color: var(--n-color-neutral-500, #737373);
  transition: transform var(--n-transition-normal, 250ms ease);
}

.n-accordion__trigger[data-state='open'] .n-accordion__chevron {
  transform: rotate(180deg);
}

.n-accordion__content {
  overflow: hidden;
  background-color: var(--n-color-neutral-0, #ffffff);
}

.n-accordion__content[data-state='open'] {
  animation: n-accordion-slide-down var(--n-transition-normal, 250ms ease);
}

.n-accordion__content[data-state='closed'] {
  animation: n-accordion-slide-up var(--n-transition-normal, 250ms ease);
}

.n-accordion__content-inner {
  padding: var(--n-spacing-0, 0) var(--n-spacing-4, 1rem) var(--n-spacing-4, 1rem);
  font-size: var(--n-font-size-base, 1rem);
  color: var(--n-color-neutral-600, #525252);
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
