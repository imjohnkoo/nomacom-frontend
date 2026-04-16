<template>
  <div :class="['n-theme', `n-theme--${themeMode}`]" :data-theme="themeMode">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { provideTheme } from '../../composables'

export interface NThemeNewProps {
  mode?: 'light' | 'dark'
}

const props = withDefaults(defineProps<NThemeNewProps>(), {
  mode: 'light',
})

const themeMode = ref<'light' | 'dark'>(props.mode)

watch(
  () => props.mode,
  (val) => {
    themeMode.value = val
  }
)

function toggle() {
  themeMode.value = themeMode.value === 'light' ? 'dark' : 'light'
}

provideTheme({ mode: themeMode, toggle })
</script>

<style scoped>
.n-theme {
  display: contents;
}
</style>
