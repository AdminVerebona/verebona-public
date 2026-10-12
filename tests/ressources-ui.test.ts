/**
 * Ressources — composants (CDC Ressources V6 UX-04, UX-05, UX-07, CONV-01,
 * CONV-02, CONV-04, CONV-06, SEC-03, SEC-05 ; T16 à T18).
 *
 * `src/config/site.ts` fige l'environnement à l'import : chaque cas recharge
 * les modules après avoir posé ses variables (même méthode que
 * `prelaunch-cta.test.ts`).
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { defineComponent, h } from 'vue'
import { parseRessourceBody } from '../src/ressources/markdown'

const Stub = defineComponent({ render: () => h('div') })

async function setup(env: { VITE_ENVIRONMENT: string; VITE_DEFAULT_SITE_MODE: string }) {
  vi.resetModules()
  vi.stubEnv('VITE_ENVIRONMENT', env.VITE_ENVIRONMENT)
  vi.stubEnv('VITE_DEFAULT_SITE_MODE', env.VITE_DEFAULT_SITE_MODE)
  window.history.replaceState(null, '', '/')
  const router = createRouter({ history: createMemoryHistory(), routes: ['/', '/ressources', '/aide'].map((path) => ({ path, component: Stub })) })
  await router.push('/')
  await router.isReady()
  return router
}

const cta = parseRessourceBody('Intro.\n\n## Et avec Verebona ?\n\nAssociez la facture au bien dans Verebona.').cta

afterEach(() => { delete window.__VB_ANALYTICS_CONSENT__ })

describe('Transition Verebona (UX-04, CONV-02, CONV-06)', () => {
  it('pré-lancement : aucun lien d’inscription, essai annoncé au futur', async () => {
    const router = await setup({ VITE_ENVIRONMENT: 'production', VITE_DEFAULT_SITE_MODE: 'prelaunch' })
    const C = (await import('../src/components/ressources/RessourceCta.vue')).default
    const w = mount(C, { props: { blocks: cta, articleId: 'A01' }, global: { plugins: [router] } })
    await flushPromises()
    expect(w.html()).not.toMatch(/href="[^"]*\/(signup|login)/)
    expect(w.text()).toContain('Un essai gratuit de 7 jours dès l’ouverture.')
    expect(w.find('a').attributes('href')).toBe('/')
  })

  it('ouverture : essai réel 7 jours sans carte bancaire, aucune offre nouvelle', async () => {
    const router = await setup({ VITE_ENVIRONMENT: 'preprod', VITE_DEFAULT_SITE_MODE: 'full' })
    const C = (await import('../src/components/ressources/RessourceCta.vue')).default
    const w = mount(C, { props: { blocks: cta, articleId: 'A01' }, global: { plugins: [router] } })
    await flushPromises()
    const a = w.find('a.ha-btn')
    expect(a.attributes('href')).toMatch(/\/signup$/)
    expect(a.text()).toBe('Essayer gratuitement pendant 7 jours')
    expect(w.text()).toContain('sans carte bancaire')
    expect(w.text()).not.toMatch(/gratuit à vie|code promo|réduction|offert/i)
  })
})

describe('Rendu sûr et accessible (SEC-03, UX-07)', () => {
  it('T18 — texte d’apparence HTML : échappé, jamais interprété', async () => {
    const router = await setup({ VITE_ENVIRONMENT: 'production', VITE_DEFAULT_SITE_MODE: 'prelaunch' })
    const B = (await import('../src/components/ressources/RessourceBlocks.vue')).default
    const w = mount(B, {
      props: { blocks: [{ kind: 'paragraph', inlines: [{ kind: 'text', text: '&lt;script&gt; <b>x</b>' }] }] },
      global: { plugins: [router] },
    })
    expect(w.find('script').exists()).toBe(false)
    expect(w.find('b').exists()).toBe(false)
    expect(w.text()).toContain('<b>x</b>')
  })

  it('tableau : région défilable focalisable, étiquetée, en-têtes de colonne', async () => {
    const router = await setup({ VITE_ENVIRONMENT: 'production', VITE_DEFAULT_SITE_MODE: 'prelaunch' })
    const B = (await import('../src/components/ressources/RessourceBlocks.vue')).default
    const w = mount(B, { props: { blocks: [{ kind: 'table', head: ['Document', 'Durée'], rows: [['Facture', '5 ans']] }] }, global: { plugins: [router] } })
    const region = w.find('[role="region"]')
    expect(region.attributes('tabindex')).toBe('0')
    expect(region.attributes('aria-label')).toBe('Tableau : Document, Durée')
    expect(w.findAll('th[scope="col"]')).toHaveLength(2)
  })
})

describe('Mesure soumise au consentement (CONV-04, SEC-05, T16, T17)', () => {
  it('sans consentement : aucun événement ; avec : identifiants seuls, sans donnée personnelle', async () => {
    const { trackRessource } = await import('../src/ressources/analytics')
    const seen: unknown[] = []
    const on = (e: Event) => seen.push((e as CustomEvent).detail)
    window.addEventListener('verebona:analytics', on)
    trackRessource({ name: 'resource_view', article_id: 'A01', category: 'factures-preuves-achat', slug: 'retrouver-facture-ticket-perdu' })
    expect(seen).toEqual([])
    window.__VB_ANALYTICS_CONSENT__ = true
    trackRessource({ name: 'resource_cta_click', article_id: 'A01', cta_context: 'article_footer' })
    expect(seen).toEqual([{ name: 'resource_cta_click', article_id: 'A01', cta_context: 'article_footer' }])
    window.removeEventListener('verebona:analytics', on)
  })
})
