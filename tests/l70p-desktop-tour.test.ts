/**
 * Lot 70P — visite « Verebona en six vues » aussi sur ordinateur et tablette.
 *
 * Décision PO du 19/10 : la visite (lot 69P, jusque-là masquée au-dessus de
 * 860 px) s'affiche sous la démonstration ordinateur + téléphone (inchangée),
 * recomposée pour les grands écrans : grille 2 × 3 (768–999 px) puis 3 × 2
 * (≥ 1000 px). UN SEUL composant responsive : le texte des vues n'existe
 * qu'une fois dans le HTML prérendu. Aucun défilement automatique.
 *
 * Également : débordements horizontaux à 195 px (390 px zoomé à 200 %) de
 * l'en-tête, des Tarifs, de Confiance, du CTA final et du pied de page.
 *
 * jsdom n'applique pas les media queries : règles responsives vérifiées dans
 * les sources CSS, comportement dans les composants montés (géométrie
 * simulée), rendu réel par les captures et `npm run test:a11y`.
 *
 * Lot 71P (décision PO du 19/10) : la visite est fusionnée dans la section
 * Fonctionnalités (#features, neuf vues) et quitte la section Application.
 * Les intentions L70P (grille sur grand écran, un seul exemplaire du texte,
 * aucun défilement automatique, charte de la grille) s'appliquent désormais à
 * `FeaturesSection` : grille 2 colonnes dès 768 px, 3 × 3 dès 1000 px.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import AppShowcaseSection from '../src/sections/AppShowcaseSection.vue'
import FeaturesSection from '../src/sections/FeaturesSection.vue'
import { FEATURE_COSTS, FEATURES } from '../src/sections/features'

const root = process.cwd()
const read = (p: string) => readFileSync(path.join(root, p), 'utf8')
const noComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/<!--[\s\S]*?-->/g, '')
const styleOf = (p: string) => noComments(read(p).slice(read(p).indexOf('<style')))

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
beforeEach(() => {
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} }))
})
afterEach(() => { wrappers.forEach((w) => w.unmount()); wrappers = []; document.body.innerHTML = ''; vi.useRealTimers() })

/**
 * Géométrie simulée « ordinateur » : les six vues en grille, toutes entièrement
 * visibles dans la largeur de la piste ; rien ne dépasse (scrollWidth = clientWidth).
 */
function gridGeometry(trackEl: HTMLElement, { vw = 1200, cols = 3, gap = 32 } = {}) {
  const items = Array.from(trackEl.children) as HTMLElement[]
  const w = (vw - (cols - 1) * gap) / cols
  Object.defineProperty(trackEl, 'clientWidth', { configurable: true, get: () => vw })
  Object.defineProperty(trackEl, 'scrollWidth', { configurable: true, get: () => vw })
  Object.defineProperty(trackEl, 'scrollLeft', { configurable: true, get: () => 0, set: () => {} })
  trackEl.getBoundingClientRect = () => ({ left: 0, right: vw, top: 0, bottom: 800, width: vw, height: 800, x: 0, y: 0, toJSON() {} }) as DOMRect
  items.forEach((it, i) => {
    const x = (i % cols) * (w + gap)
    const y = Math.floor(i / cols) * 400
    Object.defineProperty(it, 'offsetLeft', { configurable: true, get: () => x })
    it.getBoundingClientRect = () => ({ left: x, right: x + w, top: y, bottom: y + 360, width: w, height: 360, x, y, toJSON() {} }) as DOMRect
  })
  const scrollTo = vi.fn()
  trackEl.scrollTo = scrollTo as unknown as HTMLElement['scrollTo']
  return { scrollTo }
}
const frame = () => new Promise((r) => setTimeout(r, 40))

async function mountDesktop() {
  const w = mount(FeaturesSection, { attachTo: document.body })
  wrappers.push(w)
  const el = w.find('#feat-track').element as HTMLElement
  const g = gridGeometry(el)
  el.dispatchEvent(new Event('scroll'))
  await frame(); await flushPromises()
  return { w, el, ...g }
}

describe('L70P-01 — les vues sont rendues sur ordinateur et tablette (section Fonctionnalités)', () => {
  it('CSS : aucun masquage des vues ; grille 2 colonnes dès 768 px, 3 colonnes dès 1000 px', () => {
    const css = styleOf('src/sections/FeaturesSection.vue')
    // Ni la section, ni sa piste, ni ses vues ne sont masquées, à aucune largeur.
    expect(css).not.toMatch(/(^|[{}])\s*\.feat(__(views|track|item|stage|h3|text|intro))?(\.vb-carousel \.feat__track)? \{[^}]*display:\s*none/)
    expect(css).not.toMatch(/@media \(min-width: 861px\)/)
    const tablet = mediaBlock(css, 'min-width: 768px')
    expect(tablet).toMatch(/\.feat__views\.vb-carousel \.feat__track \{[^}]*display: grid; grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/)
    expect(tablet).toMatch(/overflow: visible; scroll-snap-type: none;/)
    expect(tablet).toMatch(/\.feat__item \{ width: auto; min-width: 0; \}/)
    // Rien à faire défiler : seuls les boutons sont masqués (pas les vues).
    expect(tablet).toMatch(/\.feat__views \.vb-carousel__controls \{ display: none; \}/)
    expect(tablet.match(/display: none/g)).toHaveLength(1)
    expect(mediaBlock(css, 'min-width: 1000px')).toMatch(/grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/)
    // Le carrousel mobile reste sous 768 px (largeur de carte inchangée).
    expect(mediaBlock(css, 'min-width: 600px) and (max-width: 767px')).toMatch(/\.feat__item \{ width: 300px; \}/)
  })

  it('démonstration ordinateur + téléphone et ses contrôles inchangés dans la section Application', () => {
    const w = mount(AppShowcaseSection); wrappers.push(w)
    const container = w.find('.app > .vb-container').element
    const kids = Array.from(container.children).map((c) => c.className)
    const iDevices = kids.findIndex((c) => c.includes('app__devices'))
    const iDots = kids.findIndex((c) => c.includes('app__dots'))
    expect(iDevices).toBeGreaterThan(-1)
    expect(iDots).toBeGreaterThan(iDevices)
    expect(w.find('.app__laptop .app__screen').exists()).toBe(true)
    expect(w.find('.app__phone').exists()).toBe(true)
  })

  it('grille (rien ne défile) : neuf vues visibles, piste non focalisable, pas annoncée comme carrousel', async () => {
    const { w } = await mountDesktop()
    const region = w.find('.feat__views')
    expect(region.attributes('role')).toBe('region')
    expect(document.getElementById(region.attributes('aria-labelledby')!)?.textContent).toBe('Ce que Verebona vous permet de faire.')
    expect(region.attributes('aria-roledescription')).toBeUndefined()
    const list = w.find('#feat-track')
    expect(list.attributes('tabindex')).toBeUndefined()
    expect(list.attributes('aria-label')).toBe('Fonctionnalités')
    expect(list.findAll('li')).toHaveLength(9)
    // Toujours rien de focalisable dans les vues ; cadrages décoratifs.
    expect(list.findAll('a, button, input, [tabindex]')).toHaveLength(0)
    for (const st of list.findAll('.feat__stage')) expect(st.attributes('aria-hidden')).toBe('true')
    // Les boutons (masqués en CSS) restent cohérents : les deux bornes atteintes.
    expect(w.find('button[aria-label="Fonctionnalité précédente"]').attributes('aria-disabled')).toBe('true')
    expect(w.find('button[aria-label="Fonctionnalité suivante"]').attributes('aria-disabled')).toBe('true')
  })
})

describe('L70P-02 — pas de doublon : un seul exemplaire du texte des vues', () => {
  it('HTML prérendu (SSR) : chaque titre et chaque phrase apparaît exactement une fois', async () => {
    // Commentaires de gabarit retirés (conservés en dev, absents du build de production).
    const html = (await renderToString(createSSRApp(FeaturesSection))).replace(/<!--[\s\S]*?-->/g, '')
    const count = (needle: string) => html.split(needle).length - 1
    const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/'/g, '&#39;')
    for (const v of FEATURES) {
      expect(count(esc(v.title)), v.title).toBe(1)
      expect(count(esc(v.text)), v.text).toBe(1)
    }
    expect(count('id="feat-track"')).toBe(1)
    expect(count('class="feat__views vb-carousel')).toBe(1)
    // Prérendu : état carrousel accessible (la mesure au montage passe en grille).
    expect(html).toMatch(/<ul id="feat-track"[^>]*tabindex="0"/)
  })

  it('DOM monté : neuf titres et neuf phrases, un seul composant', async () => {
    const { w } = await mountDesktop()
    expect(w.findAll('.feat__views')).toHaveLength(1)
    expect(w.findAll('.feat__h3')).toHaveLength(9)
    expect(w.findAll('.feat__text').map((t) => t.text())).toEqual(FEATURES.map((v) => v.text))
    const all = document.body.textContent ?? ''
    for (const v of FEATURES) expect(all.split(v.text).length - 1, v.key).toBe(1)
  })

  it('montants d’exemple « Coût de possession » conservés (validés par le PO)', async () => {
    expect(FEATURE_COSTS).toEqual([
      { label: 'Achat', amount: '1 890 €', pct: 87 },
      { label: 'Entretien', amount: '170 €', pct: 8 },
      { label: 'Assurance', amount: '120 €', pct: 5 },
    ])
    const { w } = await mountDesktop()
    expect(w.find('[data-view="cout"]').text()).toMatch(/2 180 €[\s\S]*Achat[\s\S]*1 890 €[\s\S]*Entretien[\s\S]*170 €[\s\S]*Assurance[\s\S]*120 €/)
  })
})

describe('L70P-03 — aucun défilement automatique sur ordinateur', () => {
  it('20 s sans action : la grille ne bouge pas, rien n’est annoncé', async () => {
    const { w, scrollTo } = await mountDesktop()
    vi.useFakeTimers()
    const before = w.find('.feat__views').html()
    vi.advanceTimersByTime(20_000)
    await flushPromises()
    expect(scrollTo).not.toHaveBeenCalled()
    expect(w.find('.feat__views').html()).toBe(before)
    expect(w.find('.feat__views [aria-live="polite"]').text()).toBe('')
  })

  it('sources : ni minuterie, ni animation, ni transition dans les Fonctionnalités', () => {
    for (const f of ['src/sections/FeaturesSection.vue', 'src/composables/useScrollCarousel.ts']) {
      expect(read(f), f).not.toMatch(/setInterval\(/)
    }
    expect(styleOf('src/sections/FeaturesSection.vue')).not.toMatch(/animation|@keyframes|transition/)
  })
})

describe('L70P-04 — charte « Sérénité » de la grille', () => {
  it('une seule ombre (carte flottante), bordures 1 px, aucun dégradé', () => {
    const css = styleOf('src/sections/FeaturesSection.vue')
    expect(css).not.toMatch(/gradient\(/)
    const shadows = css.match(/[^}]*box-shadow[^}]*\}/g) ?? []
    expect(shadows).toHaveLength(1)
    expect(shadows[0]).toMatch(/\.feat__ui--float \{ box-shadow: var\(--shadow-card\);/)
    for (const b of css.match(/border(-top)?: [^;]+;/g) ?? []) expect(b).toMatch(/^border(-top)?: 1px solid (var\(--[a-z-]+\)|transparent);$/)
  })
})

describe('L70P-05 — zoom 200 % sur téléphone (≈195 px) : plus de débordement horizontal', () => {
  const narrow = (p: string) => mediaBlock(noComments(read(p)), 'max-width: 300px')
  it('en-tête : logo et marges réduits ; menu sur une colonne', () => {
    const m = narrow('src/components/AppHeader.vue')
    expect(m).toMatch(/\.hd__bar \{ padding: 12px; gap: 8px; \}/)
    expect(m).toMatch(/\.hd__logo svg \{ width: 26px; height: 26px; \}/)
  })
  it('Tarifs : colonne sans min-content, badge dans le flux, encart parrainage pleine largeur', () => {
    const m = narrow('src/sections/PricingSection.vue')
    expect(m).toMatch(/\.pr__grid \{ grid-template-columns: minmax\(0, 1fr\); \}/)
    expect(m).toMatch(/\.pr__badge \{ position: static;/)
    expect(m).toMatch(/\.pr__ref-body \{ min-width: 0; flex-basis: 100%; \}/)
  })
  it('Confiance, CTA final, pied de page, titres et boutons globaux', () => {
    expect(narrow('src/sections/TrustSection.vue')).toMatch(/\.trust__intro \{ align-items: stretch; \}/)
    expect(narrow('src/sections/CtaSection.vue')).toMatch(/\.cta__grid \{ grid-template-columns: minmax\(0, 1fr\); \}/)
    expect(narrow('src/components/AppFooter.vue')).toMatch(/\.ft__grid \{ grid-template-columns: minmax\(0, 1fr\);/)
    const g = narrow('src/style.css')
    expect(g).toMatch(/\.vb-h1, \.vb-h2, \.vb-h3 \{ overflow-wrap: anywhere; hyphens: auto; \}/)
    expect(g).toMatch(/\.vb-btn, \.vb-pill \{ white-space: normal;/)
  })
})
