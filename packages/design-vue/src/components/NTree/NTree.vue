<template>
  <div class="n-tree" role="tree">
    <NTreeNode
      v-for="item in items"
      :key="item.value"
      :item="item"
      :depth="0"
      :selected-value="modelValue"
      @select="onSelect"
      @toggle="onToggle"
    />
  </div>
</template>

<script setup lang="ts">
import NTreeNode from './NTreeNode.vue'

export interface TreeItem {
  label: string
  value: string
  children?: TreeItem[]
  expanded?: boolean
  icon?: string
}

export interface NTreeProps {
  items?: TreeItem[]
  modelValue?: string
}

withDefaults(defineProps<NTreeProps>(), {
  items: () => [],
  modelValue: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  toggle: [node: TreeItem]
}>()

function onSelect(value: string) {
  emit('update:modelValue', value)
}

function onToggle(node: TreeItem) {
  node.expanded = !node.expanded
  emit('toggle', node)
}
</script>

<style scoped>
.n-tree {
  font-family: var(--font-fontFamily-sans, sans-serif);
  width: 100%;
}
</style>
