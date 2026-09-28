/**
 * CTA en PRELAUNCH — CDC pré-lancement §6.2 à §6.6, §7, §11, §14 (P1).
 *
 * Header desktop, menu mobile, hero, tarifs, CTA final et CTA fixe mobile ne
 * doivent contenir AUCUN lien vers /signup ni /login en PRELAUNCH. Le même
 * test en FULL (préproduction) prouve que la vérification n'est pas vide : les
 * liens existent bien quand le mode les autorise.
 *
 * `src/config/site.ts` fige l'environnement à l'import : chaque cas recharge
 * les modules (`vi.resetModules`) après avoir posé ses variables.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { defineComponent, h } from 'vue'

type Env = { VITE_ENVIRONMENT: string; VITE_DEFAULT_SITE_MODE: string; query?: string }

const Stub = defineComponent({ render: () => h('div') })

async function setup(env: Env) {
  vi.resetModules()
  vi.stubEnv('VITE_ENVIRONMENT', env.VITE_ENVIRONMENT)
  vi.stubEnv('VITE_DEFAULT_SITE_MODE', env.VITE_DEFAULT_SITE_MODE)
  window.history.replaceState(null, '', `/${env.query ?? ''}`)
  const { vHover } = await import('../src/directives/hover')
  const router = createRouter({
    history: createMemoryHistory(),
    routes: ['/', '/aide', '/contact', '/mentions-legales', '/cgu', '/confidentialite']
      .map((path) => ({ path, component: Stub })),
  })
  await router.push('/')
  await router.isReady()
  const mountIt = async (path: string): Promise<VueWrapper> => {
    const mod = await import(/* @vite-ignore */ path)
    const w = mount(mod.default, { global: { plugins: [router], directives: { hover: vHover } }, attachTo: document.body })
    await flushPromises()
    return w
  }
  return { mountIt }
}

const COMPONENTS = {
  header: '../src/components/AppHeader.vue',
  hero: '../src/sections/HeroSection.vue',
  pricing: '../src/sections/PricingSection.vue',
  finalCta: '../src/sections/CtaSection.vue',
  mobileCta: '../src/components/MobileFixedCta.vue',
} as const

const appLinks = (w: VueWrapper) =>
  w.findAll('a').map((a) => a.attributes('href') ?? '').filter((href) => /\/(signup|login)\b/.test(href))

let mounted: VueWrapper[] = []
afterEach(() => {
  mounted.forEach((w) => w.unmount())
  mounted = []
  document.body.innerHTML = ''
})

async function renderAll(env: Env) {
  // CTA fixe mobile : n'apparaît qu'après défilement.
  Object.defineProperty(window, 'scrollY', { value: 1000, configurable: true })
  const { mountIt } = await setup(env)
  const out: Record<keyof typeof COMPONENTS, VueWrapper> = {} as never
  for (const [key, path] of Object.entries(COMPONENTS)) {
    const w = await mountIt(path)
    mounted.push(w)
    out[key as keyof typeof COMPONENTS] = w
  }
  // Menu mobile : ouvert par le bouton burger du header.
  await out.header.find('button').trigger('click')
  await flushPromises()
  return out
}

describe('production PRELAUNCH (parcours 1)', () => {
  it.each(Object.keys(COMPONENTS))('%s : aucun lien /signup ni /login', async (key) => {
    const all = await renderAll({ VITE_ENVIRONMENT: 'production', VITE_DEFAULT_SITE_MODE: 'prelaunch' })
    expect(appLinks(all[key as keyof typeof COMPONENTS])).toEqual([])
  })

  it('affiche les éléments informatifs attendus, menu mobile compris (§6.2 à §6.6)', async () => {
    const all = await renderAll({ VITE_ENVIRONMENT: 'production', VITE_DEFAULT_SITE_MODE: 'prelaunch' })
    for (const id of ['prelaunch-header', 'prelaunch-mobile-menu']) {
      const el = all.header.find(`[data-testid="${id}"]`)
      expect(el.exists(), id).toBe(true)
      expect(el.element.tagName).not.toBe('A')
      expect(el.text()).toContain('Ouverture prochaine')
    }
    expect(all.hero.find('[data-testid="prelaunch-hero"]').text()).toContain('Verebona arrive bientôt')
    expect(all.pricing.find('[data-testid="prelaunch-pricing"]').text()).toContain('Bientôt disponible')
    expect(all.pricing.find('[data-testid="prelaunch-referral"]').exists()).toBe(true)
    expect(all.finalCta.find('[data-testid="prelaunch-final-cta"]').text()).toContain('Verebona arrive bientôt')
    expect(all.mobileCta.html()).not.toContain('<a')
  })

  it("le titre des tarifs n'invite pas à essayer immédiatement (§6.5, §8.1)", async () => {
    const all = await renderAll({ VITE_ENVIRONMENT: 'production', VITE_DEFAULT_SITE_MODE: 'prelaunch' })
    const title = all.pricing.find('[data-testid="pricing-title"]').text()
    expect(title).not.toMatch(/Essayez/)
    expect(title).toContain('dès l’ouverture')
  })

  it('ignore ?mode=full en production (§5.1)', async () => {
    const all = await renderAll({ VITE_ENVIRONMENT: 'production', VITE_DEFAULT_SITE_MODE: 'prelaunch', query: '?mode=full' })
    for (const w of Object.values(all)) expect(appLinks(w)).toEqual([])
  })
})

describe('préproduction', () => {
  it('FULL par défaut (parcours 2) : les liens vers l’application existent', async () => {
    const all = await renderAll({ VITE_ENVIRONMENT: 'preprod', VITE_DEFAULT_SITE_MODE: 'full' })
    expect(appLinks(all.header).some((h) => h.includes('/login'))).toBe(true)
    expect(appLinks(all.header).some((h) => h.includes('/signup'))).toBe(true)
    expect(appLinks(all.hero).length).toBeGreaterThan(0)
    expect(appLinks(all.pricing).length).toBeGreaterThan(0)
    expect(appLinks(all.mobileCta).length).toBeGreaterThan(0)
    expect(all.pricing.find('[data-testid="pricing-title"]').text()).toMatch(/Essayez/)
  })

  it('FULL : le CTA du header (desktop et menu mobile) reste « Essayer gratuitement » — écart assumé au CDC §6.1', async () => {
    // Décision produit 2026-09-28 : le CDC Site Public demande « Créer un
    // compte » ; le libellé « Essayer gratuitement » est conservé.
    const all = await renderAll({ VITE_ENVIRONMENT: 'preprod', VITE_DEFAULT_SITE_MODE: 'full' })
    const signup = all.header.findAll('a').filter((a) => /\/signup\b/.test(a.attributes('href') ?? ''))
    // Un lien dans le header desktop, un dans le menu mobile (ouvert par renderAll).
    expect(signup.length).toBe(2)
    for (const a of signup) expect(a.text().trim()).toBe('Essayer gratuitement')
    expect(all.header.text()).not.toContain('Créer un compte')
  })

  it('?mode=prelaunch (parcours 3) : aucun lien vers l’application', async () => {
    const all = await renderAll({ VITE_ENVIRONMENT: 'preprod', VITE_DEFAULT_SITE_MODE: 'full', query: '?mode=prelaunch' })
    for (const [key, w] of Object.entries(all)) expect(appLinks(w), key).toEqual([])
  })
})
