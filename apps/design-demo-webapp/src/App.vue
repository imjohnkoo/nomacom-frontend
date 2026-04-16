<script setup lang="ts">
import { watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from './composables/useAuth'
import MobileShell from './layouts/MobileShell.vue'
import MainLayout from './layouts/MainLayout.vue'

const route = useRoute()
const router = useRouter()
const { isAuthenticated } = useAuth()

onMounted(() => {
  document.documentElement.classList.remove('dark')
  document.documentElement.style.colorScheme = 'light'
})

// Auth guard
watch(
  () => route.path,
  (path) => {
    if (!isAuthenticated.value && path !== '/login') {
      router.replace('/login')
    }
  },
  { immediate: true },
)
</script>

<template>
  <UApp>
    <MobileShell>
      <template v-if="route.path === '/login'">
        <RouterView />
      </template>
      <template v-else>
        <MainLayout />
      </template>
    </MobileShell>
  </UApp>
</template>
