/**
 * Tarifs de la vitrine — CDC « Migration Stripe vers lookup_key » V4 (lot 35C).
 *
 * Source unique : le catalogue public de l'application (`/api/billing/catalog`,
 * révision active = prix facturé par Checkout). Aucun montant dans la
 * vitrine, rien de figé au prérendu, aucun prix de secours (LK-31, LK-33,
 * LK-104, LK-116, TC-59, TC-61, TC-88). Les mentions d'économie annuelle
 * restent inchangées (texte et calcul, LK-115, TC-89, RX-19).
 */
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { mount, flushPromises } from '@vue/test-utils'

const ROOT = join(__dirname, '..')
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8')
const nbsp = (s: string) => s.replace(/ | /g, ' ')

const offers = (amounts: Record<string, [number, number]>) => Object.entries(amounts).flatMap(([plan, [m, y]]) => [
  { plan_code: plan, billing_period: 'monthly', unit_amount_cents: m, currency: 'eur', interval: 'month', interval_count: 1, price_revision: `pr_${plan}m`, available: true, tax_included: true },
  { plan_code: plan, billing_period: 'yearly', unit_amount_cents: y, currency: 'eur', interval: 'year', interval_count: 1, price_revision: `pr_${plan}y`, available: true, tax_included: true },
])
const V4 = { catalog_version: 'cv_v4', status: 'ok', purchasable: true, offers: offers({ standard: [390, 3900], premium: [690, 6900], premium_duo: [990, 9900] }) }

beforeAll(async () => { await import('../src/sections/PricingSection.vue') }, 120_000)

let pricing: typeof import('../src/composables/usePricing')
beforeEach(async () => {
  pricing = await import('../src/composables/usePricing')
  pricing.__resetCatalogForTests()
})
afterEach(() => { vi.unstubAllGlobals() })

describe('source unique des montants', () => {
  it('LK-31 / TC-59 — la vitrine ne contient plus aucun montant de vente', () => {
    const src = read('src/composables/usePricing.ts') + read('src/sections/PricingSection.vue')
    expect(src).not.toMatch(/monthly:\s*\d|yearly:\s*\d|\b(2|5|8|3|6|9)[.,]9\b|\b(29|59|89|39|69|99)\s*€/)
    expect(pricing.PLANS.every((p) => !('monthly' in p) && !('yearly' in p))).toBe(true)
    expect(read('src/content/aide/articles/AID-BILL-001.md')).not.toMatch(/\d+(,\d+)?\s*€/)
  })

  it('LK-29 — catalogue lu depuis l’application (même source que Checkout)', () => {
    expect(pricing.CATALOG_URL).toMatch(/\/api\/billing\/catalog$/)
  })

  it('TC-88 / RX-18 — montants du catalogue serveur, format Intl fr-FR, TTC', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify(V4), { status: 200 }))
    await pricing.loadCatalog(fetchMock as unknown as typeof fetch)
    const p = pricing.usePricing()
    expect(nbsp(p.priceOf('standard'))).toBe('3,90 €')
    expect(nbsp(p.priceOf('premium_duo'))).toBe('9,90 €')
    p.setPeriod('yearly')
    expect(nbsp(p.priceOf('standard'))).toBe('39,00 €')
    expect(nbsp(p.priceOf('premium'))).toBe('69,00 €')
    expect(nbsp(p.priceOf('premium_duo'))).toBe('99,00 €')
    expect(p.mentionOf('premium')).toBe('TTC')
    expect(fetchMock).toHaveBeenCalledWith(expect.stringMatching(/\/api\/billing\/catalog$/), expect.objectContaining({ cache: 'no-store' }))
  })

  it('TC-61 — chargement puis indisponibilité : aucun prix de secours fixe', async () => {
    const p = pricing.usePricing()
    expect(p.priceOf('premium')).toBe('…')
    await pricing.loadCatalog((async () => { throw new Error('offline') }) as unknown as typeof fetch)
    expect(p.priceOf('premium')).toBe('Tarif indisponible')
    expect(p.hasPrice('premium')).toBe(false)
  })

  it('LK-116 / RX-16 — après un échec de publication, le serveur sert l’ancienne grille : la vitrine l’affiche telle quelle', async () => {
    const old = { ...V4, offers: offers({ standard: [290, 2900], premium: [590, 5900], premium_duo: [890, 8900] }) }
    await pricing.loadCatalog((async () => new Response(JSON.stringify(old), { status: 200 })) as unknown as typeof fetch)
    expect(nbsp(pricing.usePricing().priceOf('premium'))).toBe('5,90 €')
  })

  it('LK-33 — un seul chargement mutualisé pour plusieurs composants', async () => {
    let n = 0
    const fetchMock = (async () => { n++; return new Response(JSON.stringify(V4), { status: 200 }) }) as unknown as typeof fetch
    await Promise.all([pricing.loadCatalog(fetchMock), pricing.loadCatalog(fetchMock), pricing.loadCatalog(fetchMock)])
    expect(n).toBe(1)
  })
})

describe('mentions d’économie annuelle : hors périmètre, inchangées (LK-115)', () => {
  it('TC-89 / RX-19 — texte et calcul identiques, seules les entrées viennent du catalogue', async () => {
    await pricing.loadCatalog((async () => new Response(JSON.stringify(V4), { status: 200 })) as unknown as typeof fetch)
    const p = pricing.usePricing()
    p.setPeriod('yearly')
    expect(nbsp(p.equivalentOf('standard'))).toBe('soit 3,25 €/mois · économie de 7,80 €/an')
    expect(read('src/sections/PricingSection.vue')).toContain("En annuel, économisez l'équivalent de 2 mois.")
    expect(read('src/composables/usePricing.ts')).toContain('const saving = plan.monthly * 12 - plan.yearly')
  })
})

describe('section Tarifs (desktop et mobile : même composant)', () => {
  it('rendu : état de chargement puis montants du catalogue', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(V4), { status: 200 })))
    const { vHover } = await import('../src/directives/hover')
    const mod = await import('../src/sections/PricingSection.vue')
    const w = mount(mod.default, { global: { directives: { hover: vHover }, stubs: { RouterLink: true } } })
    await flushPromises()
    expect(nbsp(w.find('[data-testid="price-standard"]').text())).toContain('3,90 €')
    expect(nbsp(w.find('[data-testid="price-premium_duo"]').text())).toContain('9,90 €')
    w.unmount()
  })
})
