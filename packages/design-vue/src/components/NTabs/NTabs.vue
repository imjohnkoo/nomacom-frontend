<script setup lang="ts">
import { TabsRoot, TabsList, TabsTrigger, TabsContent, TabsIndicator } from 'reka-ui'

export interface TabItem {
  label: string
  value: string
  icon?: string
  disabled?: boolean
}

export interface NTabsProps {
  modelValue?: string
  items?: TabItem[]
}

export interface NTabsEmits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<NTabsProps>(), {
  modelValue: undefined,
  items: () => [],
})

const emit = defineEmits<NTabsEmits>()

function handleValueChange(value: string) {
  emit('update:modelValue', value)
}
</script>

<template>
  <TabsRoot
    :model-value="props.modelValue"
    class="n-tabs"
    @update:model-value="handleValueChange"
  >
    <TabsList class="n-tabs__list">
      <TabsTrigger
        v-for="item in props.items"
        :key="item.value"
        :value="item.value"
        :disabled="item.disabled"
        class="n-tabs__trigger"
      >
        <span
          v-if="item.icon"
          class="n-tabs__icon"
          aria-hidden="true"
        >
          {{ item.icon }}
        </span>
        {{ item.label }}
      </TabsTrigger>
      <TabsIndicator class="n-tabs__indicator" />
    </TabsList>

    <!-- Named slots for each tab's content: item-{value} -->
    <TabsContent
      v-for="item in props.items"
      :key="item.value"
      :value="item.value"
      class="n-tabs__content"
    >
      <slot :name="`item-${item.value}`">
        <!-- Fallback to default slot -->
        <slot />
      </slot>
    </TabsContent>
  </TabsRoot>
</template>

<style scoped>
.n-tabs {
  font-family: var(--n-font-family-sans);
  width: 100%;
}

.n-tabs__list {
  display: flex;
  align-items: center;
  border-bottom: var(--n-border-width-1) solid var(--n-color-neutral-200);
  position: relative;
  gap: var(--n-spacing-0);
}

.n-tabs__trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--n-spacing-1);
  padding: var(--n-spacing-2) var(--n-spacing-4);
  font-family: var(--n-font-family-sans);
  font-size: var(--n-font-size-sm);
  font-weight: var(--n-font-weight-medium);
  color: var(--n-color-neutral-500);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition:
    color var(--n-transition-fast),
    border-color var(--n-transition-fast);
  white-space: nowrap;
  position: relative;
  margin-bottom: -1px;
}

.n-tabs__trigger:hover:not(:disabled) {
  color: var(--n-color-neutral-700);
}

.n-tabs__trigger[data-state='active'] {
  color: var(--n-color-primary-600);
  border-bottom-color: var(--n-color-primary-600);
}

.n-tabs__trigger:disabled {
  color: var(--n-color-neutral-300);
  cursor: not-allowed;
}

.n-tabs__trigger:focus-visible {
  outline: 2px solid var(--n-color-primary-500);
  outline-offset: -2px;
  border-radius: var(--n-radius-sm);
}

.n-tabs__indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background-color: var(--n-color-primary-600);
  border-radius: var(--n-radius-full);
  transition:
    transform var(--n-transition-fast),
    width var(--n-transition-fast);
}

.n-tabs__icon {
  display: inline-flex;
  align-items: center;
  font-size: var(--n-font-size-base);
}

.n-tabs__content {
  padding: var(--n-spacing-4) var(--n-spacing-0);
  font-size: var(--n-font-size-base);
  color: var(--n-color-neutral-700);
}

.n-tabs__content:focus-visible {
  outline: 2px solid var(--n-color-primary-500);
  outline-offset: 2px;
  border-radius: var(--n-radius-sm);
}
</style>
