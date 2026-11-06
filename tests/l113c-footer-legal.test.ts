/**
 * Lot 113 (#694) — pied de page public allégé : colonne « Légal » à trois
 * liens (Mentions légales, CGUV, Confidentialité), chacun ouvrant LE BON
 * onglet de la page juridique, au clic comme à l'ouverture directe /
 * rafraîchissement. Les cinq onglets, leurs URL et leurs contenus restent.
 *
 * Contenus : les vraies sources `src/content/legal/` (module `virtual:legal`
 * de vitest.config.ts) — aucun texte juridique n'est modifié ni réécrit ici.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { createMemoryHistory, createRouter, RouterView, type Router } from 'vue-router'
import { defineComponent, h } from 'vue'
import { ROUTE_PATHS } from '../src/router/route-paths'
import { INDEXABLE_PATHS } from '../src/config/sitemap.rules'

const LEGAL: Array<[name: string, path: string, tab: string, label: string]> = [
  ['legal-mentions', '/legal/mentions-legales', 'mentions-legales', 'Mentions légales'],
  ['legal-cguv', '/legal/cguv', 'cguv', 'CGUV'],
  ['legal-confid', '/legal/confidentialite', 'confidentialite', 'Confidentialité'],
  ['legal-sous-traitants', '/legal/sous-traitants', 'sous-traitants', 'Sous-traitants et prestataires'],
  ['legal-parrainage', '/legal/parrainage', 'parrainage', 'Parrainage'],
]
const FOOTER_LEGAL = LEGAL.slice(0, 3)

let wrapper: VueWrapper | null = null
afterEach(() => { wrapper?.unmount(); wrapper = null; document.body.innerHTML = '' })

/** Page complète minimale : vue routée + pied de page, routeur démarré sur `start`. */
async function mountSite(start: string): Promise<{ w: VueWrapper; router: Router }> {
  vi.stubGlobal('scrollTo', vi.fn())
  const { default: LegalView } = await import('../src/views/LegalView.vue')
  const { default: AppFooter } = await import('../src/components/AppFooter.vue')
  const Stub = defineComponent({ render: () => h('div') })
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      ...Object.values(ROUTE_PATHS).filter((p) => !p.startsWith('/legal') && !p.includes(':')).map((path) => ({ path, component: Stub })),
      ...LEGAL.map(([name, path, tab]) => ({ name, path, component: LegalView, meta: { legalTab: tab } })),
    ],
  })
  await router.push(start)
  await router.isReady()
  const w = mount(defineComponent({ render: () => h('div', [h(RouterView), h(AppFooter)]) }), { global: { plugins: [router] }, attachTo: document.body })
  await flushPromises()
  wrapper = w
  return { w, router }
}

const legalColumn = (w: VueWrapper) => {
  const col = w.findAll('footer .ft__title').find((t) => t.text() === 'Légal')
  if (!col) throw new Error('colonne Légal absente')
  return col.element.parentElement as HTMLElement
}
const selectedTab = (w: VueWrapper) => w.findAll('[role="tab"]').filter((t) => t.attributes('aria-selected') === 'true').map((t) => t.text())

describe('L113C-694 — colonne Légal du pied de page', () => {
  it('trois liens seulement, dans l’ordre, vers les URL stables', async () => {
    const { w } = await mountSite('/')
    const links = [...legalColumn(w).querySelectorAll('a')].map((a) => ({ text: a.textContent?.trim(), href: a.getAttribute('href') }))
    expect(links).toEqual(FOOTER_LEGAL.map(([, path, , label]) => ({ text: label, href: path })))
    const footerText = w.find('footer').text()
    expect(footerText).not.toContain('Sous-traitants')
    expect(footerText).not.toContain('Parrainage')
    expect(w.findAll('footer a').some((a) => /\/legal\/(sous-traitants|parrainage)/.test(a.attributes('href') ?? ''))).toBe(false)
  }, 60_000)

  it('autres colonnes inchangées (Produit, Support)', async () => {
    const { w } = await mountSite('/')
    expect(w.findAll('footer .ft__title').map((t) => t.text())).toEqual(['Produit', 'Support', 'Légal'])
    const texts = w.findAll('footer a').map((a) => a.text().trim())
    expect(texts).toEqual(expect.arrayContaining(['Comment ça marche', "Cas d'usage", 'Tarifs', 'FAQ', "Centre d'aide", 'Ressources', 'Contact']))
  })

  it.each(FOOTER_LEGAL)('clic « %s » depuis une autre page : route et onglet sélectionné corrects', async (_name, path, tab, label) => {
    const { w, router } = await mountSite('/contact')
    const a = [...legalColumn(w).querySelectorAll('a')].find((x) => x.textContent?.trim() === label)!
    a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }))
    await flushPromises()
    expect(router.currentRoute.value.path).toBe(path)
    expect(selectedTab(w)).toEqual([label])
    expect(w.find('[role="tabpanel"]').attributes('aria-labelledby')).toBe(`legal-tab-${tab}`)
  })

  it.each(FOOTER_LEGAL)('clic « %s » depuis un AUTRE onglet légal : l’onglet change (jamais le premier par défaut)', async (_name, path, _tab, label) => {
    const { w, router } = await mountSite('/legal/parrainage')
    expect(selectedTab(w)).toEqual(['Parrainage'])
    const a = [...legalColumn(w).querySelectorAll('a')].find((x) => x.textContent?.trim() === label)!
    a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }))
    await flushPromises()
    expect(router.currentRoute.value.path).toBe(path)
    expect(selectedTab(w)).toEqual([label])
  })
})

describe('L113C-694 — ouverture directe / rafraîchissement, cinq onglets conservés', () => {
  it.each(LEGAL)('ouverture directe de %s (nouveau routeur = rechargement) : bon onglet', async (_name, path, tab, label) => {
    const { w } = await mountSite(path)
    expect(selectedTab(w)).toEqual([label])
    expect(w.find('[role="tabpanel"]').attributes('aria-labelledby')).toBe(`legal-tab-${tab}`)
    expect(w.find('h1').exists()).toBe(true)
  })

  it('les cinq onglets et leurs URL restent dans la page juridique', async () => {
    const { w } = await mountSite('/legal/cguv')
    expect(w.findAll('[role="tab"]').map((t) => ({ text: t.text(), href: t.attributes('href') })))
      .toEqual(LEGAL.map(([, path, , label]) => ({ text: label, href: path })))
  })

  it('routes et sitemap : /legal/sous-traitants et /legal/parrainage toujours déclarés', () => {
    expect(ROUTE_PATHS['legal-sous-traitants']).toBe('/legal/sous-traitants')
    expect(ROUTE_PATHS['legal-parrainage']).toBe('/legal/parrainage')
    expect(INDEXABLE_PATHS).toEqual(expect.arrayContaining(LEGAL.map(([, path]) => path)))
  })
})
