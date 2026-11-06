/**
 * Lot 113 (#709) — bouton « Revenir en haut » du site public.
 *
 * Absent en haut de page, apparaît après défilement, bouton natif nommé
 * (aria-label), clavier (dernier arrêt, dans le pied de page), focus rendu
 * à l'en-tête, prefers-reduced-motion respecté, au-dessus de la barre
 * d'essai mobile (jamais dessus), aplat de la charte.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { defineComponent, h } from 'vue'
import { BACK_TO_TOP_MIN_SCROLL, backToTopBehavior, backToTopVisible } from '../src/components/back-to-top'

const read = (p: string) => readFileSync(path.join(process.cwd(), p), 'utf8')

let wrapper: VueWrapper | null = null
afterEach(() => {
  wrapper?.unmount(); wrapper = null
  document.body.innerHTML = ''
  Object.defineProperty(window, 'scrollY', { value: 0, configurable: true })
})

function setScroll(y: number) {
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true })
  window.dispatchEvent(new Event('scroll'))
}

async function mountTop(opts: { reduced?: boolean } = {}) {
  const scrollTo = vi.fn()
  vi.stubGlobal('scrollTo', scrollTo)
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: !!opts.reduced && q.includes('reduce'), media: q, addEventListener() {}, removeEventListener() {} }))
  Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true })
  // Logo de l'en-tête : cible du focus après remontée.
  const header = document.createElement('header')
  header.innerHTML = '<a href="/" aria-label="Verebona — accueil">V</a>'
  document.body.appendChild(header)
  const { default: BackToTop } = await import('../src/components/BackToTop.vue')
  wrapper = mount(BackToTop, { attachTo: document.body })
  await flushPromises()
  return { w: wrapper, scrollTo, logo: header.querySelector('a') as HTMLAnchorElement }
}
const btn = (w: VueWrapper) => w.find('[data-testid="back-to-top"]')

describe('L113C-709 — règle d’apparition', () => {
  it('une hauteur d’écran défilée, au moins 600 px', () => {
    expect(BACK_TO_TOP_MIN_SCROLL).toBe(600)
    expect(backToTopVisible(0, 800)).toBe(false)
    expect(backToTopVisible(700, 800)).toBe(false)
    expect(backToTopVisible(801, 800)).toBe(true)
    expect(backToTopVisible(590, 400)).toBe(false)
    expect(backToTopVisible(601, 400)).toBe(true)
  })
  it('mouvement réduit : remontée instantanée', () => {
    expect(backToTopBehavior(true)).toBe('auto')
    expect(backToTopBehavior(false)).toBe('smooth')
  })
})

describe('L113C-709 — composant', () => {
  it('absent en haut de page (aucun arrêt de tabulation), présent après défilement, masqué en remontant', async () => {
    const { w } = await mountTop()
    expect(btn(w).exists()).toBe(false)
    setScroll(1200); await flushPromises()
    expect(btn(w).exists()).toBe(true)
    setScroll(100); await flushPromises()
    expect(btn(w).exists()).toBe(false)
  })

  it('bouton natif nommé, icône décorative', async () => {
    const { w } = await mountTop()
    setScroll(1200); await flushPromises()
    const b = btn(w)
    expect(b.element.tagName).toBe('BUTTON')
    expect(b.attributes('type')).toBe('button')
    expect(b.attributes('aria-label')).toBe('Revenir en haut de la page')
    expect(b.find('svg').attributes('aria-hidden')).toBe('true')
    expect(b.attributes('tabindex')).toBeUndefined()
  })

  it('clic / Entrée : défilement doux vers le haut, focus rendu au logo de l’en-tête', async () => {
    const { w, scrollTo, logo } = await mountTop()
    setScroll(1200); await flushPromises()
    ;(btn(w).element as HTMLButtonElement).focus()
    await btn(w).trigger('click')
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
    expect(document.activeElement).toBe(logo)
  })

  it('prefers-reduced-motion : remontée instantanée', async () => {
    const { w, scrollTo } = await mountTop({ reduced: true })
    setScroll(1200); await flushPromises()
    await btn(w).trigger('click')
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' })
  })

  it('focus clavier conservé : le bouton focalisé ne disparaît pas si la page remonte autrement', async () => {
    const { w } = await mountTop()
    setScroll(1200); await flushPromises()
    await btn(w).trigger('focus')
    setScroll(0); await flushPromises()
    expect(btn(w).exists()).toBe(true)
    await btn(w).trigger('blur'); await flushPromises()
    expect(btn(w).exists()).toBe(false)
  })
})

describe('L113C-709 — intégration et charte', () => {
  it('dans le pied de page, après ses liens (dernier arrêt clavier ; absent en mode intégré, comme le pied)', async () => {
    vi.stubGlobal('scrollTo', vi.fn())
    const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/:p(.*)*', component: defineComponent({ render: () => h('div') }) }] })
    await router.push('/'); await router.isReady()
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true })
    Object.defineProperty(window, 'scrollY', { value: 2000, configurable: true })
    const { default: AppFooter } = await import('../src/components/AppFooter.vue')
    wrapper = mount(AppFooter, { global: { plugins: [router] }, attachTo: document.body })
    await flushPromises()
    const focusables = [...document.querySelectorAll('footer a, footer button')]
    expect(focusables.at(-1)?.getAttribute('data-testid')).toBe('back-to-top')
    expect(read('src/App.vue')).toMatch(/<AppFooter v-if="!embedded" \/>/)
  })

  it('styles : fixe en bas à droite, 44 px, aplat (ni flou ni transparence), au-dessus de la barre d’essai mobile', () => {
    const src = read('src/components/BackToTop.vue')
    expect(src).toMatch(/\.vb-top \{[^}]*position: fixed; right: 16px; bottom: 16px;/)
    expect(src).toMatch(/width: 44px; height: 44px;/)
    expect(src).toMatch(/background: var\(--bg-card\)/)
    const css = src.slice(src.indexOf('<style>')).replace(/\/\*[\s\S]*?\*\//g, '')
    expect(css).not.toMatch(/backdrop-filter|rgba\(|#[0-9a-f]{3,6}\b/i)
    // Barre d'essai mobile : ≈ 73 px de haut (z-index 60) — le bouton se place au-dessus.
    expect(src).toMatch(/@media \(max-width: 860px\) \{\s*\.vb-site:has\(\.mcta\) \.vb-top \{ bottom: 88px; \}/)
    const z = Number(/z-index: (\d+)/.exec(src)?.[1])
    expect(z).toBeGreaterThan(50) // au-dessus de l'en-tête
    expect(z).toBeLessThan(60) // jamais au-dessus de la barre d'essai ni du sélecteur de préprod (70)
    expect(read('src/components/MobileFixedCta.vue')).toMatch(/\.mcta \{ position: fixed;[^}]*z-index: 60;/)
  })
})
