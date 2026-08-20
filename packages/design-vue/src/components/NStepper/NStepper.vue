<script setup lang="ts">
import {
  StepperRoot,
  StepperItem,
  StepperTrigger,
  StepperIndicator,
  StepperTitle,
  StepperDescription,
  StepperSeparator,
} from 'reka-ui'

export interface StepItem {
  title: string
  description?: string
}

export interface NStepperProps {
  modelValue?: number
  items?: StepItem[]
  orientation?: 'horizontal' | 'vertical'
}

export interface NStepperEmits {
  (e: 'update:modelValue', value: number): void
}

const props = withDefaults(defineProps<NStepperProps>(), {
  modelValue: 1,
  items: () => [],
  orientation: 'horizontal',
})

const emit = defineEmits<NStepperEmits>()

function handleStepChange(value: number | undefined) {
  if (value !== undefined) {
    emit('update:modelValue', value)
  }
}
</script>

<template>
  <StepperRoot
    :model-value="props.modelValue"
    :orientation="props.orientation"
    class="n-stepper"
    :class="`n-stepper--${props.orientation}`"
    @update:model-value="handleStepChange"
  >
    <template
      v-for="(item, index) in props.items"
      :key="index"
    >
      <StepperItem
        :step="index + 1"
        class="n-stepper__item"
      >
        <StepperTrigger class="n-stepper__trigger">
          <StepperIndicator class="n-stepper__indicator">
            <span class="n-stepper__number">{{ index + 1 }}</span>
          </StepperIndicator>
          <div class="n-stepper__text">
            <StepperTitle class="n-stepper__title">
              {{ item.title }}
            </StepperTitle>
            <StepperDescription
              v-if="item.description"
              class="n-stepper__description"
            >
              {{ item.description }}
            </StepperDescription>
          </div>
        </StepperTrigger>

        <StepperSeparator
          v-if="index < props.items.length - 1"
          class="n-stepper__separator"
        />
      </StepperItem>
    </template>
  </StepperRoot>
</template>

<style scoped>
.n-stepper {
  font-family: var(--n-font-family-sans);
  width: 100%;
}

.n-stepper--horizontal {
  display: flex;
  align-items: flex-start;
}

.n-stepper--vertical {
  display: flex;
  flex-direction: column;
}

.n-stepper__item {
  display: flex;
  align-items: center;
  flex: 1;
}

.n-stepper--vertical .n-stepper__item {
  flex-direction: column;
  align-items: flex-start;
}

.n-stepper__trigger {
  display: flex;
  align-items: center;
  gap: var(--n-spacing-3);
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--n-spacing-2);
  border-radius: var(--n-radius-md);
  transition: background-color var(--n-transition-fast);
  white-space: nowrap;
}

.n-stepper__trigger:hover {
  background-color: var(--n-color-neutral-50);
}

.n-stepper__trigger:focus-visible {
  outline: 2px solid var(--n-color-primary-500);
  outline-offset: 2px;
}

.n-stepper__indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--n-radius-full);
  border: var(--n-border-width-2) solid var(--n-color-neutral-300);
  background-color: var(--n-color-neutral-0);
  color: var(--n-color-neutral-500);
  font-size: var(--n-font-size-sm);
  font-weight: var(--n-font-weight-semibold);
  transition:
    background-color var(--n-transition-fast),
    border-color var(--n-transition-fast),
    color var(--n-transition-fast);
  flex-shrink: 0;
}

[data-state='active'] .n-stepper__indicator {
  border-color: var(--n-color-primary-600);
  background-color: var(--n-color-primary-600);
  color: var(--n-color-neutral-0);
}

[data-state='completed'] .n-stepper__indicator {
  border-color: var(--n-color-primary-600);
  background-color: var(--n-color-primary-50);
  color: var(--n-color-primary-600);
}

.n-stepper__number {
  line-height: 1;
}

.n-stepper__text {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.n-stepper__title {
  font-size: var(--n-font-size-sm);
  font-weight: var(--n-font-weight-semibold);
  color: var(--n-color-neutral-700);
}

[data-state='active'] .n-stepper__title {
  color: var(--n-color-primary-600);
}

.n-stepper__description {
  font-size: var(--n-font-size-xs);
  font-weight: var(--n-font-weight-normal);
  color: var(--n-color-neutral-500);
  margin-top: var(--n-spacing-0);
}

.n-stepper__separator {
  flex: 1;
  height: 2px;
  min-width: 24px;
  background-color: var(--n-color-neutral-200);
  margin: var(--n-spacing-0) var(--n-spacing-2);
  border-radius: var(--n-radius-full);
  transition: background-color var(--n-transition-fast);
}

[data-state='completed'] ~ .n-stepper__separator,
.n-stepper__separator[data-state='completed'] {
  background-color: var(--n-color-primary-600);
}

.n-stepper--vertical .n-stepper__separator {
  width: 2px;
  height: auto;
  min-height: 24px;
  flex: none;
  margin: var(--n-spacing-1) var(--n-spacing-0) var(--n-spacing-1) calc(var(--n-spacing-2) + 17px);
}
</style>
