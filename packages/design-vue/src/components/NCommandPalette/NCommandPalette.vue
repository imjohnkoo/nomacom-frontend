<script setup lang="ts">
import {
  DialogRoot,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  ComboboxRoot,
  ComboboxInput,
  ComboboxContent,
  ComboboxItem,
  ComboboxEmpty,
} from 'reka-ui'
import { ref, computed, onMounted, onUnmounted } from 'vue'

export interface CommandItem {
  label: string
  value: string
  icon?: string
  shortcut?: string
}

export interface CommandGroup {
  group: string
  items: CommandItem[]
}

export interface NCommandPaletteProps {
  modelValue?: boolean
  items?: CommandGroup[]
  placeholder?: string
}

export interface NCommandPaletteEmits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'select', item: CommandItem): void
}

const props = withDefaults(defineProps<NCommandPaletteProps>(), {
  modelValue: false,
  items: () => [],
  placeholder: 'Type a command or search...',
})

const emit = defineEmits<NCommandPaletteEmits>()

const searchTerm = ref('')

const filteredGroups = computed(() => {
  const query = searchTerm.value.toLowerCase().trim()
  if (!query) return props.items

  return props.items
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          item.label.toLowerCase().includes(query) ||
          item.value.toLowerCase().includes(query),
      ),
    }))
    .filter((group) => group.items.length > 0)
})

const hasResults = computed(() =>
  filteredGroups.value.some((group) => group.items.length > 0),
)

function handleOpenChange(open: boolean) {
  emit('update:modelValue', open)
  if (!open) {
    searchTerm.value = ''
  }
}

function handleSelect(item: CommandItem) {
  emit('select', item)
  emit('update:modelValue', false)
  searchTerm.value = ''
}

function handleKeydown(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
    event.preventDefault()
    emit('update:modelValue', !props.modelValue)
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <DialogRoot
    :open="props.modelValue"
    @update:open="handleOpenChange"
  >
    <DialogPortal>
      <DialogOverlay class="n-command-palette__overlay" />

      <DialogContent class="n-command-palette__dialog">
        <DialogTitle class="n-command-palette__sr-only">
          Command Palette
        </DialogTitle>
        <DialogDescription class="n-command-palette__sr-only">
          Search for commands and actions
        </DialogDescription>

        <ComboboxRoot
          class="n-command-palette"
          :filter-function="() => true"
        >
          <div class="n-command-palette__input-wrapper">
            <span
              class="n-command-palette__search-icon"
              aria-hidden="true"
            >
              &#x1F50D;
            </span>
            <ComboboxInput
              v-model="searchTerm"
              :placeholder="props.placeholder"
              class="n-command-palette__input"
              auto-focus
            />
            <kbd class="n-command-palette__kbd">Esc</kbd>
          </div>

          <ComboboxContent
            class="n-command-palette__content"
            :dismiss-on-select="false"
          >
            <ComboboxEmpty
              v-if="!hasResults"
              class="n-command-palette__empty"
            >
              No results found.
            </ComboboxEmpty>

            <div
              v-for="group in filteredGroups"
              :key="group.group"
              class="n-command-palette__group"
            >
              <div class="n-command-palette__group-label">
                {{ group.group }}
              </div>
              <ComboboxItem
                v-for="item in group.items"
                :key="item.value"
                :value="item.value"
                class="n-command-palette__item"
                @select="handleSelect(item)"
              >
                <span class="n-command-palette__item-content">
                  <span
                    v-if="item.icon"
                    class="n-command-palette__item-icon"
                    aria-hidden="true"
                  >
                    {{ item.icon }}
                  </span>
                  <span class="n-command-palette__item-label">
                    {{ item.label }}
                  </span>
                </span>
                <kbd
                  v-if="item.shortcut"
                  class="n-command-palette__shortcut"
                >
                  {{ item.shortcut }}
                </kbd>
              </ComboboxItem>
            </div>
          </ComboboxContent>
        </ComboboxRoot>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
.n-command-palette__overlay {
  position: fixed;
  inset: 0;
  z-index: var(--n-z-index-modal-backdrop);
  background-color: rgba(0, 0, 0, 0.5);
  animation: n-command-overlay-enter var(--n-transition-fast) ease-out;
}

@keyframes n-command-overlay-enter {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.n-command-palette__dialog {
  position: fixed;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--n-z-index-modal);
  width: 100%;
  max-width: 560px;
  background-color: var(--n-color-neutral-0);
  border-radius: var(--n-radius-xl);
  box-shadow: var(--n-shadow-xl);
  overflow: hidden;
  animation: n-command-dialog-enter var(--n-transition-fast) ease-out;
}

@keyframes n-command-dialog-enter {
  from {
    opacity: 0;
    transform: translateX(-50%) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) scale(1);
  }
}

.n-command-palette {
  font-family: var(--n-font-family-sans);
  display: flex;
  flex-direction: column;
}

.n-command-palette__input-wrapper {
  display: flex;
  align-items: center;
  gap: var(--n-spacing-2);
  padding: var(--n-spacing-3) var(--n-spacing-4);
  border-bottom: var(--n-border-width-1) solid var(--n-color-neutral-200);
}

.n-command-palette__search-icon {
  flex-shrink: 0;
  font-size: var(--n-font-size-base);
  color: var(--n-color-neutral-400);
}

.n-command-palette__input {
  flex: 1;
  border: none;
  background: none;
  font-family: var(--n-font-family-sans);
  font-size: var(--n-font-size-base);
  font-weight: var(--n-font-weight-normal);
  color: var(--n-color-neutral-900);
  outline: none;
}

.n-command-palette__input::placeholder {
  color: var(--n-color-neutral-400);
}

.n-command-palette__kbd {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--n-spacing-0) var(--n-spacing-1);
  font-family: var(--n-font-family-sans);
  font-size: var(--n-font-size-xs);
  font-weight: var(--n-font-weight-medium);
  color: var(--n-color-neutral-400);
  background-color: var(--n-color-neutral-100);
  border: var(--n-border-width-1) solid var(--n-color-neutral-200);
  border-radius: var(--n-radius-sm);
  line-height: 1.6;
}

.n-command-palette__content {
  max-height: 360px;
  overflow-y: auto;
  padding: var(--n-spacing-2);
}

.n-command-palette__empty {
  padding: var(--n-spacing-8) var(--n-spacing-4);
  text-align: center;
  font-size: var(--n-font-size-sm);
  color: var(--n-color-neutral-500);
}

.n-command-palette__group {
  margin-bottom: var(--n-spacing-2);
}

.n-command-palette__group:last-child {
  margin-bottom: 0;
}

.n-command-palette__group-label {
  padding: var(--n-spacing-1) var(--n-spacing-2);
  font-size: var(--n-font-size-xs);
  font-weight: var(--n-font-weight-semibold);
  color: var(--n-color-neutral-400);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.n-command-palette__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--n-spacing-3);
  padding: var(--n-spacing-2) var(--n-spacing-3);
  border-radius: var(--n-radius-md);
  cursor: pointer;
  transition:
    background-color var(--n-transition-fast),
    color var(--n-transition-fast);
}

.n-command-palette__item:hover,
.n-command-palette__item[data-highlighted] {
  background-color: var(--n-color-primary-50);
}

.n-command-palette__item[data-highlighted] .n-command-palette__item-label {
  color: var(--n-color-primary-700);
}

.n-command-palette__item:focus-visible {
  outline: 2px solid var(--n-color-primary-500);
  outline-offset: -2px;
}

.n-command-palette__item-content {
  display: flex;
  align-items: center;
  gap: var(--n-spacing-2);
  min-width: 0;
}

.n-command-palette__item-icon {
  flex-shrink: 0;
  font-size: var(--n-font-size-base);
  color: var(--n-color-neutral-500);
}

.n-command-palette__item-label {
  font-size: var(--n-font-size-sm);
  font-weight: var(--n-font-weight-medium);
  color: var(--n-color-neutral-700);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.n-command-palette__shortcut {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: var(--n-spacing-1);
  font-family: var(--n-font-family-sans);
  font-size: var(--n-font-size-xs);
  font-weight: var(--n-font-weight-medium);
  color: var(--n-color-neutral-400);
  background-color: var(--n-color-neutral-100);
  border: var(--n-border-width-1) solid var(--n-color-neutral-200);
  border-radius: var(--n-radius-sm);
  padding: var(--n-spacing-0) var(--n-spacing-1);
  line-height: 1.6;
}

.n-command-palette__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
