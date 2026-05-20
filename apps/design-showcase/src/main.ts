import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import '@imjohnkoo/design-vue/style.css'
import App from './App.vue'
import './style.css'

import OverviewView from './views/OverviewView.vue'
import EsimmanyView from './views/EsimmanyView.vue'
import ElementsView from './views/ElementsView.vue'
import FormView from './views/FormView.vue'
import FeedbackView from './views/FeedbackView.vue'
import OverlayView from './views/OverlayView.vue'
import LayoutView from './views/LayoutView.vue'
import UtilityView from './views/UtilityView.vue'
import AdminView from './views/AdminView.vue'

const routes = [
  { path: '/', name: 'Overview', component: OverviewView },
  { path: '/esimmany', name: 'Esimmany', component: EsimmanyView },
  { path: '/elements', name: 'Elements', component: ElementsView },
  { path: '/form', name: 'Form', component: FormView },
  { path: '/feedback', name: 'Feedback', component: FeedbackView },
  { path: '/overlay', name: 'Overlay', component: OverlayView },
  { path: '/layout', name: 'Layout', component: LayoutView },
  { path: '/utility', name: 'Utility', component: UtilityView },
  { path: '/admin', name: 'Admin', component: AdminView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const app = createApp(App)
app.use(router)
app.mount('#app')
