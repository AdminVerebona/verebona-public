/**
 * Lot 76P — P1 « Site public : afficher temporairement les tarifs fixes
 * jusqu'à la mise en production du catalogue Stripe ».
 *
 * Identifiants : L76P-T<n> (§ du ticket entre parenthèses).
 *
 * `src/config/site.ts` fige l'environnement à l'import : chaque cas recharge
 * les modules (`vi.resetModules`) après avoir posé ses variables. Le
 * prérendu est simulé avec `vue/server-renderer` (même chemin que
 * `src/entry-prerender.ts`) ; le HTML réel de `dist/` est vérifié après
 * `npm run build` par `scripts/check-prelaunch-prices.mjs` (chaîne de build).
 */
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils'

const ROOT = join(__dirname, '..')
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8')
const nbsp = (s: string) => s.replace(/[  ]/g, ' ')
const envFile = (p: string) => Object.fromEntries(read(p).split('\n').filter((l) => /^[A-Z_]+=/.test(l)).map((l) => l.split('=').map((s) => s.trim()) as [string, string]))

type Env = { VITE_ENVIRONMENT: string; VITE_DEFAULT_SITE_MODE: string; VITE_PRICING_SOURCE?: string; query?: string }

const GRID = {
  standard: ['3,90 €', '39,00 €'],
  premium: ['6,90 €', '69,00 €'],
  premium_duo: ['9,90 €', '99,00 €'],
} as const

const offers = (amounts: Record<string, [number, number]>) => Object.entries(amounts).flatMap(([plan, [m, y]]) => [
  { plan_code: plan, billing_period: 'monthly', unit_amount_cents: m, currency: 'eur', price_revision: `pr_${plan}m`, available: true, tax_included: true },
  { plan_code: plan, billing_period: 'yearly', unit_amount_cents: y, currency: 'eur', price_revision: `pr_${plan}y`, available: true, tax_included: true },
])
const LIVE = { catalog_version: 'cv_live', status: 'ok', purchasable: true, offers: offers({ standard: [390, 3900], premium: [690, 6900], premium_duo: [990, 9900] }) }

let fetchMock: ReturnType<typeof vi.fn>
async function load(env: Env, fetchImpl?: () => Promise<Response>) {
  vi.resetModules()
  fetchMock = vi.fn(fetchImpl ?? (async () => new Response(JSON.stringify(LIVE), { status: 200 })))
  vi.stubGlobal('fetch', fetchMock)
  vi.stubEnv('VITE_ENVIRONMENT', env.VITE_ENVIRONMENT)
  vi.stubEnv('VITE_DEFAULT_SITE_MODE', env.VITE_DEFAULT_SITE_MODE)
  vi.stubEnv('VITE_PRICING_SOURCE', env.VITE_PRICING_SOURCE ?? '')
  window.history.replaceState(null, '', `/${env.query ?? ''}`)
  const pricing = await import('../src/composables/usePricing')
  const site = await import('../src/config/site')
  const section = (await import('../src/sections/PricingSection.vue')).default
  const { vHover } = await import('../src/directives/hover')
  const mountIt = async (): Promise<VueWrapper> => {
    const w = mount(section, { global: { directives: { hover: vHover }, stubs: { RouterLink: true } }, attachTo: document.body })
    wrappers.push(w)
    await flushPromises()
    return w
  }
  const ssr = async () => renderToString(createSSRApp({ render: () => h(section) }), {})
  return { pricing, site, mountIt, ssr }
}

const PROD: Env = { VITE_ENVIRONMENT: 'production', VITE_DEFAULT_SITE_MODE: 'prelaunch', VITE_PRICING_SOURCE: 'prelaunch_fixed' }
const PREPROD: Env = { VITE_ENVIRONMENT: 'preprod', VITE_DEFAULT_SITE_MODE: 'full', VITE_PRICING_SOURCE: 'catalog' }
const OPEN: Env = { VITE_ENVIRONMENT: 'production', VITE_DEFAULT_SITE_MODE: 'full', VITE_PRICING_SOURCE: 'catalog' }

let wrappers: VueWrapper[] = []
afterEach(() => { wrappers.forEach((w) => w.unmount()); wrappers = []; document.body.innerHTML = ''; vi.unstubAllGlobals() })
beforeAll(async () => { await import('../src/sections/PricingSection.vue') }, 120_000)

describe('L76P-T1 (§4A) — grille temporaire unique, en centimes, identique au PRICING_MANIFEST', () => {
  it('six montants entiers en centimes, dans usePricing.ts seulement', async () => {
    const { pricing } = await load(PROD)
    expect(pricing.PRELAUNCH_PRICE_GRID).toEqual({
      standard: { monthly: 390, yearly: 3900 },
      premium: { monthly: 690, yearly: 6900 },
      premium_duo: { monthly: 990, yearly: 9900 },
    })
    for (const p of Object.values(pricing.PRELAUNCH_PRICE_GRID)) for (const c of Object.values(p)) expect(Number.isInteger(c)).toBe(true)
    // Aucun montant dans les composants Vue.
    for (const f of ['src/sections/PricingSection.vue', 'src/sections/HeroSection.vue']) {
      expect(read(f), f).not.toMatch(/\b(390|690|990|3900|6900|9900)\b|\d+,\d0\s*€/)
    }
  })
})

describe('L76P-T2 (§4B, §8) — production PRELAUNCH : tarifs fixes, aucun appel API', () => {
  it('six tarifs, TTC, sans « Tarif indisponible », sans requête réseau', async () => {
    const { pricing, mountIt } = await load(PROD)
    expect(pricing.PRICING_SOURCE).toBe('prelaunch_fixed')
    const w = await mountIt()
    for (const [code, [m]] of Object.entries(GRID)) {
      expect(nbsp(w.find(`[data-testid="price-${code}"]`).text())).toBe(`${m} /mois TTC`)
      expect(w.find(`[data-testid="price-${code}"]`).attributes('aria-busy')).toBe('false')
    }
    await w.findAll('.vb-seg button')[1].trigger('click')
    for (const [code, [, y]] of Object.entries(GRID)) expect(nbsp(w.find(`[data-testid="price-${code}"]`).text())).toBe(`${y} /an TTC`)
    expect(w.text()).not.toMatch(/Tarif indisponible|…/)
    expect(fetchMock).not.toHaveBeenCalled()
    // Retour sur l'onglet : toujours aucun appel.
    document.dispatchEvent(new Event('visibilitychange'))
    await flushPromises()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('mention discrète « Tarifs prévus à l’ouverture — TTC »', async () => {
    const { mountIt } = await load(PROD)
    const w = await mountIt()
    expect(w.find('[data-testid="pricing-notice"]').text()).toBe('Tarifs prévus à l’ouverture — TTC')
  })

  it('.env.production sélectionne la grille temporaire ; .env.preprod et .env.development le catalogue', () => {
    expect(envFile('.env.production')).toMatchObject({ VITE_ENVIRONMENT: 'production', VITE_DEFAULT_SITE_MODE: 'prelaunch', VITE_PRICING_SOURCE: 'prelaunch_fixed' })
    expect(envFile('.env.preprod')).toMatchObject({ VITE_ENVIRONMENT: 'preprod', VITE_DEFAULT_SITE_MODE: 'full', VITE_PRICING_SOURCE: 'catalog' })
    expect(envFile('.env.development')).toMatchObject({ VITE_PRICING_SOURCE: 'catalog' })
  })
})

describe('L76P-T3 (§3, §6) — équivalences et économies annuelles', () => {
  it('Standard 3,25 €/mois · 7,80 €/an ; Premium 5,75 · 13,80 ; Duo 8,25 · 19,80 ; Pro « Bientôt »', async () => {
    const { mountIt } = await load(PROD)
    const w = await mountIt()
    expect(w.findAll('.pr__eq').map((e) => e.text()).filter(Boolean)).toEqual([])
    await w.findAll('.vb-seg button')[1].trigger('click')
    expect(w.findAll('.pr__eq').map((e) => nbsp(e.text())).filter(Boolean)).toEqual([
      'soit 3,25 €/mois · économie de 7,80 €/an',
      'soit 5,75 €/mois · économie de 13,80 €/an',
      'soit 8,25 €/mois · économie de 19,80 €/an',
    ])
    expect(w.text()).toContain("En annuel, économisez l'équivalent de 2 mois.")
    expect(w.find('.pr__price--soon').text()).toBe('Bientôt')
  })
})

describe('L76P-T4 (§4C, §6) — prix dans le HTML prérendu, identiques après montage', () => {
  it('prérendu : les trois prix mensuels TTC et la mention, sans état de chargement', async () => {
    const { ssr } = await load(PROD)
    const html = nbsp(await ssr())
    for (const [m] of Object.values(GRID)) expect(html).toContain(m)
    expect(html).toContain('/mois TTC')
    expect(html).toContain('Tarifs prévus à l’ouverture — TTC')
    expect(html).not.toMatch(/aria-busy="true"|Tarif indisponible|>…</)
  })

  it('aucun décalage : texte des prix identique entre prérendu et montage', async () => {
    const { ssr, mountIt } = await load(PROD)
    const html = await ssr()
    const w = await mountIt()
    for (const code of Object.keys(GRID)) {
      const pre = new DOMParser().parseFromString(html, 'text/html').querySelector(`[data-testid="price-${code}"]`)!.textContent
      expect(w.find(`[data-testid="price-${code}"]`).text()).toBe(pre!.trim())
    }
  })
})

describe('L76P-T5 (§4D) — le pré-lancement reste non souscriptible', () => {
  it('aucun lien d’inscription / connexion / Checkout ; pilule « Bientôt disponible »', async () => {
    const { mountIt } = await load(PROD)
    const w = await mountIt()
    expect(w.findAll('a').map((a) => a.attributes('href'))).toEqual([])
    expect(w.find('[data-testid="prelaunch-pricing"]').text()).toContain('Bientôt disponible')
    expect(w.html().replace(/<!--[\s\S]*?-->/g, '')).not.toMatch(/checkout|signup|login/i)
  })
})

describe('L76P-T6 (§4B, §6) — préproduction FULL et site ouvert : catalogue dynamique seul', () => {
  it('préprod FULL : catalogue lu sur l’API, pas de mention temporaire', async () => {
    const { pricing, mountIt } = await load(PREPROD)
    expect(pricing.PRICING_SOURCE).toBe('catalog')
    const w = await mountIt()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/api\/billing\/catalog$/)
    expect(nbsp(w.find('[data-testid="price-premium"]').text())).toBe('6,90 € /mois TTC')
    expect(w.find('[data-testid="pricing-notice"]').exists()).toBe(false)
  })

  it('préprod ?mode=prelaunch : reste dynamique (la source suit la configuration du build)', async () => {
    const { mountIt } = await load({ ...PREPROD, query: '?mode=prelaunch' })
    await mountIt()
    expect(fetchMock).toHaveBeenCalled()
  })

  it('préprod Scalingo (build « production » lisant .env.production) : prelaunch_fixed ignoré, catalogue', async () => {
    const { pricing, mountIt } = await load({ ...PREPROD, VITE_PRICING_SOURCE: 'prelaunch_fixed' })
    expect(pricing.PRICING_SOURCE).toBe('catalog')
    const w = await mountIt()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(w.find('[data-testid="pricing-notice"]').exists()).toBe(false)
  })

  it('API indisponible en FULL : « Tarif indisponible », jamais un montant fixe', async () => {
    const { mountIt } = await load(OPEN, async () => { throw new TypeError('Failed to fetch') })
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const w = await mountIt()
    for (const code of Object.keys(GRID)) expect(w.find(`[data-testid="price-${code}"]`).text()).toBe('Tarif indisponible')
    expect(w.text()).not.toMatch(/\d,\d0\s*€/)
  })

  it('source absente ou invalide : catalogue (jamais la grille fixe par défaut)', async () => {
    for (const raw of ['', 'fixe', 'PRELAUNCH']) {
      const { pricing } = await load({ VITE_ENVIRONMENT: 'production', VITE_DEFAULT_SITE_MODE: 'prelaunch', VITE_PRICING_SOURCE: raw })
      expect(pricing.PRICING_SOURCE, raw).toBe('catalog')
    }
  })
})

describe('L76P-T7 (§4B interdiction, §5) — grille fixe refusée dans un site ouvert', () => {
  it('prelaunch_fixed + FULL : catalogue à l’exécution, API indisponible jamais masquée', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { pricing, mountIt } = await load({ ...OPEN, VITE_PRICING_SOURCE: 'prelaunch_fixed' }, async () => { throw new TypeError('down') })
    expect(pricing.PRICING_SOURCE).toBe('catalog')
    const w = await mountIt()
    expect(w.find('[data-testid="price-standard"]').text()).toBe('Tarif indisponible')
  })

  it('règle pure : combinaison interdite signalée (le build échoue)', async () => {
    const { resolvePricingSource } = await import('../src/config/pricing-source.rules')
    expect(resolvePricingSource('production', 'prelaunch', 'prelaunch_fixed')).toEqual({ source: 'prelaunch_fixed', error: null })
    expect(resolvePricingSource('production', 'full', 'prelaunch_fixed').source).toBe('catalog')
    expect(resolvePricingSource('production', 'full', 'prelaunch_fixed').error).toMatch(/interdit/)
    expect(resolvePricingSource('production', 'full', 'catalog')).toEqual({ source: 'catalog', error: null })
    expect(resolvePricingSource('production', 'prelaunch', undefined)).toEqual({ source: 'catalog', error: null })
    // Préprod Scalingo construite par `npm run build` : elle lit .env.production
    // (prelaunch_fixed) — ignoré sans erreur, la préprod reste dynamique.
    for (const mode of ['full', 'prelaunch'] as const) {
      expect(resolvePricingSource('preprod', mode, 'prelaunch_fixed')).toEqual({ source: 'catalog', error: null })
      expect(resolvePricingSource('development', mode, 'prelaunch_fixed')).toEqual({ source: 'catalog', error: null })
    }
    expect(read('vite.config.ts')).toMatch(/resolvePricingSource\([\s\S]*?\)[\s\S]{0,200}throw new Error/)
  })
})

describe('L76P-T8 (§5, §6) — bascule vers le catalogue dynamique', () => {
  it('VITE_PRICING_SOURCE=catalog : grille temporaire complètement désactivée, six offres dynamiques lues', async () => {
    const { pricing, mountIt } = await load({ ...PROD, VITE_PRICING_SOURCE: 'catalog' }, async () =>
      new Response(JSON.stringify({ ...LIVE, offers: offers({ standard: [490, 4900], premium: [790, 7900], premium_duo: [1090, 10900] }) }), { status: 200 }))
    expect(pricing.PRICING_SOURCE).toBe('catalog')
    const w = await mountIt()
    // Montants différents de la grille : ce sont bien ceux du catalogue (= Checkout).
    expect(nbsp(w.find('[data-testid="price-standard"]').text())).toBe('4,90 € /mois TTC')
    await w.findAll('.vb-seg button')[1].trigger('click')
    expect(nbsp(w.find('[data-testid="price-premium_duo"]').text())).toBe('109,00 € /an TTC')
    expect(w.find('[data-testid="pricing-notice"]').exists()).toBe(false)
  })

  it('README : procédure de bascule et conditions préalables du §5', () => {
    const md = read('README.md')
    const s = md.slice(md.indexOf('## Tarifs : grille temporaire du pré-lancement et bascule'))
    expect(s.length).toBeGreaterThan(100)
    for (const k of ['VITE_PRICING_SOURCE=catalog', 'lookup_key', 'webhook', '/api/billing/catalog', 'Checkout', 'portail', 'HTTP 200']) expect(s).toContain(k)
  })
})

describe('L76P-T9 (§6) — sélecteur Mensuel / Annuel au clavier et au toucher, sans débordement', () => {
  it('vrais boutons (Entrée / Espace / toucher = click), état annoncé par aria-pressed', async () => {
    const { mountIt } = await load(PROD)
    const w = await mountIt()
    const [m, y] = w.findAll('.vb-seg button')
    expect(m.element.tagName).toBe('BUTTON')
    expect(m.attributes('type')).toBe('button')
    expect(m.attributes('aria-pressed')).toBe('true')
    await y.trigger('click')
    expect(y.attributes('aria-pressed')).toBe('true')
    expect(m.attributes('aria-pressed')).toBe('false')
  })

  it('CSS : prix et mention peuvent passer à la ligne au zoom 200 % (aucune largeur fixe)', () => {
    const css = read('src/sections/PricingSection.vue').slice(read('src/sections/PricingSection.vue').indexOf('<style'))
    expect(css).toMatch(/\.pr__notice \{[^}]*\}/)
    expect(css).not.toMatch(/\.pr__(price|notice) \{[^}]*white-space: nowrap/)
  })
})
