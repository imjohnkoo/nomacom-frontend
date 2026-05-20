<template>
  <!-- Admin route uses its own full-page layout -->
  <template v-if="$route.path.startsWith('/admin')">
    <router-view />
  </template>

  <div v-else class="showcase-layout">
    <aside class="showcase-sidebar">
      <div class="showcase-sidebar__logo">
        Nomacom DS
        <span>Design System Showcase</span>
      </div>
      <nav class="showcase-nav">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          :class="[
            'showcase-nav__link',
            { 'showcase-nav__link--active': $route.path === item.path },
          ]"
        >
          {{ item.label }}
        </router-link>
      </nav>
    </aside>

    <main class="showcase-main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
const navItems = [
  { path: '/', label: 'Overview' },
  { path: '/esimmany', label: 'Esimmany Patterns' },
  { path: '/elements', label: 'Elements' },
  { path: '/form', label: 'Form' },
  { path: '/feedback', label: 'Feedback' },
  { path: '/overlay', label: 'Overlay' },
  { path: '/layout', label: 'Layout' },
  { path: '/utility', label: 'Utility' },
  { path: '/admin', label: 'Admin Dashboard' },
]
</script>
