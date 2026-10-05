/**
 * ══════════════════════════════════════════════════════════════════════════
 * CHUNKS VITE OBSOLÈTES APRÈS DÉPLOIEMENT — PUB-PERF-04
 *
 * Les pages secondaires (aide, contact, pages légales, 404) sont chargées à
 * la demande. Un onglet ouvert AVANT un déploiement référence les fichiers
 * hachés de l'ancienne version (`/assets/HelpHomeView-<ancien>.js`) : ils ne
 * sont plus servis, `server.cjs` répond 404 (jamais la coquille HTML), et
 * l'import dynamique échoue.
 *
 * Reprise retenue :
 *   · UNE seule tentative automatique : chargement complet de l'URL VISÉE
 *     (chemin, recherche d'aide, `?mode=`, `?integre=`, parrainage), qui
 *     récupère le HTML et les fichiers de la nouvelle version ;
 *   · ensuite (ou si la tentative est impossible ou risquée) : un message de
 *     reprise explicite, avec un bouton — jamais de rechargement en boucle.
 *
 * Bornage : un marqueur horodaté en `sessionStorage` (chemin seul, sans
 * paramètre : le code de parrainage n'y est JAMAIS écrit, CDC parrainage
 * §4.2). Marqueur récent → pas de nouvelle tentative automatique. Stockage
 * indisponible → pas de tentative automatique du tout (le bornage ne serait
 * pas garanti) : message de reprise directement.
 *
 * Pas de rechargement automatique :
 *   · si une saisie est en cours sur la page affichée (formulaire de contact,
 *     retour d'article…) — la navigation a échoué, la page reste affichée
 *     avec la saisie intacte, et le message prévient de la perte ;
 *   · hors ligne (`navigator.onLine === false`) : recharger afficherait la
 *     page d'erreur du navigateur.
 *
 * Seules les erreurs de CHARGEMENT de module sont traitées : une erreur
 * d'exécution dans un module chargé n'est pas un fichier obsolète, et
 * recharger ne la corrigerait pas.
 *
 * Différent du rechargement global de l'application (verebona-app), non
 * borné : ne pas l'aligner sur celui-ci.
 * ══════════════════════════════════════════════════════════════════════════
 */
import type { Router } from 'vue-router'
import { REFERRAL_PARAM, getReferralCode } from './urls'

/** Clé du marqueur de tentative (valeur : `{ at, path }`, sans paramètre). */
export const RELOAD_MARKER_KEY = 'vb:stale-chunk-reload'

/**
 * Durée pendant laquelle une tentative récente interdit la suivante. Au-delà,
 * un nouvel échec (nouveau déploiement plus tard dans la session) a droit à
 * sa propre tentative.
 */
export const RELOAD_WINDOW_MS = 5 * 60 * 1000

/** Identifiant du message de reprise (un seul à la fois). */
export const RECOVERY_BANNER_ID = 'vb-stale-chunk-banner'

/**
 * Messages des navigateurs pour un module introuvable ou non chargé :
 * Chromium, Firefox, Safari, et le préchargement CSS/JS de Vite.
 */
const CHUNK_LOAD_ERROR = new RegExp(
  [
    'Failed to fetch dynamically imported module',
    'error loading dynamically imported module',
    'Importing a module script failed',
    'Unable to preload CSS',
    'Failed to load module script',
  ].join('|'),
  'i',
)

export function isChunkLoadError(err: unknown): boolean {
  if (!err) return false
  const message = typeof err === 'string' ? err : (err as { message?: unknown }).message
  return typeof message === 'string' && CHUNK_LOAD_ERROR.test(message)
}

export interface StaleChunkEnv {
  storage: Pick<Storage, 'getItem' | 'setItem'> | null
  document: Document
  /** Navigation complète vers l'URL donnée (chemin + query + hash). */
  navigate: (url: string) => void
  now: () => number
  online: () => boolean
}

function browserEnv(): StaleChunkEnv {
  let storage: StaleChunkEnv['storage'] = null
  try {
    const s = window.sessionStorage
    // Navigation privée stricte, stockage bloqué : l'accès ou l'écriture lève.
    s.setItem(`${RELOAD_MARKER_KEY}:test`, '1')
    s.removeItem(`${RELOAD_MARKER_KEY}:test`)
    storage = s
  } catch {
    storage = null
  }
  return {
    storage,
    document: window.document,
    navigate: (url) => window.location.assign(url),
    now: () => Date.now(),
    online: () => (typeof navigator === 'undefined' ? true : navigator.onLine !== false),
  }
}

/**
 * URL de reprise : celle visée, avec le code de parrainage du parcours s'il
 * n'y figure plus (il ne vit qu'en mémoire et serait perdu au rechargement,
 * CDC parrainage §4.3 : il ne circule que par l'URL ou la mémoire).
 */
export function recoveryUrl(target: string): string {
  const code = getReferralCode()
  const url = new URL(target, 'http://x')
  if (code && !url.searchParams.has(REFERRAL_PARAM)) url.searchParams.set(REFERRAL_PARAM, code)
  return `${url.pathname}${url.search}${url.hash}`
}

/** Une saisie non envoyée est-elle présente sur la page ? */
export function hasPendingInput(doc: Document): boolean {
  const fields = doc.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
    'input, textarea, select',
  )
  for (const f of Array.from(fields)) {
    if (f instanceof HTMLInputElement) {
      if (['hidden', 'submit', 'button', 'reset', 'image'].includes(f.type)) continue
      // Champ de recherche d'aide : la requête est dans l'URL, conservée.
      if (f.type === 'search') continue
      if (f.type === 'checkbox' || f.type === 'radio') {
        if (f.checked !== f.defaultChecked) return true
      } else if (f.value !== f.defaultValue) return true
    } else if (f instanceof HTMLTextAreaElement) {
      if (f.value !== f.defaultValue) return true
    } else if (f instanceof HTMLSelectElement) {
      // Choix par défaut : l'option marquée `selected` dans le HTML, sinon la
      // première (cas d'un `v-model` initialisé sur l'option « Choisir… »).
      const options = Array.from(f.options)
      const initial = options.filter((o) => o.defaultSelected)
      const expected = initial.length ? initial : f.multiple ? [] : options.slice(0, 1)
      if (options.some((o) => o.selected !== expected.includes(o))) return true
    }
  }
  return false
}

function recentAttempt(env: StaleChunkEnv): boolean {
  try {
    const raw = env.storage?.getItem(RELOAD_MARKER_KEY)
    if (!raw) return false
    const at = Number((JSON.parse(raw) as { at?: unknown }).at)
    return Number.isFinite(at) && env.now() - at < RELOAD_WINDOW_MS
  } catch {
    // Marqueur illisible : prudence, on le considère comme récent.
    return true
  }
}

function markAttempt(env: StaleChunkEnv, target: string): boolean {
  if (!env.storage) return false
  try {
    env.storage.setItem(RELOAD_MARKER_KEY, JSON.stringify({ at: env.now(), path: new URL(target, 'http://x').pathname }))
    return true
  } catch {
    return false
  }
}

/** Message de reprise : accessible, sans dépendance au rendu Vue. */
export function showRecoveryBanner(env: StaleChunkEnv, target: string, pendingInput: boolean): void {
  const doc = env.document
  if (doc.getElementById(RECOVERY_BANNER_ID)) return
  const banner = doc.createElement('div')
  banner.id = RECOVERY_BANNER_ID
  banner.setAttribute('role', 'alert')
  banner.style.cssText =
    'position:fixed;left:16px;right:16px;bottom:16px;z-index:10000;max-width:560px;margin:0 auto;' +
    'padding:14px 16px;border-radius:12px;background:#1f2937;color:#fff;font:inherit;' +
    'box-shadow:0 8px 24px rgba(0,0,0,.25);display:flex;flex-wrap:wrap;gap:10px;align-items:center'

  const text = doc.createElement('p')
  text.style.cssText = 'margin:0;flex:1 1 260px;line-height:1.4'
  text.textContent = pendingInput
    ? 'Une nouvelle version du site est disponible et cette page n’a pas pu s’ouvrir. ' +
      'Recharger affichera la page demandée, mais votre saisie en cours sera perdue.'
    : 'Une nouvelle version du site est disponible et cette page n’a pas pu s’ouvrir. ' +
      'Rechargez pour continuer.'

  const reload = doc.createElement('button')
  reload.type = 'button'
  reload.textContent = 'Recharger la page'
  reload.style.cssText =
    'padding:8px 14px;border-radius:8px;border:0;background:#fff;color:#111827;font:inherit;font-weight:600;cursor:pointer'
  reload.addEventListener('click', () => {
    markAttempt(env, target)
    env.navigate(recoveryUrl(target))
  })

  const close = doc.createElement('button')
  close.type = 'button'
  close.textContent = 'Fermer'
  close.style.cssText =
    'padding:8px 14px;border-radius:8px;border:1px solid rgba(255,255,255,.6);background:transparent;color:#fff;font:inherit;cursor:pointer'
  close.addEventListener('click', () => banner.remove())

  banner.append(text, reload, close)
  doc.body.appendChild(banner)
  reload.focus()
}

export type RecoveryOutcome = 'reload' | 'banner' | 'ignored'

/**
 * Décide de la reprise après l'échec de chargement d'un module.
 * `target` : URL à atteindre (chemin + query + hash).
 */
export function recoverFromStaleChunk(env: StaleChunkEnv, target: string): RecoveryOutcome {
  if (env.document.getElementById(RECOVERY_BANNER_ID)) return 'ignored'
  const pendingInput = hasPendingInput(env.document)
  if (!pendingInput && env.online() && !recentAttempt(env) && markAttempt(env, target)) {
    env.navigate(recoveryUrl(target))
    return 'reload'
  }
  showRecoveryBanner(env, target, pendingInput)
  return 'banner'
}

/**
 * Branche la reprise sur le routeur et sur l'événement `vite:preloadError`.
 *
 * · `router.onError` : échec du composant d'une route paresseuse — la cible
 *   (`to.fullPath`) est connue, c'est elle qui est rechargée.
 * · `vite:preloadError` : émis par Vite pour tout import dynamique (route ou
 *   composant asynchrone dans une page). L'erreur n'est PAS annulée : elle
 *   suit son cours jusqu'au routeur, qui connaît la cible. Le traitement est
 *   différé d'une tâche pour lui laisser la main ; à défaut (composant
 *   asynchrone hors navigation), l'URL courante est reprise.
 *
 * Une seule décision par page : la première l'emporte.
 */
export function installStaleChunkRecovery(router: Router, makeEnv: () => StaleChunkEnv = browserEnv): void {
  if (typeof window === 'undefined') return
  let handled = false
  let env: StaleChunkEnv | null = null
  const handle = (target: string) => {
    if (handled) return
    handled = true
    env ??= makeEnv()
    recoverFromStaleChunk(env, target)
  }

  router.onError((err, to) => {
    if (isChunkLoadError(err)) handle(to.fullPath)
  })

  window.addEventListener('vite:preloadError', (event) => {
    const err = (event as Event & { payload?: unknown }).payload
    if (err !== undefined && !isChunkLoadError(err)) return
    setTimeout(() => {
      const { pathname, search, hash } = window.location
      handle(`${pathname}${search}${hash}`)
    }, 0)
  })
}
