/**
 * Résolution du mode d'affichage — CDC pré-lancement §4.2, §5, §10.1, §11.
 *
 * Règles pures de `src/config/site-mode.rules.ts` (tableau des trois parcours),
 * puis le point d'entrée `src/config/site.ts` rechargé par environnement.
 */
import { describe, expect, it, vi } from 'vitest'
import {
  allowsModeOverride, isIndexable, parseEnvironment, parseSiteMode, resolveDefaultMode, resolveSiteMode,
} from '../src/config/site-mode.rules'

describe('parseEnvironment', () => {
  it.each([
    ['production', 'production'], ['preprod', 'preprod'], ['development', 'development'],
    [' PREPROD ', 'preprod'],
  ])('%j → %s', (raw, expected) => expect(parseEnvironment(raw)).toBe(expected))

  it.each([undefined, '', 'staging', 'prod', 42, null])('%j absent ou inconnu → production (fallback sûr)', (raw) => {
    expect(parseEnvironment(raw)).toBe('production')
  })
})

describe('parseSiteMode / resolveDefaultMode', () => {
  it('accepte full et prelaunch seulement', () => {
    expect(parseSiteMode('FULL')).toBe('full')
    expect(parseSiteMode('prelaunch')).toBe('prelaunch')
    expect(parseSiteMode('beta')).toBeNull()
    expect(parseSiteMode(undefined)).toBeNull()
  })

  it('mode configuré valide : appliqué', () => {
    expect(resolveDefaultMode('production', 'full')).toBe('full')
    expect(resolveDefaultMode('preprod', 'prelaunch')).toBe('prelaunch')
  })

  it('mode absent ou invalide : prelaunch en production, full ailleurs (§5.1, §10)', () => {
    expect(resolveDefaultMode('production', undefined)).toBe('prelaunch')
    expect(resolveDefaultMode('production', 'n/a')).toBe('prelaunch')
    expect(resolveDefaultMode('preprod', undefined)).toBe('full')
    expect(resolveDefaultMode('development', 'n/a')).toBe('full')
  })
})

describe('resolveSiteMode (§10.1)', () => {
  it('production : ?mode= toujours ignoré (AC-02)', () => {
    for (const requested of ['full', 'prelaunch', 'x', undefined]) {
      expect(resolveSiteMode({ environment: 'production', defaultMode: 'prelaunch', requested })).toBe('prelaunch')
    }
    expect(allowsModeOverride('production')).toBe(false)
  })

  it('préproduction sans paramètre : mode par défaut (FULL)', () => {
    expect(resolveSiteMode({ environment: 'preprod', defaultMode: 'full' })).toBe('full')
  })

  it('préproduction : ?mode=prelaunch et ?mode=full appliqués', () => {
    expect(resolveSiteMode({ environment: 'preprod', defaultMode: 'full', requested: 'prelaunch' })).toBe('prelaunch')
    expect(resolveSiteMode({ environment: 'preprod', defaultMode: 'prelaunch', requested: 'full' })).toBe('full')
  })

  it('préproduction : valeur inconnue → mode par défaut (§5.2)', () => {
    expect(resolveSiteMode({ environment: 'preprod', defaultMode: 'full', requested: 'foo' })).toBe('full')
  })

  it('seule la production est indexable (§8)', () => {
    expect(isIndexable('production')).toBe(true)
    expect(isIndexable('preprod')).toBe(false)
    expect(isIndexable('development')).toBe(false)
  })
})

describe('src/config/site.ts (point d’entrée unique)', () => {
  async function load(env: Record<string, string | undefined>, search = '') {
    vi.resetModules()
    for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v as string)
    window.history.replaceState(null, '', `/${search}`)
    return import('../src/config/site')
  }

  it('production sans configuration : PRELAUNCH, aucune prévisualisation, même avec ?mode=full', async () => {
    const site = await load({ VITE_ENVIRONMENT: '', VITE_DEFAULT_SITE_MODE: '' }, '?mode=full')
    expect(site.SITE_ENVIRONMENT).toBe('production')
    expect(site.CAN_PREVIEW_SITE_MODE).toBe(false)
    expect(site.useSiteMode().isPrelaunch.value).toBe(true)
    expect(site.siteModeQuery()).toEqual({})
  })

  it('préproduction : ?mode=prelaunch lu dès le chargement, puis conservé et remplacé', async () => {
    const site = await load({ VITE_ENVIRONMENT: 'preprod', VITE_DEFAULT_SITE_MODE: 'full' }, '?mode=prelaunch')
    const { isPrelaunch } = site.useSiteMode()
    expect(isPrelaunch.value).toBe(true)
    expect(site.siteModeQuery()).toEqual({ mode: 'prelaunch' })
    site.syncSiteModeFromQuery({}) // navigation interne sans paramètre : choix conservé
    expect(isPrelaunch.value).toBe(true)
    site.syncSiteModeFromQuery({ mode: 'nimporte' }) // valeur inconnue : retour au défaut
    expect(isPrelaunch.value).toBe(false)
    site.resetSiteModePreview()
  })

  it('préproduction : la garde du routeur réinjecte ?mode= à chaque navigation (§5.3)', async () => {
    const site = await load({ VITE_ENVIRONMENT: 'preprod', VITE_DEFAULT_SITE_MODE: 'full' }, '?mode=prelaunch')
    const { createRouter, createMemoryHistory } = await import('vue-router')
    const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/:p(.*)*', component: { render: () => null } }] })
    site.installSiteModeGuard(router)
    await router.push('/contact')
    expect(router.currentRoute.value.query.mode).toBe('prelaunch')
    site.resetSiteModePreview()
  })
})
