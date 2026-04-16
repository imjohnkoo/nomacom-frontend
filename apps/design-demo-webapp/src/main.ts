import './assets/main.css'

import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import ui from '@nuxt/ui/vue-plugin'
import App from './App.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      component: () => import('./pages/LoginPage.vue'),
    },
    {
      path: '/feed',
      component: () => import('./pages/FeedPage.vue'),
    },
    {
      path: '/chat',
      component: () => import('./pages/ChatPage.vue'),
    },
    {
      path: '/profile',
      component: () => import('./pages/ProfilePage.vue'),
    },
    {
      path: '/settings',
      component: () => import('./pages/SettingsPage.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/feed',
    },
  ],
})

const app = createApp(App)
app.use(router)
app.use(ui)
app.mount('#app')
