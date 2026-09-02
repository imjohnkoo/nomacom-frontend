<template>
  <!--
    Admin Dashboard 데모만 자체 풀페이지 레이아웃을 쓴다 (showcase 사이드바 없이).

    ⚠️ `startsWith('/admin')` 로 쓰면 안 된다 — `/admin-patterns` 처럼 접두가 같은
    형제 라우트까지 삼켜서 그 페이지의 내비게이션이 통째로 사라진다.
    하위 라우트가 생기면 `startsWith('/admin/')` (슬래시 포함) 를 OR 로 더할 것.
  -->
  <template v-if="isFullPageRoute">
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
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

/** showcase 셸(사이드바) 없이 통으로 렌더하는 라우트. 정확 일치로만 판정한다. */
const FULL_PAGE_ROUTES = ['/admin']
const isFullPageRoute = computed(() => FULL_PAGE_ROUTES.includes(route.path))

const navItems = [
  { path: '/', label: 'Overview' },
  { path: '/esimmany', label: 'Esimmany Patterns' },
  { path: '/elements', label: 'Elements' },
  { path: '/form', label: 'Form' },
  { path: '/feedback', label: 'Feedback' },
  { path: '/overlay', label: 'Overlay' },
  { path: '/layout', label: 'Layout' },
  { path: '/utility', label: 'Utility' },
  { path: '/admin-patterns', label: 'Admin Patterns' },
  { path: '/charts', label: 'Charts' },
  { path: '/admin', label: 'Admin Dashboard' },
]
</script>
