<script setup lang="ts">
import NCheckbox from '../NCheckbox/NCheckbox.vue'

export interface NCheckboxGroupItem {
  label: string
  value: string
  disabled?: boolean
}

export interface NCheckboxGroupProps {
  modelValue?: string[]
  items?: NCheckboxGroupItem[]
}

const props = withDefaults(defineProps<NCheckboxGroupProps>(), {
  modelValue: () => [],
  items: () => [],
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

function toggleItem(value: string) {
  const current = [...props.modelValue]
  const index = current.indexOf(value)
  if (index === -1) {
    current.push(value)
  } else {
    current.splice(index, 1)
  }
  emit('update:modelValue', current)
}
</script>

<template>
  <div class="n-checkbox-group" role="group">
    <NCheckbox
      v-for="item in items"
      :key="item.value"
      :model-value="modelValue.includes(item.value)"
      :label="item.label"
      :disabled="item.disabled"
      class="n-checkbox-group__item"
      @update:model-value="toggleItem(item.value)"
    />
  </div>
</template>

<style scoped>
.n-checkbox-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.n-checkbox-group__item {
  display: flex;
}
</style>
