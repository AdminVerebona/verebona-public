/**
 * Mode d'affichage du site public — point d'entrée UNIQUE (CDC pré-lancement §4.2).
 *
 *   FULL       site définitif : connexion, création de compte, CTA de souscription
 *   PRELAUNCH  site public provisoire : mêmes contenus, CTA remplacés par des
 *              messages informatifs non cliquables
 *
 * Seul ce fichier lit les variables Vite liées au mode. Les composants
 * utilisent `useSiteMode()` et ne réimplémentent aucune règle.
 *
 * Règles (détail dans `site-mode.rules.ts`) :
 *   production           mode = VITE_DEFAULT_SITE_MODE (prelaunch si absent/invalide)
 *                        ?mode=… toujours ignoré
 *   preprod / development mode = VITE_DEFAULT_SITE_MODE (full si absent/invalide)
 *                        ?mode=full|prelaunch appliqué et conservé pendant la navigation
 *
 * ⚠️ Ce mécanisme règle l'affichage du site public. Ce n'est PAS un contrôle
 * de sécurité : l'accès à l'inscription doit être bloqué côté application.
 */
import { computed, ref } from 'vue'
import type { LocationQuery, LocationQueryRaw, LocationQueryValue, Router } from 'vue-router'
import {
  SITE_MODE_PARAM,
  allowsModeOverride,
  parseEnvironment,
  parseSiteMode,
  resolveDefaultMode,
  resolveSiteMode,
  type SiteMode,
} from './site-mode.rules'

export { SITE_MODE_PARAM, SITE_MODES } from './site-mode.rules'
export type { SiteEnvironment, SiteMode } from './site-mode.rules'

/* ── Configuration figée au build ──────────────────────────────────────── */

export const SITE_ENVIRONMENT = parseEnvironment(import.meta.env.VITE_ENVIRONMENT)
export const DEFAULT_SITE_MODE = resolveDefaultMode(SITE_ENVIRONMENT, import.meta.env.VITE_DEFAULT_SITE_MODE)
/** Vrai uniquement en préproduction et en local. */
export const CAN_PREVIEW_SITE_MODE = allowsModeOverride(SITE_ENVIRONMENT)

/* ── Libellés de référence (CDC §13) ───────────────────────────────────── */

export const PRELAUNCH_LABELS = {
  header: 'Ouverture prochaine',
  heroTitle: 'Verebona arrive bientôt',
  heroText: 'Nous préparons actuellement l\u2019ouverture du service.',
  pricing: 'Bientôt disponible',
  finalCta: 'Verebona arrive bientôt',
  finalCtaText: 'Le service ouvrira prochainement.',
} as const

/* ── État de prévisualisation (préprod uniquement) ─────────────────────── */

/**
 * Mode demandé explicitement par l'URL. Reste `null` en production, quelle
 * que soit l'URL. Vit en mémoire le temps de l'onglet : c'est le paramètre
 * d'URL, réinjecté à chaque navigation, qui porte le choix d'une page à
 * l'autre, au rechargement et dans un nouvel onglet (CDC §5.3, option 1).
 */
const previewMode = ref<SiteMode | null>(null)

const siteMode = computed<SiteMode>(() =>
  resolveSiteMode({
    environment: SITE_ENVIRONMENT,
    defaultMode: DEFAULT_SITE_MODE,
    requested: previewMode.value,
  }),
)

function firstValue(value: LocationQueryValue | LocationQueryValue[] | undefined): string | null {
  return Array.isArray(value) ? (value[0] ?? null) : (value ?? null)
}

/**
 * Met à jour la prévisualisation à partir des paramètres d'une URL.
 *
 * - paramètre absent  : le choix courant est conservé (navigation interne) ;
 * - `full`/`prelaunch` : il devient le choix courant ;
 * - autre valeur      : retour au mode par défaut (CDC §5.2).
 */
export function syncSiteModeFromQuery(query: LocationQuery): void {
  if (!CAN_PREVIEW_SITE_MODE) return
  if (!(SITE_MODE_PARAM in query)) return
  previewMode.value = parseSiteMode(firstValue(query[SITE_MODE_PARAM]))
}

function syncFromLocation(): void {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams(window.location.search)
  if (!params.has(SITE_MODE_PARAM)) return
  syncSiteModeFromQuery({ [SITE_MODE_PARAM]: params.get(SITE_MODE_PARAM) })
}

// Lecture synchrone dès le chargement : le premier rendu (header compris)
// affiche déjà la bonne variante, sans clignotement FULL -> PRELAUNCH.
syncFromLocation()

/**
 * Garde de navigation : conserve `?mode=` sur toutes les navigations internes
 * (menu, footer, fil d'Ariane, `router.push`…) sans modifier chaque appel.
 * Sans effet en production.
 */
export function installSiteModeGuard(router: Router): void {
  if (!CAN_PREVIEW_SITE_MODE) return
  router.beforeEach((to) => {
    syncSiteModeFromQuery(to.query)
    const mode = previewMode.value
    if (!mode || SITE_MODE_PARAM in to.query) return true
    return { path: to.path, hash: to.hash, query: { ...to.query, [SITE_MODE_PARAM]: mode } }
  })
}

/**
 * Paramètres à ajouter à un lien interne pour conserver la prévisualisation
 * (ouverture dans un nouvel onglet, copie de lien). Vide en production.
 * Lecture réactive : un lien rendu se met à jour quand le mode change.
 */
export function siteModeQuery(): LocationQueryRaw {
  return previewMode.value ? { [SITE_MODE_PARAM]: previewMode.value } : {}
}

/** Réinitialise la prévisualisation. Réservé aux tests. */
export function resetSiteModePreview(): void {
  previewMode.value = null
}

/* ── Composable ────────────────────────────────────────────────────────── */

export function useSiteMode() {
  return {
    siteMode,
    isFull: computed(() => siteMode.value === 'full'),
    isPrelaunch: computed(() => siteMode.value === 'prelaunch'),
    environment: SITE_ENVIRONMENT,
    canPreview: CAN_PREVIEW_SITE_MODE,
    labels: PRELAUNCH_LABELS,
  }
}
