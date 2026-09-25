/**
 * Mode intégré à l'application — CDC Centre d'aide V1 §1.1, GAP-09,
 * MOB-01 à MOB-03.
 *
 * L'application ouvre le Centre d'aide avec `?integre=app` dans une vue
 * intégrée (WebView ou cadre). Dans ce mode :
 *   · l'en-tête et le pied de page du site, inutiles, disparaissent (MOB-02) ;
 *   · recherche, navigation et contact restent disponibles (MOB-02) ;
 *   · « Retour à Verebona » rend la main à l'application sans ouvrir de nouvel
 *     onglet (MOB-03).
 *
 * Le paramètre suit la navigation interne, comme `?mode=` en préproduction :
 * une page ouverte depuis l'application reste intégrée jusqu'au retour.
 */
import { computed, ref } from 'vue'
import type { LocationQuery, LocationQueryRaw, Router } from 'vue-router'
import { EMBED_PARAM, EMBED_VALUE } from './config'
import { appUrl } from '../config/urls'

const embedded = ref(false)

function isEmbedQuery(q: LocationQuery): boolean {
  return q[EMBED_PARAM] === EMBED_VALUE
}

export function installEmbedGuard(router: Router): void {
  router.beforeEach((to, from) => {
    if (isEmbedQuery(to.query)) { embedded.value = true; return true }
    // Première navigation sans le paramètre : pas intégré.
    if (!from.matched.length || !embedded.value) { embedded.value = false; return true }
    return { path: to.path, hash: to.hash, query: { ...to.query, [EMBED_PARAM]: EMBED_VALUE } }
  })
}

/** Paramètre à ajouter aux liens internes pour rester en mode intégré. */
export function embedQuery(): LocationQueryRaw {
  return embedded.value ? { [EMBED_PARAM]: EMBED_VALUE } : {}
}

/** Message envoyé à l'application qui encadre la page. */
export const CLOSE_MESSAGE = { type: 'verebona:help:close' } as const

/**
 * Rend la main à l'application (MOB-03).
 *
 * Dans un cadre : l'application écoute ce message et ferme la vue intégrée.
 * Dans une WebView native : la navigation vers l'URL de l'application est
 * interceptée par l'hôte. Jamais de nouvel onglet.
 */
export function backToApp(): void {
  const target = appUrl('/')
  if (window.parent !== window) {
    window.parent.postMessage(CLOSE_MESSAGE, new URL(target).origin)
    return
  }
  window.location.assign(appUrl('/accueil'))
}

/**
 * Page affichée dans un cadre (iframe) plutôt qu'en page principale.
 *
 * A11Y-01 / A11Y-04 (point d'UX de l'audit) : l'application encadre le site
 * (`/aide` de l'app, `?integre=app`) sous SA PROPRE barre « Retour à Verebona
 * · Centre d'aide ». Notre barre s'y ajoutait : deux barres, deux titres, deux
 * boutons de retour sur mobile. Quand un hôte encadre la page, c'est lui qui
 * porte le retour ; notre barre ne reste que pour une WebView native, qui
 * charge le site en page principale et n'a pas d'autre moyen de revenir.
 *
 * Lu une fois dans le navigateur ; faux au pré-rendu (pas de `window`).
 * Comparer `window.top` est permis même entre origines différentes.
 */
function detectFramed(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.self !== window.top
  } catch {
    // Accès refusé par le navigateur : on est forcément dans un cadre.
    return true
  }
}

const framed = ref(detectFramed())

export function useEmbed() {
  return {
    embedded: computed(() => embedded.value),
    /** Barre « Retour à Verebona » du site : intégré ET pas déjà sous la barre de l'hôte. */
    showEmbedBar: computed(() => embedded.value && !framed.value),
    backToApp,
  }
}

/** Réservé aux tests. */
export function resetEmbed(): void {
  embedded.value = false
  framed.value = detectFramed()
}
