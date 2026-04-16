<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const tabs = [
  { key: 'feed', label: '피드', icon: 'i-lucide-newspaper', path: '/feed' },
  { key: 'chat', label: '채팅', icon: 'i-lucide-message-circle', path: '/chat' },
  { key: 'profile', label: '프로필', icon: 'i-lucide-user', path: '/profile' },
]

function isActive(path: string) {
  if (path === '/profile' && route.path === '/settings') return true
  return route.path === path
}

function navigate(path: string) {
  router.push(path)
}

const hideTabs = ['/settings']
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Page content -->
    <div class="flex-1 overflow-y-auto">
      <RouterView />
    </div>

    <!-- Bottom tab bar -->
    <nav
      v-if="!hideTabs.includes(route.path)"
      class="flex items-center border-t border-(--ui-border) bg-white px-2 pb-[env(safe-area-inset-bottom)]"
    >
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="flex-1 flex flex-col items-center gap-0.5 py-2 transition-colors"
        :class="isActive(tab.path) ? 'text-blue-600' : 'text-zinc-400'"
        @click="navigate(tab.path)"
      >
        <UIcon :name="tab.icon" class="size-5" />
        <span class="text-[10px] font-medium">{{ tab.label }}</span>
      </button>
    </nav>
  </div>
</template>
