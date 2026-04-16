import './assets/main.css'

import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import ui from '@nuxt/ui/vue-plugin'
import App from './App.vue'

// Import design-vue styles (design tokens + component CSS)
import '@imjohnkoo/design-vue/style.css'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      component: () => import('./pages/LoginPage.vue'),
    },
    {
      path: '/',
      component: () => import('./pages/DashboardPage.vue'),
    },
    {
      path: '/users',
      component: () => import('./pages/UsersPage.vue'),
    },
    {
      path: '/products',
      component: () => import('./pages/ProductsPage.vue'),
    },
    {
      path: '/settings',
      component: () => import('./pages/SettingsPage.vue'),
    },
    {
      path: '/components',
      component: () => import('./pages/ComponentsPage.vue'),
    },
    // Design System component showcase pages
    {
      path: '/ds/layout',
      component: () => import('./pages/ds/LayoutPage.vue'),
    },
    {
      path: '/ds/element',
      component: () => import('./pages/ds/ElementPage.vue'),
    },
    {
      path: '/ds/form',
      component: () => import('./pages/ds/FormPage.vue'),
    },
    {
      path: '/ds/data',
      component: () => import('./pages/ds/DataPage.vue'),
    },
    {
      path: '/ds/navigation',
      component: () => import('./pages/ds/NavigationPage.vue'),
    },
    {
      path: '/ds/overlay',
      component: () => import('./pages/ds/OverlayPage.vue'),
    },
  ],
})

const app = createApp(App)
app.use(router)
app.use(ui)
app.mount('#app')
