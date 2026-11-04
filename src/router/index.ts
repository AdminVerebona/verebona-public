import { createMemoryHistory, createRouter, createWebHistory, type RouteLocationGeneric, type RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { captureReferralCode, signupUrl } from '../config/urls'
import { installSiteModeGuard, useSiteMode } from '../config/site'
import { installCanonicalGuard } from '../config/canonical'
import { installHeadGuard } from '../config/head'
import { installEmbedGuard } from '../help/embed'
import { installStaleChunkRecovery } from '../config/stale-chunk'
// Lot 72 : chemins tenus dans une table pure, lue aussi par le build et
// `server.cjs` (vraies 404) et par l'inventaire des liens de l'application.
import { ROUTE_PATHS } from './route-paths'
import { LEGACY_REDIRECTS } from '../config/legacy-routes.rules'

const LegalView = () => import('../views/LegalView.vue')

/**
 * Anciennes adresses (chantier 104P) : la 301 est faite par `server.cjs` ; ces
 * enregistrements couvrent la navigation interne (lien resté dans un ancien
 * onglet, historique). Même table que le serveur, cible toujours finale
 * (jamais une autre ancienne adresse : pas de boucle, contrôlé au build).
 */
const legacyRoutes: RouteRecordRaw[] = Object.entries(LEGACY_REDIRECTS).map(([from, to]) => {
  const hashAt = to.indexOf('#')
  const base = hashAt === -1 ? to : to.slice(0, hashAt)
  const hash = hashAt === -1 ? '' : to.slice(hashAt)
  return { path: from, redirect: (r: RouteLocationGeneric) => ({ path: base || '/', query: r.query, hash }) }
})

const routes = [
  { path: ROUTE_PATHS.home, name: 'home', component: HomeView },
  // ══════════════════════════════════════════════════════════════════════════
  // CENTRE D'AIDE — CDC Centre d'aide V1
  //
  // Les articles viennent du corpus `src/content/aide/`, seule source (§2).
  // `/aide/theme/…` est réservé : aucun article ne peut porter le slug
  // « theme » (validation de build).
  // ══════════════════════════════════════════════════════════════════════════
  { path: ROUTE_PATHS.help, name: 'help', component: () => import('../views/help/HelpHomeView.vue') },
  { path: ROUTE_PATHS['help-category'], name: 'help-category', component: () => import('../views/help/HelpCategoryView.vue') },
  { path: ROUTE_PATHS['help-article'], name: 'help-article', component: () => import('../views/help/HelpArticleView.vue') },
  // ══════════════════════════════════════════════════════════════════════════
  // RESSOURCES — CDC Ressources V6 §8
  //
  // Index et articles du corpus `src/content/ressources/`, seule source.
  // Aucune page de catégorie (les catégories sont des ancres de l'index).
  // ══════════════════════════════════════════════════════════════════════════
  { path: ROUTE_PATHS.ressources, name: 'ressources', component: () => import('../views/ressources/RessourcesIndexView.vue') },
  { path: ROUTE_PATHS['ressources-article'], name: 'ressources-article', component: () => import('../views/ressources/RessourceArticleView.vue') },
  { path: ROUTE_PATHS.contact, name: 'contact', component: () => import('../views/ContactView.vue') },
  // ══════════════════════════════════════════════════════════════════════════
  // RUBRIQUE « LÉGAL » — chantier 104P (contrat site public ↔ application § 2)
  //
  // Une page à onglets, une URL stable par onglet ; textes lus depuis
  // `src/content/legal/` (module `virtual:legal`), jamais en dur.
  // ══════════════════════════════════════════════════════════════════════════
  { path: ROUTE_PATHS['legal-mentions'], name: 'legal-mentions', component: LegalView, meta: { legalTab: 'mentions-legales' } },
  { path: ROUTE_PATHS['legal-cguv'], name: 'legal-cguv', component: LegalView, meta: { legalTab: 'cguv' } },
  { path: ROUTE_PATHS['legal-confid'], name: 'legal-confid', component: LegalView, meta: { legalTab: 'confidentialite' } },
  { path: ROUTE_PATHS['legal-sous-traitants'], name: 'legal-sous-traitants', component: LegalView, meta: { legalTab: 'sous-traitants' } },
  { path: ROUTE_PATHS['legal-parrainage'], name: 'legal-parrainage', component: LegalView, meta: { legalTab: 'parrainage' } },
  { path: ROUTE_PATHS['legal-cguv-version'], name: 'legal-cguv-version', component: LegalView, meta: { legalTab: 'cguv' } },
  ...legacyRoutes,

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
    path: ROUTE_PATHS['signup-redirect'],
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

  { path: ROUTE_PATHS['not-found'], name: 'not-found', component: () => import('../views/NotFoundView.vue') },
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
 * Page paresseuse d'une version précédente, retirée par un déploiement
 * (PUB-PERF-04) : une seule reprise automatique bornée, puis un message de
 * reprise explicite. Voir `src/config/stale-chunk.ts`.
 */
installStaleChunkRecovery(router)

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
