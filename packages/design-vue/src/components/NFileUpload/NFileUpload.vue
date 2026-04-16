<template>
  <div
    :class="[
      'n-file-upload',
      {
        'n-file-upload--disabled': disabled,
        'n-file-upload--dragging': isDragging,
        'n-file-upload--has-files': selectedFiles.length > 0,
      },
    ]"
    @dragenter.prevent="onDragEnter"
    @dragover.prevent="onDragOver"
    @dragleave.prevent="onDragLeave"
    @drop.prevent="onDrop"
    @click="openFileBrowser"
    @keydown.enter="openFileBrowser"
    @keydown.space.prevent="openFileBrowser"
    role="button"
    tabindex="0"
    :aria-disabled="disabled"
  >
    <input
      ref="fileInputRef"
      type="file"
      class="n-file-upload__input"
      :accept="accept"
      :multiple="multiple"
      :disabled="disabled"
      @change="onFileChange"
    />

    <div v-if="selectedFiles.length === 0" class="n-file-upload__placeholder">
      <svg class="n-file-upload__icon" width="40" height="40" viewBox="0 0 40 40" fill="none">
        <path
          d="M20 26V14M20 14L15 19M20 14L25 19"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M33 25V30C33 31.6569 31.6569 33 30 33H10C8.34315 33 7 31.6569 7 30V25"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <p class="n-file-upload__text">
        Drop files here or <span class="n-file-upload__link">browse</span>
      </p>
      <p v-if="accept" class="n-file-upload__hint">
        Accepted: {{ accept }}
      </p>
    </div>

    <div v-else class="n-file-upload__files">
      <div
        v-for="(file, index) in selectedFiles"
        :key="index"
        class="n-file-upload__file"
      >
        <svg class="n-file-upload__file-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M9 1H4C3.44772 1 3 1.44772 3 2V14C3 14.5523 3.44772 15 4 15H12C12.5523 15 13 14.5523 13 14V5L9 1Z"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path d="M9 1V5H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span class="n-file-upload__file-name">{{ file.name }}</span>
        <span class="n-file-upload__file-size">{{ formatSize(file.size) }}</span>
        <button
          type="button"
          class="n-file-upload__file-remove"
          @click.stop="removeFile(index)"
          aria-label="Remove file"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

export interface NFileUploadProps {
  accept?: string
  multiple?: boolean
  disabled?: boolean
  maxSize?: number
}

const props = withDefaults(defineProps<NFileUploadProps>(), {
  accept: undefined,
  multiple: false,
  disabled: false,
  maxSize: undefined,
})

const emit = defineEmits<{
  change: [files: File[]]
  error: [message: string]
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const selectedFiles = ref<File[]>([])

function openFileBrowser() {
  if (props.disabled) return
  fileInputRef.value?.click()
}

function onDragEnter() {
  if (props.disabled) return
  isDragging.value = true
}

function onDragOver() {
  if (props.disabled) return
  isDragging.value = true
}

function onDragLeave() {
  isDragging.value = false
}

function onDrop(event: DragEvent) {
  isDragging.value = false
  if (props.disabled) return
  const files = event.dataTransfer?.files
  if (files) {
    processFiles(Array.from(files))
  }
}

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files) {
    processFiles(Array.from(target.files))
  }
  // Reset input so the same file can be selected again
  target.value = ''
}

function processFiles(files: File[]) {
  const validFiles: File[] = []

  for (const file of files) {
    if (props.maxSize && file.size > props.maxSize) {
      emit('error', `File "${file.name}" exceeds maximum size of ${formatSize(props.maxSize)}`)
      continue
    }
    validFiles.push(file)
  }

  if (props.multiple) {
    selectedFiles.value = [...selectedFiles.value, ...validFiles]
  } else {
    selectedFiles.value = validFiles.slice(0, 1)
  }

  if (validFiles.length > 0) {
    emit('change', selectedFiles.value)
  }
}

function removeFile(index: number) {
  selectedFiles.value.splice(index, 1)
  emit('change', selectedFiles.value)
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
</script>

<style scoped>
.n-file-upload {
  font-family: var(--font-fontFamily-sans, sans-serif);
  border: var(--borderWidth-2, 2px) dashed var(--color-neutral-300, #d4d4d4);
  border-radius: var(--radius-lg, 0.5rem);
  padding: var(--spacing-6, 1.5rem);
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-fast, 150ms ease);
  background-color: var(--color-neutral-0, #ffffff);
  outline: none;
}

.n-file-upload:hover:not(.n-file-upload--disabled) {
  border-color: var(--color-primary-300, #93c5fd);
  background-color: var(--color-primary-50, #eff6ff);
}

.n-file-upload:focus-visible {
  border-color: var(--color-primary-500, #3b82f6);
  box-shadow: 0 0 0 2px var(--color-primary-100, #dbeafe);
}

.n-file-upload--dragging {
  border-color: var(--color-primary-500, #3b82f6);
  background-color: var(--color-primary-50, #eff6ff);
}

.n-file-upload--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.n-file-upload__input {
  display: none;
}

.n-file-upload__placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2, 0.5rem);
}

.n-file-upload__icon {
  color: var(--color-neutral-400, #a3a3a3);
}

.n-file-upload--dragging .n-file-upload__icon,
.n-file-upload:hover:not(.n-file-upload--disabled) .n-file-upload__icon {
  color: var(--color-primary-500, #3b82f6);
}

.n-file-upload__text {
  font-size: var(--font-fontSize-base, 1rem);
  color: var(--color-neutral-600, #525252);
  margin: 0;
}

.n-file-upload__link {
  color: var(--color-primary-600, #2563eb);
  font-weight: var(--font-fontWeight-medium, 500);
  text-decoration: underline;
}

.n-file-upload__hint {
  font-size: var(--font-fontSize-xs, 0.75rem);
  color: var(--color-neutral-400, #a3a3a3);
  margin: 0;
}

.n-file-upload__files {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2, 0.5rem);
  text-align: left;
}

.n-file-upload__file {
  display: flex;
  align-items: center;
  gap: var(--spacing-2, 0.5rem);
  padding: var(--spacing-2, 0.5rem) var(--spacing-3, 0.75rem);
  background-color: var(--color-neutral-50, #fafafa);
  border-radius: var(--radius-md, 0.375rem);
  border: var(--borderWidth-1, 1px) solid var(--color-neutral-200, #e5e5e5);
}

.n-file-upload__file-icon {
  color: var(--color-neutral-400, #a3a3a3);
  flex-shrink: 0;
}

.n-file-upload__file-name {
  flex: 1;
  font-size: var(--font-fontSize-sm, 0.875rem);
  color: var(--color-neutral-800, #262626);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.n-file-upload__file-size {
  font-size: var(--font-fontSize-xs, 0.75rem);
  color: var(--color-neutral-400, #a3a3a3);
  flex-shrink: 0;
}

.n-file-upload__file-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  border-radius: var(--radius-sm, 0.25rem);
  cursor: pointer;
  color: var(--color-neutral-400, #a3a3a3);
  transition: all var(--transition-fast, 150ms ease);
  flex-shrink: 0;
  padding: 0;
}

.n-file-upload__file-remove:hover {
  background-color: var(--color-error-50, #fef2f2);
  color: var(--color-error-500, #ef4444);
}
</style>
