import { createMemoryHistory, createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { captureReferralCode, signupUrl } from '../config/urls'
import { installSiteModeGuard, useSiteMode } from '../config/site'
import { installCanonicalGuard } from '../config/canonical'
import { installHeadGuard } from '../config/head'
import { installEmbedGuard } from '../help/embed'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  // ══════════════════════════════════════════════════════════════════════════
  // CENTRE D'AIDE — CDC Centre d'aide V1
  //
  // Les articles viennent du corpus `src/content/aide/`, seule source (§2).
  // `/aide/theme/…` est réservé : aucun article ne peut porter le slug
  // « theme » (validation de build).
  // ══════════════════════════════════════════════════════════════════════════
  { path: '/aide', name: 'help', component: () => import('../views/help/HelpHomeView.vue') },
  { path: '/aide/theme/:category', name: 'help-category', component: () => import('../views/help/HelpCategoryView.vue') },
  { path: '/aide/:slug', name: 'help-article', component: () => import('../views/help/HelpArticleView.vue') },
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
  //
  // PRE-LANCEMENT (CDC pre-lancement §7) : aucun chemin du site public ne doit
  // mener a l'inscription. En PRELAUNCH, le visiteur est renvoye sur l'accueil.
  // ══════════════════════════════════════════════════════════════════════════
  {
    path: '/inscription',
    name: 'signup-redirect',
    beforeEnter: (to: { fullPath: string }) => {
      if (useSiteMode().isPrelaunch.value) {
        return { name: 'home', replace: true }
      }
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
  // Hors navigateur (pré-rendu de l'accueil au build, voir
  // scripts/prerender.mjs) : historique en mémoire, sans accès à `window`.
  history: typeof window === 'undefined' ? createMemoryHistory() : createWebHistory(),
  routes,
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
})

/**
 * Previsualisation FULL / PRELAUNCH (preprod uniquement) : le parametre
 * `?mode=` est conserve sur toutes les navigations internes. Sans effet en
 * production. Voir `src/config/site.ts`.
 */
installSiteModeGuard(router)

/**
 * Mode intégré à l'application (`?integre=app`) : conservé sur toutes les
 * navigations internes. Voir `src/help/embed.ts`.
 */
installEmbedGuard(router)

/**
 * Balise canonical propre à chaque route — CDC Sitemap §7.
 *
 * Sans cela, `/aide` hérite du canonical de `index.html` et se déclare
 * elle-même comme une copie de l'accueil : la déclarer dans le sitemap
 * n'aurait alors servi à rien. Voir `src/config/canonical.ts`.
 */
installCanonicalGuard(router)

/**
 * Titre et meta description propres à chaque route : le titre de l'accueil
 * ne s'applique plus aux autres pages. Voir `src/config/head.rules.ts`.
 */
installHeadGuard(router)

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
