/**
 * Lot 72G — demande PO du 19/10 (21:30) sur la page d'accueil.
 *
 * 1. Bandeau des types de biens : surtitre et bouton pause retirés
 *    (L72G-01, couvert dans `l71p-features-marquee.test.ts` et par le parcours
 *    clavier de `npm run test:a11y`).
 * 2. « Retrouvez vite ce qui compte » : la mascotte remplace la loupe dans le
 *    champ de recherche (comme le champ « Demander à Verebona » de l'app).
 * 3. « Anticipez les dates importantes » : « Entretien chaudière » et
 *    « Échéance assurance ».
 * 4. Démo de l'application : vignette mobile « Synchronisé » supprimée.
 * 5. « Comment ça marche » : animation de documents qui arrivent dans le
 *    dossier Verebona, jouée une fois à l'apparition ; image fixe en
 *    mouvement réduit.
 *
 * jsdom n'applique ni les media queries ni les animations : règles CSS
 * vérifiées dans les sources, comportement dans les composants montés, rendu
 * réel par les captures (scratchpad l72/landing/apres-*.png).
 */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import AppShowcaseSection from '../src/sections/AppShowcaseSection.vue'
import BenefitsSection from '../src/sections/BenefitsSection.vue'
import HowItWorksSection from '../src/sections/HowItWorksSection.vue'

const root = process.cwd()
const read = (p: string) => readFileSync(path.join(root, p), 'utf8')
const noComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/<!--[\s\S]*?-->/g, '')
const styleOf = (p: string) => noComments(read(p).slice(read(p).indexOf('<style')))
const ssr = async (c: unknown) =>
  (await renderToString(createSSRApp({ render: () => h(c as never) }))).replace(/<!--[\s\S]*?-->/g, '')
function mediaBlock(src: string, cond: string): string {
  const start = src.indexOf(`@media (${cond}) {`)
  if (start < 0) throw new Error(`@media (${cond}) absent`)
  let depth = 0
  for (let i = src.indexOf('{', start); i < src.length; i++) {
    if (src[i] === '{') depth++
    else if (src[i] === '}' && --depth === 0) return src.slice(start, i + 1)
  }
  throw new Error('bloc non fermé')
}

/** IntersectionObserver factice : `fire()` simule l'arrivée à l'écran. */
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

describe('L72G-02 — mascotte dans le champ de recherche', () => {
  it('la mascotte « neutral » de la vitrine remplace la loupe (décorative)', () => {
    const w = track(mount(BenefitsSection))
    const field = w.find('.ben__item--search .ben__search')
    const img = field.find('img.vb-mascot.ben__search-m')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('/assets/mascot/neutral.webp')
    expect(img.attributes('alt')).toBe('')
    expect(field.find('svg').exists()).toBe(false)
    expect(field.text()).toBe('garantie lave-linge')
    expect(existsSync(path.join(root, 'public/assets/mascot/neutral.webp'))).toBe(true)
    // Même asset que la vue « Verebona vous répond » des Fonctionnalités.
    expect(read('src/sections/FeaturesSection.vue')).toContain('/assets/mascot/neutral.webp')
  })

  it('CSS : mascotte de 26 px (comme le champ de l’application), sans déformer le champ', () => {
    const css = styleOf('src/sections/BenefitsSection.vue')
    expect(css).toMatch(/\.ben__search-m \{ width: 26px; flex-shrink: 0; \}/)
    expect(css).toMatch(/\.ben__search \{[^}]*height: 34px;/)
  })
})

describe('L72G-03 — libellés des deux échéances', () => {
  it('« Entretien chaudière » (12 MARS) et « Échéance assurance » (01 JANV)', () => {
    const w = track(mount(BenefitsSection))
    const due = w.findAll('.ben__due')
    expect(due).toHaveLength(2)
    expect(due.map((d) => d.find('.ben__strong').text())).toEqual(['Entretien chaudière', 'Échéance assurance'])
    expect(due[0].find('.ben__date').text()).toMatch(/12\s*MARS/)
    expect(due[1].find('.ben__date').text()).toMatch(/01\s*JANV/)
  })

  it('CSS : libellés sur deux lignes au besoin (grille 4 colonnes), vignette toujours de 120 px', () => {
    const css = styleOf('src/sections/BenefitsSection.vue')
    expect(css).toMatch(/\.ben__due \.ben__strong \{ white-space: normal; text-align: center;/)
    expect(css).toMatch(/\.ben__view \{[^}]*height: 120px;/)
  })
})

describe('L72G-04 — vignette « Synchronisé » supprimée de la démo', () => {
  it('ni carte, ni texte, ni pastilles Web / iOS / Android ; démo ordinateur + téléphone conservée', async () => {
    const w = track(mount(AppShowcaseSection))
    expect(w.find('.app__sync').exists()).toBe(false)
    expect(w.find('.app__chip').exists()).toBe(false)
    expect(w.text()).not.toContain('Synchronisé')
    expect(w.text()).not.toContain('Mêmes biens, documents et échéances sur ordinateur et sur téléphone.')
    expect(w.find('.app__laptop').exists()).toBe(true)
    expect(w.find('.app__phone').exists()).toBe(true)
    expect(await ssr(AppShowcaseSection)).not.toMatch(/app__sync|Synchronisé/)
    expect(read('src/sections/AppShowcaseSection.vue')).not.toMatch(/\.app__sync|\.app__chip/)
  })
})

describe('L72G-05 — dépôt : documents qui arrivent dans le dossier Verebona', () => {
  it('l’ancienne illustration (zone de dépôt + facture-chaudiere-2026.pdf, 182 Ko) a disparu de l’étape 01', () => {
    const w = track(mount(HowItWorksSection))
    const demo = w.find('.how__demo')
    expect(demo.text()).not.toContain('182 Ko')
    expect(demo.find('.how__drop .how__file').exists()).toBe(false)
    expect(read('src/sections/HowItWorksSection.vue')).not.toMatch(/dashed/)
  })

  it('facture, contrat, photo et dossier Verebona ; illustration décorative, légende en texte réel', async () => {
    const w = track(mount(HowItWorksSection))
    const inbox = w.find('.how__inbox')
    expect(inbox.attributes('aria-hidden')).toBe('true')
    expect(inbox.findAll('.how__doc').map((d) => d.find('.how__doc-head').text())).toEqual(['Facture', 'Contrat', 'Photo'])
    expect(inbox.find('.how__folder-front .vb-logo').exists()).toBe(true)
    expect(inbox.find('.how__folder-done').text()).toBe('3 documents rangés')
    expect(inbox.findAll('a, button, input, [tabindex]')).toHaveLength(0)
    expect(w.find('.how__drop > .how__muted').text()).toBe('Photo, PDF ou email — déposé tel quel.')
  })

  it('prérendu (sans JavaScript) : image fixe, ni armée ni jouée', async () => {
    const html = await ssr(HowItWorksSection)
    expect(html).toContain('class="how__inbox"')
    expect(html).not.toMatch(/how__inbox--(armed|play)/)
  })

  it('jouée UNE fois, quand l’illustration arrive à l’écran ; rejouée seulement si l’étape 01 est de nouveau choisie', async () => {
    const w = track(mount(HowItWorksSection, { attachTo: document.body }))
    await flushPromises()
    const cls = () => w.find('.how__inbox').classes()
    expect(cls()).toContain('how__inbox--armed')
    expect(cls()).not.toContain('how__inbox--play')
    fire()
    await flushPromises()
    expect(cls()).toContain('how__inbox--play')
    expect(observers.every((o) => o.disconnected)).toBe(true)
    // Étape 02 puis retour à 01 : nouvelle apparition, nouvelle lecture unique.
    const steps = w.findAll('.how__step')
    await steps[1].trigger('click')
    await flushPromises()
    expect(w.find('.how__inbox').exists()).toBe(false)
    await steps[0].trigger('click')
    await flushPromises()
    expect(cls()).toEqual(expect.arrayContaining(['how__inbox--armed']))
    expect(cls()).not.toContain('how__inbox--play')
    fire()
    await flushPromises()
    expect(cls()).toContain('how__inbox--play')
  })

  it('prefers-reduced-motion : rien n’est armé ni joué (image fixe), aucun observateur', async () => {
    reduce = true
    const w = track(mount(HowItWorksSection, { attachTo: document.body }))
    await flushPromises()
    expect(w.find('.how__inbox').classes()).toEqual(['how__inbox'])
    expect(observers).toHaveLength(0)
  })

  it('CSS : animation légère (translation + opacité, courbe de la charte), une seule fois, < 3 s ; mouvement réduit = image fixe', () => {
    const css = styleOf('src/sections/HowItWorksSection.vue')
    expect(css).toMatch(/\.how__inbox--play \.how__doc \{ animation: how-drop 800ms var\(--ease\) both; \}/)
    expect(css).toMatch(/@keyframes how-drop \{ from \{ opacity: 0; transform: translateY\(-84px\) rotate\(var\(--r, 0deg\)\); \} to \{ opacity: 1; transform: translateY\(0\) rotate\(var\(--r, 0deg\)\); \} \}/)
    expect(css).not.toMatch(/infinite|alternate/)
    // Dernier départ (1250 ms + 800 ms) et mention finale (2100 + 400 ms) : < 3 s.
    expect(css).toMatch(/\.how__inbox--play \.how__folder-done \{ animation: how-fade 400ms var\(--ease\) 2100ms both; \}/)
    expect(css).toMatch(/\.how__inbox--play \.how__doc--3 \{ animation-delay: 1250ms; \}/)
    const m = mediaBlock(css, 'prefers-reduced-motion: reduce')
    expect(m).toMatch(/\.how__inbox \.how__doc, \.how__inbox \.how__folder-done \{ animation: none !important; opacity: 1 !important; \}/)
    // Pas de librairie d'animation : CSS seule, aucune minuterie.
    expect(read('src/sections/HowItWorksSection.vue')).not.toMatch(/setInterval\(|requestAnimationFrame\(|import .*(gsap|lottie|motion)/i)
    // Mobile : dossier plus étroit, sans débordement.
    expect(mediaBlock(css, 'max-width: 860px')).toMatch(/\.how__inbox \{ width: 256px; \}/)
  })
})
