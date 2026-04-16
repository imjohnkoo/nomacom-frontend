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
  font-family: var(--font-fontFamily-sans);
  width: 100%;
}

.n-tabs__list {
  display: flex;
  align-items: center;
  border-bottom: var(--borderWidth-1) solid var(--color-neutral-200);
  position: relative;
  gap: var(--spacing-0);
}

.n-tabs__trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-1);
  padding: var(--spacing-2) var(--spacing-4);
  font-family: var(--font-fontFamily-sans);
  font-size: var(--font-fontSize-sm);
  font-weight: var(--font-fontWeight-medium);
  color: var(--color-neutral-500);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition:
    color var(--transition-fast),
    border-color var(--transition-fast);
  white-space: nowrap;
  position: relative;
  margin-bottom: -1px;
}

.n-tabs__trigger:hover:not(:disabled) {
  color: var(--color-neutral-700);
}

.n-tabs__trigger[data-state='active'] {
  color: var(--color-primary-600);
  border-bottom-color: var(--color-primary-600);
}

.n-tabs__trigger:disabled {
  color: var(--color-neutral-300);
  cursor: not-allowed;
}

.n-tabs__trigger:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: -2px;
  border-radius: var(--radius-sm);
}

.n-tabs__indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background-color: var(--color-primary-600);
  border-radius: var(--radius-full);
  transition:
    transform var(--transition-fast),
    width var(--transition-fast);
}

.n-tabs__icon {
  display: inline-flex;
  align-items: center;
  font-size: var(--font-fontSize-base);
}

.n-tabs__content {
  padding: var(--spacing-4) var(--spacing-0);
  font-size: var(--font-fontSize-base);
  color: var(--color-neutral-700);
}

.n-tabs__content:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}
</style>
