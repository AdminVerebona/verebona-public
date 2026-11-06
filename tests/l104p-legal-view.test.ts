/**
 * Chantier 104P — vue « Légal » : cinq onglets accessibles, une URL par
 * onglet, contenus lus depuis les sources (jamais en dur), CGUV courante +
 * historique, permalien exact, 404 explicite, aucun terme interdit affiché.
 *
 * `virtual:legal` est remplacé par les données de sources FACTICES complètes
 * (même fonction `legalViewData` que le build).
 */
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { createMemoryHistory, createRouter, type Router } from 'vue-router'
import { readFileSync } from 'node:fs'
import path from 'node:path'

vi.mock('virtual:legal', async () => {
  const core = await import('../scripts/lib/legal-core.mjs')
  const fx = await import('./helpers/legal-fixture')
  const root = fx.makeLegalRoot()
  fx.runScript(root, 'legal-nouvelle-cguv.mjs', ['2026-11-15-v1'])
  fx.fillVersion(root, '2026-11-15-v1', { requiresReacceptance: true, changeSummary: 'Résumé factice de test.' })
  fx.runScript(root, 'legal-figer-cguv.mjs', ['2026-11-15-v1'])
  return core.legalViewData(core.loadLegalSources(root))
})

const ROUTES: Array<[string, string, string]> = [
  ['legal-mentions', '/legal/mentions-legales', 'mentions-legales'],
  ['legal-cguv', '/legal/cguv', 'cguv'],
  ['legal-confid', '/legal/confidentialite', 'confidentialite'],
  ['legal-sous-traitants', '/legal/sous-traitants', 'sous-traitants'],
  ['legal-parrainage', '/legal/parrainage', 'parrainage'],
  ['legal-cguv-version', '/legal/cguv/versions/:code', 'cguv'],
]

let router: Router
let wrapper: VueWrapper
const controls = JSON.parse(readFileSync(path.join(process.cwd(), 'src/content/legal/controles.json'), 'utf8')) as { forbidden: Array<{ pattern: string; flags?: string }> }

async function open(p: string) {
  await router.push(p)
  await flushPromises()
}

beforeAll(async () => {
  vi.stubGlobal('scrollTo', vi.fn())
  const { default: LegalView } = await import('../src/views/LegalView.vue')
  router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { render: () => null } },
      { path: '/contact', component: { render: () => null } },
      ...ROUTES.map(([name, p, tab]) => ({ name, path: p, component: LegalView, meta: { legalTab: tab } })),
    ],
  })
  await router.push('/legal/mentions-legales')
  await router.isReady()
  const { defineComponent, h } = await import('vue')
  const { RouterView } = await import('vue-router')
  wrapper = mount(defineComponent({ render: () => h(RouterView) }), { global: { plugins: [router] }, attachTo: document.body })
  await flushPromises()
}, 60_000)

const tabs = () => wrapper.findAll('[role="tab"]')
const selected = () => tabs().filter((t) => t.attributes('aria-selected') === 'true').map((t) => t.text())

describe('L104P-VIEW — onglets', () => {
  it('L104P-VIEW-01 — cinq onglets (CGUV seul terme), motif ARIA tablist / tab / tabpanel, focus itinérant', async () => {
    await open('/legal/mentions-legales')
    expect(wrapper.find('[role="tablist"]').exists()).toBe(true)
    expect(tabs().map((t) => t.text())).toEqual(['Mentions légales', 'CGUV', 'Confidentialité', 'Sous-traitants et prestataires', 'Parrainage'])
    expect(tabs().map((t) => t.attributes('href'))).toEqual(['/legal/mentions-legales', '/legal/cguv', '/legal/confidentialite', '/legal/sous-traitants', '/legal/parrainage'])
    expect(selected()).toEqual(['Mentions légales'])
    expect(tabs().map((t) => t.attributes('tabindex'))).toEqual(['0', '-1', '-1', '-1', '-1'])
    const panel = wrapper.find('[role="tabpanel"]')
    expect(panel.attributes('aria-labelledby')).toBe('legal-tab-mentions-legales')
    for (const t of tabs()) expect(t.attributes('aria-controls')).toBe(panel.attributes('id'))
  })

  it('L104P-VIEW-02 — chaque URL stable ouvre son onglet et affiche le texte de SA source', async () => {
    for (const [, p, key] of ROUTES.slice(0, 5)) {
      await open(p)
      expect(wrapper.find('[role="tabpanel"]').attributes('aria-labelledby')).toBe(`legal-tab-${key}`)
      if (key !== 'cguv') expect(wrapper.find('.legal__doc').text()).toContain(`Texte factice de test pour ${key}`)
    }
  })

  it('L104P-VIEW-03 — clavier : flèches, Début, Fin ouvrent l’onglet voisin', async () => {
    await open('/legal/mentions-legales')
    const list = wrapper.find('[role="tablist"]')
    await list.trigger('keydown', { key: 'ArrowRight' })
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/legal/cguv')
    await list.trigger('keydown', { key: 'End' })
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/legal/parrainage')
    await list.trigger('keydown', { key: 'ArrowRight' })
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/legal/mentions-legales')
    await list.trigger('keydown', { key: 'ArrowLeft' })
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/legal/parrainage')
    await list.trigger('keydown', { key: 'Home' })
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/legal/mentions-legales')
    expect(selected()).toEqual(['Mentions légales'])
  })
})

describe('L104P-VIEW — CGUV', () => {
  // 108P-L (ticket « livraison des informations légales », décision PO) :
  // /legal/cguv = version en vigueur SEULEMENT, sans annuaire public des
  // anciennes versions (remplace l'attente « Versions précédentes » du 104P).
  it('L104P-VIEW-04 — /legal/cguv : version en vigueur seule (code visible), lien permanent, AUCUN annuaire des anciennes versions', async () => {
    await open('/legal/cguv')
    const text = wrapper.text()
    expect(text).toContain('Version2026-11-15-v1')
    expect(wrapper.find('.legal__doc').text()).toContain('CGUV 2026-11-15-v1')
    const links = wrapper.findAll('a').map((a) => ({ text: a.text(), href: a.attributes('href') }))
    expect(links).toContainEqual({ text: 'Lien permanent de cette version', href: '/legal/cguv/versions/2026-11-15-v1' })
    expect(links.some((l) => l.href === '/legal/cguv/versions/2026-10-30-v1')).toBe(false)
    expect(links.some((l) => /versions-precedentes/.test(l.href ?? ''))).toBe(false)
    expect(wrapper.find('#versions-precedentes').exists()).toBe(false)
    expect(text).not.toContain('2026-10-30-v1')
    // L'ancienne version reste accessible par son URL directe (preuve d'acceptation).
    await open('/legal/cguv/versions/2026-10-30-v1')
    expect(wrapper.find('.legal__doc').text()).toContain('CGUV 2026-10-30-v1')
  })

  it('L104P-VIEW-05 — permalien : EXACTEMENT la version demandée (jamais la courante), lien vers le texte figé', async () => {
    await open('/legal/cguv/versions/2026-10-30-v1')
    expect(wrapper.find('h1').text()).toBe('CGUV — version 2026-10-30-v1')
    expect(wrapper.find('.legal__doc').text()).toContain('CGUV 2026-10-30-v1')
    expect(wrapper.find('.legal__doc').text()).not.toContain('CGUV 2026-11-15-v1')
    expect(wrapper.text()).toContain('Ce n’est pas la version la plus récente des CGUV.')
    expect(wrapper.find('a[href="/legal/cguv/versions/2026-10-30-v1.html"]').exists()).toBe(true)
    expect(selected()).toEqual(['CGUV'])
    await open('/legal/cguv/versions/2026-11-15-v1')
    expect(wrapper.text()).toContain('Cette version est la version en vigueur des CGUV.')
    expect(wrapper.text()).toContain('Résumé factice de test.')
  })

  it('L104P-VIEW-06 — code inconnu : message explicite, aucun contenu d’une autre version, pas de redirection', async () => {
    await open('/legal/cguv/versions/2026-12-01-v1')
    expect(router.currentRoute.value.path).toBe('/legal/cguv/versions/2026-12-01-v1')
    expect(wrapper.find('h1').text()).toBe('Version des CGUV introuvable')
    expect(wrapper.text()).toContain('« 2026-12-01-v1 »')
    expect(wrapper.find('.legal__doc').exists()).toBe(false)
  })
})

describe('L104P-VIEW — termes', () => {
  it('L104P-VIEW-07 — aucun terme interdit affiché (CGSU, CGVU, Contact DPO, 2025…) ; contact protection des données', async () => {
    for (const p of ['/legal/mentions-legales', '/legal/cguv', '/legal/confidentialite', '/legal/sous-traitants', '/legal/parrainage', '/legal/cguv/versions/2026-10-30-v1']) {
      await open(p)
      const text = wrapper.text()
      for (const r of controls.forbidden) expect({ p, rule: r.pattern, hit: new RegExp(r.pattern, r.flags ?? '').test(text) }).toEqual({ p, rule: r.pattern, hit: false })
      expect(text).toContain('Contact protection des données (dpo@verebona.com)')
    }
  })

  it('L104P-VIEW-08 — aucun texte juridique en dur dans la vue ni dans le composable', () => {
    for (const f of ['src/views/LegalView.vue', 'src/composables/useLegal.ts']) {
      const src = readFileSync(path.join(process.cwd(), f), 'utf8')
      expect(src, f).not.toMatch(/CGSU|CGVU|Contact DPO|2025|25\/09\/2026|SIRET|Raison sociale|Hébergeur/)
      expect(src.length, f).toBeLessThan(15_000)
    }
  })

  // Lot 113 (#694, décision PO) : le pied de page ne garde que 3 liens légaux ;
  // Sous-traitants et Parrainage restent des onglets (VIEW-01/02) — voir
  // tests/l113c-footer-legal.test.ts.
  it('L104P-VIEW-09 — pied de page : Mentions légales, CGUV, Confidentialité → URL stables (113 : 3 liens)', () => {
    const footer = readFileSync(path.join(process.cwd(), 'src/components/AppFooter.vue'), 'utf8')
    expect(footer).toContain(`<a v-bind="link('/legal/cguv')">CGUV</a>`)
    expect(footer).toContain(`link('/legal/mentions-legales')`)
    expect(footer).toContain(`link('/legal/confidentialite')`)
    expect(footer).not.toContain(`link('/legal/sous-traitants')`)
    expect(footer).not.toContain(`link('/legal/parrainage')`)
    expect(footer).not.toMatch(/CGSU|CGVU|link\('\/cgu'\)|link\('\/cgvu'\)|link\('\/mentions-legales'\)|link\('\/confidentialite'\)/)
  })
})
