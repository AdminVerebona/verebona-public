import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { captureReferralCode, signupUrl } from '../config/urls'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/aide', name: 'help', component: () => import('../views/HelpView.vue') },
  { path: '/contact', name: 'contact', component: () => import('../views/ContactView.vue') },
  { path: '/mentions-legales', name: 'legal-mentions', component: () => import('../views/LegalView.vue') },
  { path: '/cgu', name: 'legal-cgu', component: () => import('../views/LegalView.vue') },
  { path: '/confidentialite', name: 'legal-confid', component: () => import('../views/LegalView.vue') },

  // ══════════════════════════════════════════════════════════════════════════
  // POINT D'ENTREE DU PARRAINAGE — CDC parrainage §4.1
  //
  // Le lien de parrainage documente est `https://verebona.fr/inscription?ref=…`.
  // Cette route n'existait pas : le lien tombait sur la page 404 de la vitrine,
  // et le code etait perdu avant meme d'avoir servi.
  //
  // L'inscription se fait sur l'application (app.verebona.fr) : cette route est
  // donc une simple redirection, avec propagation explicite du code (§4.4).
  // ══════════════════════════════════════════════════════════════════════════
  {
    path: '/inscription',
    name: 'signup-redirect',
    beforeEnter: (to: { fullPath: string }) => {
      // Le code est lu depuis l'URL d'arrivee avant la redirection.
      captureReferralCode(to.fullPath.split('?')[1] ?? '')
      window.location.replace(signupUrl())
      return false
    },
    component: HomeView, // jamais rendu : `beforeEnter` redirige toujours
  },

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

/**
 * Le code de parrainage est relu a chaque navigation.
 *
 * Il n'est ecrit nulle part dans le navigateur (CDC §4.2) : il vit uniquement
 * en memoire, le temps du parcours. Une navigation interne qui perd le
 * parametre d'URL ne perd donc pas le code, mais la fermeture de l'onglet si —
 * c'est le comportement attendu (§4.6).
 */
router.afterEach((to) => {
  captureReferralCode(to.fullPath.split('?')[1] ?? '')
})

export default router
