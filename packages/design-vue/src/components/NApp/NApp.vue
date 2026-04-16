<template>
  <div :class="['n-app', `n-app--${themeMode}`]" :data-theme="themeMode">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { provideTheme } from '../../composables'

export interface NAppProps {
  defaultMode?: 'light' | 'dark'
}

const props = withDefaults(defineProps<NAppProps>(), {
  defaultMode: 'light',
})

const themeMode = ref<'light' | 'dark'>(props.defaultMode)

function toggle() {
  themeMode.value = themeMode.value === 'light' ? 'dark' : 'light'
}

provideTheme({ mode: themeMode, toggle })
</script>

<style scoped>
.n-app {
  font-family: var(--font-fontFamily-sans, sans-serif);
  color: var(--color-neutral-900, #171717);
  background-color: var(--color-neutral-0, #ffffff);
  min-height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
