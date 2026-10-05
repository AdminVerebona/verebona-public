/**
 * Chunks Vite obsolètes après déploiement — PUB-PERF-04.
 *
 * Une seule reprise automatique bornée, message de reprise ensuite, saisie
 * et paramètres du parcours (recherche, parrainage, mode intégré) conservés.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import {
  RECOVERY_BANNER_ID,
  RELOAD_MARKER_KEY,
  RELOAD_WINDOW_MS,
  hasPendingInput,
  installStaleChunkRecovery,
  isChunkLoadError,
  recoverFromStaleChunk,
  type StaleChunkEnv,
} from '../src/config/stale-chunk'
import { clearReferralCode, captureReferralCode } from '../src/config/urls'

function memoryStorage() {
  const m = new Map<string, string>()
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), m }
}

function makeEnv(over: Partial<StaleChunkEnv> = {}) {
  const storage = memoryStorage()
  let t = 1_000_000
  const env: StaleChunkEnv & { navigate: ReturnType<typeof vi.fn> } = {
    storage,
    document,
    navigate: vi.fn(),
    now: () => t,
    online: () => true,
    ...over,
  } as never
  return { env, storage, advance: (ms: number) => { t += ms } }
}

const staleError = () => new TypeError('Failed to fetch dynamically imported module: https://www.verebona.fr/assets/HelpHomeView-OLD.js')

beforeEach(() => {
  document.body.innerHTML = ''
  clearReferralCode()
})
afterEach(() => clearReferralCode())

describe('isChunkLoadError', () => {
  it('reconnaît les échecs de chargement de module (Chromium, Firefox, Safari, préchargement CSS)', () => {
    expect(isChunkLoadError(staleError())).toBe(true)
    expect(isChunkLoadError(new TypeError('error loading dynamically imported module: /assets/x.js'))).toBe(true)
    expect(isChunkLoadError(new TypeError('Importing a module script failed.'))).toBe(true)
    expect(isChunkLoadError(new Error('Unable to preload CSS for /assets/help-x.css'))).toBe(true)
  })

  it("ignore une erreur d'exécution : recharger ne la corrigerait pas", () => {
    expect(isChunkLoadError(new TypeError("Cannot read properties of undefined (reading 'x')"))).toBe(false)
    expect(isChunkLoadError(undefined)).toBe(false)
  })
})

describe('recoverFromStaleChunk', () => {
  it('première fois : une seule navigation complète vers la cible, paramètres conservés', () => {
    const { env, storage } = makeEnv()
    expect(recoverFromStaleChunk(env, '/aide?q=parrainage&integre=app#x')).toBe('reload')
    expect(env.navigate).toHaveBeenCalledTimes(1)
    expect(env.navigate).toHaveBeenCalledWith('/aide?q=parrainage&integre=app#x')
    // Le marqueur ne contient que le chemin, jamais de paramètre (parrainage, CDC §4.2).
    expect(JSON.parse(storage.m.get(RELOAD_MARKER_KEY)!)).toEqual({ at: 1_000_000, path: '/aide' })
  })

  it('aucune boucle : un nouvel échec juste après la reprise affiche le message (CA-01)', () => {
    const { env, advance } = makeEnv()
    recoverFromStaleChunk(env, '/contact')
    advance(2_000)
    // Page rechargée : nouvel état de page, même stockage de session.
    expect(recoverFromStaleChunk(env, '/contact')).toBe('banner')
    expect(env.navigate).toHaveBeenCalledTimes(1)
    const banner = document.getElementById(RECOVERY_BANNER_ID)!
    expect(banner.getAttribute('role')).toBe('alert')
    expect(banner.textContent).toContain('Recharger la page')
  })

  it('tentative ancienne (autre déploiement plus tard) : nouvelle reprise autorisée', () => {
    const { env, advance } = makeEnv()
    recoverFromStaleChunk(env, '/contact')
    advance(RELOAD_WINDOW_MS + 1)
    expect(recoverFromStaleChunk(env, '/aide')).toBe('reload')
  })

  it('stockage indisponible : pas de reprise automatique non bornée, message direct', () => {
    const { env } = makeEnv({ storage: null })
    expect(recoverFromStaleChunk(env, '/aide')).toBe('banner')
    expect(env.navigate).not.toHaveBeenCalled()
  })

  it('hors ligne : pas de rechargement vers une page d’erreur du navigateur', () => {
    const { env } = makeEnv({ online: () => false })
    expect(recoverFromStaleChunk(env, '/aide')).toBe('banner')
    expect(env.navigate).not.toHaveBeenCalled()
  })

  it('formulaire rempli : jamais de rechargement silencieux, avertissement explicite (CA-02)', () => {
    document.body.innerHTML = '<form><input type="text" value=""><textarea></textarea></form>'
    document.querySelector('textarea')!.value = 'Mon message'
    const { env } = makeEnv()
    expect(recoverFromStaleChunk(env, '/aide')).toBe('banner')
    expect(env.navigate).not.toHaveBeenCalled()
    expect(document.querySelector('textarea')!.value).toBe('Mon message')
    expect(document.getElementById(RECOVERY_BANNER_ID)!.textContent).toContain('saisie en cours sera perdue')
  })

  it('bouton de reprise : recharge la cible avec le code de parrainage du parcours (CA-03)', () => {
    captureReferralCode('?ref=AMI42')
    const { env } = makeEnv({ storage: null })
    recoverFromStaleChunk(env, '/aide/theme/compte?integre=app')
    const button = Array.from(document.querySelectorAll('button')).find((b) => b.textContent === 'Recharger la page')!
    button.click()
    expect(env.navigate).toHaveBeenCalledWith('/aide/theme/compte?integre=app&ref=AMI42')
  })

  it('un seul message à la fois', () => {
    const { env } = makeEnv({ storage: null })
    recoverFromStaleChunk(env, '/aide')
    expect(recoverFromStaleChunk(env, '/contact')).toBe('ignored')
    expect(document.querySelectorAll(`#${RECOVERY_BANNER_ID}`)).toHaveLength(1)
  })
})

describe('hasPendingInput', () => {
  it('formulaire vierge (sélecteur sur « Choisir… », recherche pré-remplie depuis l’URL) : rien en cours', () => {
    document.body.innerHTML =
      '<input type="search" value=""><select><option value="" disabled>Choisir…</option><option>Autre</option></select>' +
      '<input type="text"><textarea></textarea>'
    ;(document.querySelector('input[type=search]') as HTMLInputElement).value = 'parrainage'
    // Comme `v-model` sur `subject = ''` (ContactView) : l'option « Choisir… » est sélectionnée.
    document.querySelector('select')!.value = ''
    expect(hasPendingInput(document)).toBe(false)
  })

  it('choix modifié dans un sélecteur : saisie en cours', () => {
    document.body.innerHTML = '<select><option value="">Choisir…</option><option>Autre</option></select>'
    document.querySelector('select')!.selectedIndex = 1
    expect(hasPendingInput(document)).toBe(true)
  })
})

describe('installStaleChunkRecovery', () => {
  it('échec du composant d’une route paresseuse : reprise vers la route VISÉE, une seule fois', async () => {
    const { env } = makeEnv()
    const Home = { template: '<div/>' }
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: Home },
        { path: '/aide', component: () => Promise.reject(staleError()) },
      ],
    })
    installStaleChunkRecovery(router, () => env)
    await router.push('/')
    await expect(router.push('/aide?q=compte')).rejects.toThrow(/dynamically imported module/)
    // Navigation non validée : l'URL courante (et sa saisie) restent celles de la page affichée.
    expect(router.currentRoute.value.fullPath).toBe('/')
    expect(env.navigate).toHaveBeenCalledWith('/aide?q=compte')
    // Même page : un second échec ne déclenche rien de plus.
    await expect(router.push('/aide')).rejects.toThrow()
    expect(env.navigate).toHaveBeenCalledTimes(1)
  })

  it("erreur d'exécution d'une page : ni rechargement ni message", async () => {
    const { env } = makeEnv()
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: '<div/>' } },
        { path: '/contact', component: () => Promise.reject(new TypeError('x is not a function')) },
      ],
    })
    installStaleChunkRecovery(router, () => env)
    await router.push('/')
    await expect(router.push('/contact')).rejects.toThrow()
    expect(env.navigate).not.toHaveBeenCalled()
    expect(document.getElementById(RECOVERY_BANNER_ID)).toBeNull()
  })
})
