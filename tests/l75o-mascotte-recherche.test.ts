/**
 * Lot 75O — demande PO du 20/10 : « une mascotte qui cherche sur le champ
 * recherche » (bloc « Centralisez, organisez, valorisez. », mini-vue
 * « Retrouvez vite ce qui compte »).
 *
 * Aucun nouveau personnage : pose EXISTANTE `public/assets/mascot/search-loupe.webp`
 * (déjà livrée avec la vitrine, celle que l'application affiche dans son champ
 * pendant une recherche en cours — `spacePose()` → 'search-loupe'), plus une
 * animation CSS légère jouée une seule fois à l'apparition : la requête se
 * tape, la loupe balaie, le résultat apparaît. Mouvement réduit, absence de
 * JavaScript ou d'IntersectionObserver : illustration fixe et complète.
 *
 * jsdom n'applique ni media queries ni animations : règles CSS vérifiées dans
 * la source, comportement dans le composant monté, rendu réel par les captures
 * (scratchpad l75/mascotte-recherche/apres-*.png).
 */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { createSSRApp, h, nextTick } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import BenefitsSection from '../src/sections/BenefitsSection.vue'

const root = process.cwd()
const read = (p: string) => readFileSync(path.join(root, p), 'utf8')
const noComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '')
const css = noComments(read('src/sections/BenefitsSection.vue').slice(read('src/sections/BenefitsSection.vue').indexOf('<style')))
const ms = (v: string) => (v.endsWith('ms') ? parseFloat(v) : parseFloat(v) * 1000)

let observers: Array<{ cb: IntersectionObserverCallback; el?: Element; disconnected: boolean }> = []
class FakeIO {
  rec: (typeof observers)[number]
  constructor(cb: IntersectionObserverCallback) { this.rec = { cb, disconnected: false }; observers.push(this.rec) }
  observe(el: Element) { this.rec.el = el }
  disconnect() { this.rec.disconnected = true }
  unobserve() {}
  takeRecords() { return [] }
}
const fire = () => {
  for (const o of observers.filter((x) => !x.disconnected && x.el)) {
    o.cb([{ isIntersecting: true, target: o.el } as unknown as IntersectionObserverEntry], o as unknown as IntersectionObserver)
  }
}
let reduce = false
let wrappers: VueWrapper[] = []
const track = <T extends VueWrapper>(w: T) => { wrappers.push(w); return w }
beforeEach(() => {
  reduce = false
  observers = []
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: reduce && q.includes('reduce'), media: q, addEventListener() {}, removeEventListener() {} }))
  vi.stubGlobal('IntersectionObserver', FakeIO)
})
afterEach(() => { wrappers.forEach((w) => w.unmount()); wrappers = []; document.body.innerHTML = ''; vi.unstubAllGlobals() })

describe('L75O-M1 — pose existante « search-loupe » dans le champ', () => {
  it('L75O-M1a : la mascotte du champ est la pose search-loupe, décorative, 26 px', () => {
    const w = track(mount(BenefitsSection))
    const img = w.find('.ben__item--search .ben__search img.vb-mascot.ben__search-m')
    expect(img.attributes('src')).toBe('/assets/mascot/search-loupe.webp')
    expect(img.attributes('alt')).toBe('')
    expect(img.attributes('width')).toBe('26')
    expect(w.find('.ben__item--search .ben__view').attributes('aria-hidden')).toBe('true')
    expect(w.find('.ben__query').text()).toBe('garantie lave-linge')
    expect(w.find('.ben__result').text()).toMatch(/Garantie lave-linge[\s\S]*Maison · jusqu’au 03\/2027/)
  })

  it('L75O-M1b : asset déjà présent dans la vitrine (aucun nouveau personnage)', () => {
    expect(existsSync(path.join(root, 'public/assets/mascot/search-loupe.webp'))).toBe(true)
    // Champ « Verebona vous répond » des Fonctionnalités : inchangé.
    expect(read('src/sections/FeaturesSection.vue')).toContain('/assets/mascot/neutral.webp')
  })

  it('L75O-M1c : prérendu (sans JavaScript) — état final complet, rien d’armé', async () => {
    const html = await renderToString(createSSRApp({ render: () => h(BenefitsSection) }))
    expect(html).toContain('search-loupe.webp')
    expect(html).toContain('garantie lave-linge')
    expect(html).toContain('Garantie lave-linge')
    expect(html).not.toMatch(/--armed|--play/)
  })
})

describe('L75O-M2 — animation jouée une seule fois à l’apparition', () => {
  it('L75O-M2a : armée au montage, jouée quand le champ est visible, puis plus observée', async () => {
    const w = track(mount(BenefitsSection, { attachTo: document.body }))
    await nextTick()
    expect(w.find('.ben__search').classes()).toContain('ben__search--armed')
    expect(w.find('.ben__result').classes()).toContain('ben__result--armed')
    expect(w.find('.ben__search').classes()).not.toContain('ben__search--play')
    expect(observers).toHaveLength(1)
    expect(observers[0].el).toBe(w.find('.ben__search').element)
    fire()
    await nextTick()
    expect(w.find('.ben__search').classes()).toContain('ben__search--play')
    expect(w.find('.ben__result').classes()).toContain('ben__result--play')
    expect(observers[0].disconnected).toBe(true)
  })

  it('L75O-M2b : mouvement réduit — rien n’est armé ni observé', async () => {
    reduce = true
    const w = track(mount(BenefitsSection, { attachTo: document.body }))
    await nextTick()
    expect(w.find('.ben__search').classes()).not.toContain('ben__search--armed')
    expect(w.find('.ben__result').classes()).not.toContain('ben__result--armed')
    expect(observers).toHaveLength(0)
  })

  it('L75O-M2c : sans IntersectionObserver — illustration fixe', async () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    const w = track(mount(BenefitsSection, { attachTo: document.body }))
    await nextTick()
    expect(w.find('.ben__search').classes()).not.toContain('ben__search--armed')
  })
})

describe('L75O-M3 — CSS : léger, borné, mouvement réduit respecté', () => {
  it('L75O-M3a : trois keyframes, aucune boucle, fin avant 2 s', () => {
    expect([...css.matchAll(/@keyframes ([\w-]+)/g)].map((m) => m[1])).toEqual(['ben-type', 'ben-scan', 'ben-found'])
    expect(css).not.toMatch(/infinite/)
    for (const m of css.matchAll(/animation: ben-[\w-]+ (\d+m?s) (?:steps\([^)]*\)|var\(--ease\)) (\d+m?s) both/g)) {
      expect(ms(m[1]) + ms(m[2])).toBeLessThanOrEqual(2000)
    }
    expect(css.match(/animation: ben-/g)).toHaveLength(3)
  })

  it('L75O-M3b : pas de rebond (pas d’échelle), déplacements de quelques pixels', () => {
    expect(css).not.toMatch(/scale\(/)
    for (const m of css.matchAll(/translate[XY]?\((-?\d+)px\)/g)) expect(Math.abs(Number(m[1]))).toBeLessThanOrEqual(4)
  })

  it('L75O-M3c : prefers-reduced-motion — aucune animation, état final visible', () => {
    const start = css.indexOf('@media (prefers-reduced-motion: reduce)')
    expect(start).toBeGreaterThan(0)
    const block = css.slice(start, css.indexOf('}\n}', start) + 3)
    expect(block).toMatch(/\.ben__search \.ben__query, \.ben__search \.ben__search-m, \.ben__result \{[^}]*animation: none !important;[^}]*opacity: 1 !important;[^}]*clip-path: none !important;/)
  })

  it('L75O-M3d : aucune minuterie ni bibliothèque d’animation', () => {
    expect(read('src/sections/BenefitsSection.vue')).not.toMatch(/setInterval\(|setTimeout\(|requestAnimationFrame\(|import .*(gsap|lottie|motion)/i)
  })
})
