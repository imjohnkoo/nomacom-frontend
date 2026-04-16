<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const mainNav = [
  { label: '대시보드', icon: 'i-lucide-layout-dashboard', to: '/' },
  { label: '사용자', icon: 'i-lucide-users', to: '/users' },
  { label: '상품', icon: 'i-lucide-package', to: '/products' },
]

const dsNav = [
  { label: 'Layout', icon: 'i-lucide-layout-template', to: '/ds/layout' },
  { label: 'Element', icon: 'i-lucide-square', to: '/ds/element' },
  { label: 'Form', icon: 'i-lucide-text-cursor-input', to: '/ds/form' },
  { label: 'Data', icon: 'i-lucide-table-2', to: '/ds/data' },
  { label: 'Navigation', icon: 'i-lucide-compass', to: '/ds/navigation' },
  { label: 'Overlay', icon: 'i-lucide-layers', to: '/ds/overlay' },
]

const bottomNav = [
  { label: '설정', icon: 'i-lucide-settings', to: '/settings' },
  { label: '컴포넌트 (Nuxt UI)', icon: 'i-lucide-component', to: '/components' },
]

function isActive(to: string) {
  return route.path === to
}

const allNav = [...mainNav, ...dsNav, ...bottomNav]
const currentPageLabel = computed(() => {
  return allNav.find((item) => item.to === route.path)?.label ?? ''
})

const sidebarOpen = ref(true)
</script>

<template>
  <div class="flex h-screen bg-(--ui-bg)">
    <!-- Sidebar -->
    <aside
      v-if="sidebarOpen"
      class="w-64 border-r border-(--ui-border) bg-(--ui-bg-elevated) flex flex-col"
    >
      <!-- Logo -->
      <div class="h-16 flex items-center px-6 border-b border-(--ui-border)">
        <span class="text-lg font-bold text-(--ui-text-highlighted)">Nomacom</span>
        <UBadge variant="subtle" size="xs" class="ml-2">Design System</UBadge>
      </div>

      <!-- Nav -->
      <nav class="flex-1 p-4 flex flex-col overflow-y-auto">
        <!-- Main section -->
        <div class="space-y-1">
          <UButton
            v-for="item in mainNav"
            :key="item.label"
            :label="item.label"
            :icon="item.icon"
            :variant="isActive(item.to) ? 'soft' : 'ghost'"
            :color="isActive(item.to) ? 'primary' : 'neutral'"
            block
            class="justify-start"
            @click="router.push(item.to)"
          />
        </div>

        <!-- DS Components section -->
        <div class="mt-6 mb-2">
          <p class="text-[10px] font-semibold text-(--ui-text-muted) uppercase tracking-wider px-2.5">
            Design Vue
          </p>
        </div>
        <div class="space-y-0.5">
          <UButton
            v-for="item in dsNav"
            :key="item.label"
            :label="item.label"
            :icon="item.icon"
            :variant="isActive(item.to) ? 'soft' : 'ghost'"
            :color="isActive(item.to) ? 'primary' : 'neutral'"
            block
            size="sm"
            class="justify-start"
            @click="router.push(item.to)"
          />
        </div>

        <!-- Spacer -->
        <div class="flex-1" />

        <!-- Bottom -->
        <div class="space-y-1 mt-4">
          <UButton
            v-for="item in bottomNav"
            :key="item.label"
            :label="item.label"
            :icon="item.icon"
            :variant="isActive(item.to) ? 'soft' : 'ghost'"
            :color="isActive(item.to) ? 'primary' : 'neutral'"
            block
            class="justify-start"
            @click="router.push(item.to)"
          />
        </div>
      </nav>

      <!-- Footer -->
      <div class="p-4 border-t border-(--ui-border)">
        <div class="flex items-center gap-3">
          <UAvatar text="JK" size="sm" />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-(--ui-text-highlighted) truncate">John Koo</p>
            <p class="text-xs text-(--ui-text-muted) truncate">admin@nomacom.io</p>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <header class="h-16 border-b border-(--ui-border) flex items-center justify-between px-6">
        <div class="flex items-center gap-4">
          <UButton
            :icon="sidebarOpen ? 'i-lucide-panel-left-close' : 'i-lucide-panel-left-open'"
            variant="ghost"
            color="neutral"
            @click="sidebarOpen = !sidebarOpen"
          />
          <UBreadcrumb
            :items="[
              { label: 'Home', icon: 'i-lucide-house' },
              { label: currentPageLabel },
            ]"
          />
        </div>
        <div class="flex items-center gap-2">
          <UButton icon="i-lucide-bell" variant="ghost" color="neutral" />
          <UButton icon="i-lucide-settings" variant="ghost" color="neutral" />
        </div>
      </header>

      <!-- Content -->
      <main class="flex-1 overflow-y-auto p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
