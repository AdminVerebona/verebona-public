/**
 * Lot 69P — page publique mobile : démonstration produit enrichie.
 *
 * Ticket « Page publique mobile — enrichir et moderniser la démonstration
 * produit » : (1) plusieurs vues de Verebona mises en scène sur mobile (et non
 * une seule vue « Documents ») ; (2) l'ordinateur reste rendu sur mobile, à
 * côté du téléphone ; (3) types de biens en carrousel horizontal natif avec
 * boutons accessibles ; aucun défilement automatique ; prefers-reduced-motion.
 *
 * Lot 71P (décision PO du 19/10) : la visite « Verebona en six vues » est
 * fusionnée dans la section Fonctionnalités (neuf vues, même carrousel natif
 * accessible sur mobile) — les contrôles L69P-01 / 03 / 05 portent désormais
 * sur `FeaturesSection`. Les types de biens redeviennent un BANDEAU défilant
 * (avec bouton de pause, WCAG 2.2.2) : leur carrousel et ses tests sont
 * retirés, le bandeau est couvert par `l71p-features-marquee.test.ts`.
 *
 * jsdom n'applique pas les media queries : les règles responsives sont
 * vérifiées dans les sources CSS, le comportement dans les composants montés.
 * Le rendu réel (320 → 1440 px, zoom 200 %) est contrôlé par les captures et
 * `npm run test:a11y` (axe + parcours clavier de l'accueil).
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import AppShowcaseSection from '../src/sections/AppShowcaseSection.vue'
import FeaturesSection from '../src/sections/FeaturesSection.vue'
import HowItWorksSection from '../src/sections/HowItWorksSection.vue'
import HeroSection from '../src/sections/HeroSection.vue'
import { FEATURES } from '../src/sections/features'

const root = process.cwd()
const read = (p: string) => readFileSync(path.join(root, p), 'utf8')
const noComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '')

/** Contenu du premier bloc `@media (<cond>) { … }` (accolades équilibrées). */
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

let wrappers: VueWrapper[] = []
const track = <T extends VueWrapper>(w: T) => { wrappers.push(w); return w }
let reduce = false

beforeEach(() => {
  reduce = false
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: reduce && q.includes('reduce'), media: q, addEventListener() {}, removeEventListener() {} }))
})
afterEach(() => { wrappers.forEach((w) => w.unmount()); wrappers = []; document.body.innerHTML = ''; vi.useRealTimers() })

/**
 * Géométrie simulée d'une piste : `n` cartes de `w` px espacées de `gap`, piste
 * de `vw` px. `getBoundingClientRect` tient compte de `scrollLeft`.
 */
function fakeGeometry(trackEl: HTMLElement, { w = 150, gap = 12, vw = 390, pad = 20 } = {}) {
  const items = Array.from(trackEl.children) as HTMLElement[]
  const width = pad * 2 + items.length * w + (items.length - 1) * gap
  Object.defineProperty(trackEl, 'clientWidth', { configurable: true, get: () => vw })
  Object.defineProperty(trackEl, 'scrollWidth', { configurable: true, get: () => width })
  let left = 0
  Object.defineProperty(trackEl, 'scrollLeft', { configurable: true, get: () => left, set: (v: number) => { left = v } })
  trackEl.getBoundingClientRect = () => ({ left: 0, right: vw, top: 0, bottom: 100, width: vw, height: 100, x: 0, y: 0, toJSON() {} }) as DOMRect
  trackEl.style.paddingLeft = `${pad}px`
  trackEl.style.paddingRight = `${pad}px`
  items.forEach((it, i) => {
    const x = pad + i * (w + gap)
    Object.defineProperty(it, 'offsetLeft', { configurable: true, get: () => x })
    it.getBoundingClientRect = () => ({ left: x - left, right: x - left + w, top: 0, bottom: 100, width: w, height: 100, x: x - left, y: 0, toJSON() {} }) as DOMRect
  })
  const scrollTo = vi.fn((opts: ScrollToOptions) => { left = Math.min(Math.max(0, opts.left ?? 0), width - vw); trackEl.dispatchEvent(new Event('scroll')) })
  trackEl.scrollTo = scrollTo as unknown as HTMLElement['scrollTo']
  return { scrollTo, setLeft: (v: number) => { left = v; trackEl.dispatchEvent(new Event('scroll')) } }
}
const frame = () => new Promise((r) => setTimeout(r, 40))

describe('L69P-01 — démonstration multi-vues (et plus une seule vue « Documents »)', () => {
  it('vues : bien, documents, informations structurées, agenda, coût de possession, Verebona / mascotte (+ trois vues du lot 71P)', () => {
    const w = track(mount(FeaturesSection))
    const slides = w.findAll('.feat__track > li')
    expect(slides.map((s) => s.attributes('data-view'))).toEqual(['bien', 'docs', 'infos', 'agenda', 'cout', 'question', 'ajour', 'dossier', 'duo'])
    expect(FEATURES).toHaveLength(9)
    slides.forEach((s, i) => {
      // Texte réel (titre + phrase) hors de l'illustration, dans l'ordre visuel.
      expect(s.find('.feat__h3').text()).toContain(FEATURES[i].title)
      expect(s.find('.feat__text').text()).toBe(FEATURES[i].text)
      expect(s.element.lastElementChild?.classList.contains('feat__text')).toBe(true)
      // Cadrage construit en HTML/CSS (pas une capture) : décoratif pour les lecteurs d'écran.
      const stage = s.find('.feat__stage')
      expect(stage.attributes('aria-hidden')).toBe('true')
      expect(stage.text().length).toBeGreaterThan(20)
      for (const img of stage.findAll('img')) expect(img.attributes('alt')).toBe('')
    })
    // Mise en scène : chaque vue superpose au moins une carte « flottante ».
    expect(slides.filter((s) => s.find('.feat__ui--float, .feat__mascot').exists())).toHaveLength(9)
    // Coût de possession : montants écrits ; mascotte : une seule, dans sa vue.
    expect(slides[4].text()).toMatch(/2 180 €[\s\S]*Achat[\s\S]*1 890 €/)
    expect(w.findAll('.feat img.vb-mascot[src*="/assets/mascot/"]').length).toBe(2) // icône du champ (26 px) + mascotte
    expect(slides.filter((_, i) => i !== 5).every((s) => !s.find('img.vb-mascot').exists())).toBe(true)
  })

  it('aucune capture d’écran : les vues n’utilisent que les photos de biens et la mascotte', () => {
    const w = track(mount(FeaturesSection))
    const srcs = w.findAll('.feat img').map((i) => i.attributes('src'))
    for (const s of srcs) expect(s).toMatch(/^\/assets\/(appartement-lyon|velo-cargo|surf-personal)\.webp$|^\/assets\/mascot\//)
  })

  it('héros mobile recomposé : photos de biens conservées (plus de display:none), cartes superposées', () => {
    const css = noComments(mediaBlock(read('src/sections/HeroSection.vue'), 'max-width: 860px'))
    expect(css).not.toMatch(/\.hero__photo[^{]*\{[^}]*display:\s*none/)
    expect(css).toMatch(/\.hero__docs \{[^}]*margin: -\d+px/)
    const w = track(mount(HeroSection))
    expect(w.findAll('.hero__photo')).toHaveLength(3)
    expect(w.find('.hero__montage').attributes('role')).toBe('img')
    for (const img of w.findAll('.hero__montage img')) expect(img.attributes('alt')).toBe('')
  })
})

describe('L69P-02 — l’ordinateur reste rendu sur mobile, avec le téléphone', () => {
  it('ordinateur, téléphone et contrôles présents dans le DOM', () => {
    const w = track(mount(AppShowcaseSection))
    expect(w.find('.app__laptop .app__screen').exists()).toBe(true)
    expect(w.find('.app__phone').exists()).toBe(true)
    // Lot 71 : captures réelles de l'application, une par écran, dans l'ordre du
    // carrousel (Accueil, Mes biens, Mon agenda, Mes documents), décoratives.
    const shots = w.findAll('.app__laptop .app__shot')
    expect(shots.map((s) => s.attributes('src'))).toEqual([
      '/assets/app-desktop-accueil.webp', '/assets/app-desktop-biens.webp',
      '/assets/app-desktop-agenda.webp', '/assets/app-desktop-documents.webp',
    ])
    shots.forEach((s) => expect(s.attributes('alt')).toBe(''))
    // Contrôles du carrousel conservés (boutons nommés et points).
    expect(w.find('button[aria-label="Écran suivant"]').exists()).toBe(true)
    expect(w.find('button[aria-label="Écran précédent"]').exists()).toBe(true)
  })

  it('CSS mobile : aucun display:none sur l’ordinateur, le téléphone ou les contrôles ; cibles de 44 px', () => {
    const src = noComments(read('src/sections/AppShowcaseSection.vue'))
    const m = mediaBlock(src, 'max-width: 860px')
    expect(m).not.toMatch(/\.app__(laptop|phone|dots|bezel|screen)[^{]*\{[^}]*display:\s*none/)
    expect(m).toMatch(/\.app__arrow \{ width: 44px; height: 44px; \}/)
    expect(m).toMatch(/\.app__dot \{ width: 44px; height: 44px; \}/)
    // Téléphone au premier plan, réduit, qui chevauche l'ordinateur (pas d'empilement brut).
    expect(m).toMatch(/\.app__phone \{ position: absolute;[^}]*transform: scale\(/)
  })

  it('changement d’écran : nom annoncé (pas tout le contenu), position écrite', async () => {
    const w = track(mount(AppShowcaseSection))
    expect(w.find('.app__screen').attributes('aria-live')).toBeUndefined()
    expect(w.find('.app__now').text()).toContain('Tableau de bord · 1 / 4')
    await w.find('button[aria-label="Écran suivant"]').trigger('click')
    expect(w.find('.app__now').text()).toContain('Mes biens · 2 / 4')
    // Seule la capture de l'écran courant est affichée.
    const visible = w.findAll('.app__laptop .app__shot').filter((s) => (s.element as HTMLElement).style.display !== 'none')
    expect(visible.map((s) => s.attributes('src'))).toEqual(['/assets/app-desktop-biens.webp'])
    expect(w.find('.app > .vb-container > [aria-live="polite"]').text()).toBe('Écran affiché : Mes biens, 2 sur 4')
    await w.find('button[aria-label="Écran précédent"]').trigger('click')
  })
})

describe('L69P-03 — carrousel horizontal natif et accessible (Fonctionnalités sur mobile depuis le lot 71P)', () => {
  it('CSS : défilement natif à points d’accroche, sans barre visible, sans débordement de page ; boutons 44 px ; focus visible', () => {
    const css = noComments(read('src/style.css'))
    expect(css).toMatch(/\.vb-carousel__track \{[^}]*overflow-x: auto;[^}]*scroll-snap-type: x mandatory;[^}]*scrollbar-width: none;/)
    expect(css).toMatch(/\.vb-carousel__track::-webkit-scrollbar \{ display: none; \}/)
    expect(css).toMatch(/\.vb-carousel__track > \* \{[^}]*scroll-snap-align: start;/)
    expect(css).toMatch(/\.vb-carousel__btn \{[^}]*width: 44px; height: 44px;/)
    expect(css).toMatch(/\.vb-carousel__track:focus-visible \{ outline-offset: -3px;/)
    // Borne atteinte : pas seulement une couleur (opacité + pointillés).
    expect(css).toMatch(/\.vb-carousel__btn\[aria-disabled="true"\] \{[^}]*border-style: dashed;/)
    // Pleine largeur : marges négatives compensées par le padding de la piste elle-même.
    expect(css).toMatch(/\.vb-carousel--bleed \.vb-carousel__track \{ margin-inline: -20px; padding-inline: 20px;/)
    // La vue suivante dépasse sur mobile (≤ 80 % de la largeur).
    expect(noComments(read('src/sections/FeaturesSection.vue'))).toMatch(/\.feat__item \{ width: min\(300px, 80vw\);/)
  })

  it('Fonctionnalités : carrousel accessible (fonctionnalité précédente / suivante, « 1 / 9 »)', async () => {
    const w = track(mount(FeaturesSection, { attachTo: document.body }))
    // Géométrie mobile explicite (piste qui défile) — la piste n'est
    // focalisable que lorsqu'elle défile réellement (grille sur ordinateur).
    const el = w.find('#feat-track').element as HTMLElement
    fakeGeometry(el, { w: 300, gap: 12, vw: 390 })
    el.dispatchEvent(new Event('scroll'))
    await frame(); await flushPromises()
    const region = w.find('.feat__views')
    expect(region.attributes('role')).toBe('region')
    expect(region.attributes('aria-roledescription')).toBe('carrousel')
    expect(document.getElementById(region.attributes('aria-labelledby')!)?.textContent).toBe('Ce que Verebona vous permet de faire.')
    expect(w.find('#feat-track').attributes('tabindex')).toBe('0')
    expect(w.find('#feat-track').attributes('aria-label')).toBe('Fonctionnalités, défilement horizontal')
    const prev = w.find('button[aria-label="Fonctionnalité précédente"]')
    const next = w.find('button[aria-label="Fonctionnalité suivante"]')
    for (const b of [prev, next]) {
      expect(b.attributes('type')).toBe('button')
      expect(b.attributes('aria-controls')).toBe('feat-track')
      expect(b.find('svg').attributes('aria-hidden')).toBe('true')
    }
    expect(prev.attributes('aria-disabled')).toBe('true')
    expect(w.find('.feat__views .vb-carousel__count').text()).toBe('1 / 9')
    expect(w.find('.feat__track').findAll('a, button, input, [tabindex]')).toHaveLength(0)
  })

  it('boutons : déplacement d’une vue, position et annonce ; le bouton désactivé ne fait rien', async () => {
    const w = track(mount(FeaturesSection, { attachTo: document.body }))
    const el = w.find('#feat-track').element as HTMLElement
    const { scrollTo } = fakeGeometry(el, { w: 300, gap: 12, vw: 390 })
    el.dispatchEvent(new Event('scroll'))
    await frame(); await flushPromises()
    const prev = w.find('button[aria-label="Fonctionnalité précédente"]')
    await prev.trigger('click')
    expect(scrollTo).not.toHaveBeenCalled()
    expect(prev.attributes('disabled')).toBeUndefined()
    await w.find('button[aria-label="Fonctionnalité suivante"]').trigger('click')
    expect(scrollTo).toHaveBeenCalledWith({ left: 312, behavior: 'smooth' })
    await frame(); await new Promise((r) => setTimeout(r, 300)); await flushPromises()
    expect(w.find('.feat__views .vb-carousel__count').text()).toBe('2 / 9')
    expect(prev.attributes('aria-disabled')).toBe('false')
    expect(w.find('.feat__views [aria-live="polite"]').text()).toBe('Fonctionnalité 2 sur 9 : Des documents classés')
  })

  it('le swipe natif met à jour la position sans rien annoncer', async () => {
    const w = track(mount(FeaturesSection, { attachTo: document.body }))
    const el = w.find('#feat-track').element as HTMLElement
    const g = fakeGeometry(el, { w: 300, gap: 12, vw: 390 })
    g.setLeft(312 * 8)
    await frame(); await new Promise((r) => setTimeout(r, 300)); await flushPromises()
    expect(w.find('button[aria-label="Fonctionnalité suivante"]').attributes('aria-disabled')).toBe('true')
    expect(w.find('.feat__views .vb-carousel__count').text()).toBe('9 / 9')
    expect(w.find('.feat__views [aria-live="polite"]').text()).toBe('')
  })
})

describe('L69P-04 — aucun défilement automatique', () => {
  it('aucune minuterie de défilement dans les sections et composants de l’accueil', () => {
    const files = ['src/sections/AppShowcaseSection.vue', 'src/sections/HowItWorksSection.vue', 'src/sections/UseCasesSection.vue', 'src/sections/HeroSection.vue',
      'src/sections/FeaturesSection.vue', 'src/components/CarouselControls.vue', 'src/composables/useScrollCarousel.ts', 'src/composables/useLanding.ts']
    for (const f of files) expect(read(f), f).not.toMatch(/setInterval\(/)
    expect(read('src/composables/useScrollCarousel.ts')).not.toMatch(/setTimeout\([^)]*(next|goTo|scrollTo)/)
  })

  // Lot 71P : le bandeau des types de biens défile en continu (décision PO,
  // CSS seule ; lot 72G : sans bouton, arrêt au survol / focus / toucher —
  // l71p-features-marquee.test.ts) ; les
  // carrousels et démonstrations ne bougent toujours jamais seuls.
  it('20 s sans action : rien ne change (ordinateur, « Comment ça marche », carrousels)', async () => {
    vi.useFakeTimers()
    const app = track(mount(AppShowcaseSection, { attachTo: document.body }))
    const how = track(mount(HowItWorksSection, { attachTo: document.body }))
    const feat = track(mount(FeaturesSection, { attachTo: document.body }))
    const spy = vi.fn()
    for (const el of document.querySelectorAll<HTMLElement>('.vb-carousel__track')) el.scrollTo = spy as unknown as HTMLElement['scrollTo']
    const before = [app.find('.app__now').text(), how.findAll('.how__step').map((b) => b.attributes('aria-pressed')).join()]
    vi.advanceTimersByTime(20_000)
    await flushPromises()
    expect([app.find('.app__now').text(), how.findAll('.how__step').map((b) => b.attributes('aria-pressed')).join()]).toEqual(before)
    expect(before[1]).toBe('true,false,false')
    expect(spy).not.toHaveBeenCalled()
    expect((feat.find('#feat-track').element as HTMLElement).scrollLeft).toBe(0)
  })
})

describe('L69P-05 — prefers-reduced-motion', () => {
  it('déplacement instantané au bouton quand l’utilisateur réduit les animations', async () => {
    reduce = true
    const w = track(mount(FeaturesSection, { attachTo: document.body }))
    const el = w.find('#feat-track').element as HTMLElement
    const { scrollTo } = fakeGeometry(el, { w: 300, gap: 12, vw: 390 })
    el.dispatchEvent(new Event('scroll'))
    await frame(); await flushPromises()
    await w.find('button[aria-label="Fonctionnalité suivante"]').trigger('click')
    expect(scrollTo).toHaveBeenCalledWith({ left: 312, behavior: 'auto' })
  })

  it('contenu complet sans animation : toutes les vues sont dans le DOM, fondu neutralisé par la règle globale', () => {
    reduce = true
    const w = track(mount(FeaturesSection))
    expect(w.findAll('.feat__track > li')).toHaveLength(9)
    const style = noComments(read('src/style.css'))
    expect(style).toMatch(/@media \(prefers-reduced-motion: reduce\) \{[^}]*animation-duration: \.01ms !important;[^}]*scroll-behavior: auto !important;/)
    // Seul mouvement ajouté : un fondu d'opacité (charte : « fond et couleur »), sans déplacement.
    const app = noComments(read('src/sections/AppShowcaseSection.vue'))
    expect(app).toMatch(/@keyframes app-fade \{ from \{ opacity: 0; \} to \{ opacity: 1; \} \}/)
    const feat = noComments(read('src/sections/FeaturesSection.vue'))
    expect(feat.slice(feat.indexOf('<style'))).not.toMatch(/animation|@keyframes|transition/)
  })
})
