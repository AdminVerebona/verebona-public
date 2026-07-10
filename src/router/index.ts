import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/aide', name: 'help', component: () => import('../views/HelpView.vue') },
  { path: '/contact', name: 'contact', component: () => import('../views/ContactView.vue') },
  { path: '/mentions-legales', name: 'legal-mentions', component: () => import('../views/LegalView.vue') },
  { path: '/cgu', name: 'legal-cgu', component: () => import('../views/LegalView.vue') },
  { path: '/confidentialite', name: 'legal-confid', component: () => import('../views/LegalView.vue') },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('../views/NotFoundView.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
})

export default router
