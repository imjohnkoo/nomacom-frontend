<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from './layouts/AppLayout.vue'

const route = useRoute()

onMounted(() => {
  document.documentElement.classList.remove('dark')
  document.documentElement.style.colorScheme = 'light'
})
</script>

<template>
  <UApp>
    <template v-if="route.path === '/login'">
      <RouterView />
    </template>
    <template v-else>
      <AppLayout>
        <RouterView />
      </AppLayout>
    </template>
  </UApp>
</template>
