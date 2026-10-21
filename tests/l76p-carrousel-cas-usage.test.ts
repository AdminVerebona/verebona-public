/**
 * Lot 76P — retours PO du 21/10 sur la page d'accueil (desktop + mobile).
 *
 * 1. « Le carrousel de la page publique ne tourne pas en web » : le seul
 *    contenu de l'accueil qui défile seul est le bandeau des types de biens
 *    (lot 71P ; les carrousels Application / Fonctionnalités sont pilotés par
 *    l'utilisateur, sans défilement automatique, lot 69P). Cause racine
 *    (reproduite dans Chromium, scratchpad l76/probe2) : sur ordinateur,
 *      - la pause CSS `:hover` se déclenchait dès que la page, défilée à la
 *        molette, amenait le bandeau sous un pointeur IMMOBILE — il était
 *        arrêté précisément quand on le regardait ;
 *      - un clic souris l'arrêtait durablement (rien ne le relançait en
 *        quittant le bandeau) ;
 *      - le focus clavier l'arrêtait durablement (même après la sortie).
 *    Sur mobile (pas de survol, pas de focus), il tournait.
 *    Correctif : pause au survol VOLONTAIRE (pointeur souris déplacé sur le
 *    bandeau), reprise en le quittant (y compris après un clic) ; pause
 *    pendant le focus clavier, reprise à la sortie. Toucher : arrêt / relance
 *    inchangés. prefers-reduced-motion : toujours immobile (décision 71P).
 * 2. « Alignement ! » : titres des cas d'usage alignés sur une même colonne,
 *    juste après une colonne d'étiquettes de largeur commune (la plus large,
 *    « Déménagement »), mobile et desktop ; aucune étiquette tronquée ; au
 *    zoom 200 % (≈ 195 px) l'étiquette passe au-dessus du titre, toujours
 *    alignée à gauche, sans débordement.
 *
 * jsdom n'a ni mise en page ni animations : comportements sur les composants
 * montés, règles CSS dans les sources ; géométrie réelle par
 * `npm run test:a11y` (scripts/a11y-keyboard.mjs, « Cas d'usage : titres
 * alignés ») et les captures Playwright.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import UseCasesSection from '../src/sections/UseCasesSection.vue'

const root = process.cwd()
const read = (p: string) => readFileSync(path.join(root, p), 'utf8')
const noComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '')
const css = () => noComments(read('src/sections/UseCasesSection.vue').slice(read('src/sections/UseCasesSection.vue').indexOf('<style')))
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

/** Événement pointeur avec type et déplacement (jsdom n'expose pas tout l'init). */
function pointer(el: Element, type: string, pointerType: string, movement = 0) {
  const e = new MouseEvent(type, { bubbles: type !== 'pointerleave', cancelable: true, movementX: movement, movementY: 0 } as MouseEventInit)
  Object.defineProperty(e, 'pointerType', { value: pointerType })
  if (!('movementX' in e) || (e as MouseEvent).movementX !== movement) Object.defineProperty(e, 'movementX', { value: movement })
  el.dispatchEvent(e)
}

let wrappers: VueWrapper[] = []
beforeEach(() => {
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} }))
})
afterEach(() => { wrappers.forEach((w) => w.unmount()); wrappers = []; document.body.innerHTML = '' })
async function mountUc() {
  const w = mount(UseCasesSection, { attachTo: document.body })
  wrappers.push(w)
  await flushPromises()
  return { w, m: w.find('.uc__marquee').element as HTMLElement, paused: () => w.find('.uc__kinds').classes().includes('uc__kinds--paused') }
}

describe('L76P-C1 — bandeau : défile sur ordinateur, pause au survol volontaire seulement', () => {
  it('cause racine supprimée : plus de pause CSS sur un simple :hover', () => {
    expect(css()).not.toMatch(/\.uc__marquee:hover/)
    // Défilement continu inchangé (48 s, -50 %), focus clavier visible inchangé.
    expect(css()).toMatch(/\.uc__kinds--ready \.uc__marquee-track \{ animation: uc-marquee 48s linear infinite; \}/)
    expect(css()).toMatch(/@keyframes uc-marquee \{ from \{ transform: translateX\(0\); \} to \{ transform: translateX\(-50%\); \} \}/)
  })

  it('pointeur immobile amené par le défilement de la page (entrée sans mouvement) : le bandeau continue', async () => {
    const { m, paused } = await mountUc()
    pointer(m, 'pointerover', 'mouse')
    pointer(m, 'pointerenter', 'mouse')
    pointer(m, 'pointermove', 'mouse', 0)
    await flushPromises()
    expect(paused()).toBe(false)
  })

  it('souris déplacée sur le bandeau : pause ; quittée : reprise', async () => {
    const { m, paused } = await mountUc()
    pointer(m, 'pointermove', 'mouse', 4)
    await flushPromises()
    expect(paused()).toBe(true)
    pointer(m, 'pointerleave', 'mouse')
    await flushPromises()
    expect(paused()).toBe(false)
  })

  it('le survol volontaire ne concerne que la souris (toucher / stylet : pas de pause au mouvement)', async () => {
    const { m, paused } = await mountUc()
    pointer(m, 'pointermove', 'touch', 6)
    await flushPromises()
    expect(paused()).toBe(false)
  })
})

describe('L76P-C2 — clic souris : arrêt, puis reprise en quittant le bandeau', () => {
  it('clic → arrêté ; pointeur sorti → reprend (plus d’arrêt durable sur ordinateur)', async () => {
    const { m, paused } = await mountUc()
    pointer(m, 'pointerdown', 'mouse')
    pointer(m, 'pointerup', 'mouse')
    m.click()
    await flushPromises()
    expect(paused()).toBe(true)
    pointer(m, 'pointerleave', 'mouse')
    await flushPromises()
    expect(paused()).toBe(false)
  })

  it('toucher : arrêt puis relance au toucher suivant (inchangé, mobile)', async () => {
    const { m, paused } = await mountUc()
    pointer(m, 'pointerdown', 'touch'); pointer(m, 'pointerup', 'touch'); m.click()
    await flushPromises()
    expect(paused()).toBe(true)
    pointer(m, 'pointerleave', 'touch')
    await flushPromises()
    expect(paused()).toBe(true)
    pointer(m, 'pointerdown', 'touch'); pointer(m, 'pointerup', 'touch'); m.click()
    await flushPromises()
    expect(paused()).toBe(false)
  })
})

describe('L76P-C3 — focus clavier : pause pendant le focus, reprise à la sortie', () => {
  it('Tab sur le bandeau → arrêté ; Tab suivant → reprend', async () => {
    const { m, paused } = await mountUc()
    m.focus()
    await flushPromises()
    expect(paused()).toBe(true)
    m.blur()
    await flushPromises()
    expect(paused()).toBe(false)
  })

  it('accessibilité conservée : arrêt de tabulation nommé, focus visible, prefers-reduced-motion immobile', async () => {
    const { w } = await mountUc()
    expect(w.find('.uc__marquee').attributes('tabindex')).toBe('0')
    expect(w.find('.uc__marquee').attributes('aria-label')).toMatch(/s’arrête au focus, au survol ou au toucher/)
    expect(css()).toMatch(/\.uc__marquee:focus-visible \{ outline-offset: -3px; \}/)
    expect(mediaBlock(css(), 'prefers-reduced-motion: reduce')).toMatch(/animation: none !important/)
  })
})

describe('L76P-A1 — cas d’usage : titres alignés en colonne après les étiquettes', () => {
  it('chaque ligne : étiquette dans une colonne de largeur commune (la plus large des deux listes), puis titre, puis chevron', async () => {
    const { w } = await mountUc()
    const heads = w.findAll('.uc__head')
    expect(heads).toHaveLength(8)
    const badges = heads.map((h) => h.find('.uc__badge').text())
    const longest = [...badges].sort((a, b) => b.length - a.length)[0]
    expect(longest).toBe('Déménagement')
    for (const h of heads) {
      const kids = h.element.children
      expect(kids[0].classList.contains('uc__tag')).toBe(true)
      expect(kids[1].classList.contains('uc__item-title')).toBe(true)
      expect(kids[2].classList.contains('uc__chev')).toBe(true)
      expect(h.find('.uc__tag').attributes('data-sizer')).toBe(longest)
      // Gabarit de largeur : jamais lu ni annoncé (pseudo-élément invisible).
      expect(h.find('.uc__tag').text()).toBe(h.find('.uc__badge').text())
    }
  })

  it('CSS : grille à trois colonnes, gabarit invisible, aucune troncature, mêmes règles desktop et mobile', () => {
    const c = css()
    expect(c).toMatch(/\.uc__head \{[^}]*display: grid; grid-template-columns: auto minmax\(0, 1fr\) auto;/)
    expect(c).toMatch(/\.uc__tag \{ display: grid; justify-items: start; \}/)
    expect(c).toMatch(/\.uc__tag > \.uc__badge, \.uc__tag::after \{ grid-area: 1 \/ 1; \}/)
    expect(c).toMatch(/\.uc__tag::after \{[^}]*content: attr\(data-sizer\);[^}]*visibility: hidden;/)
    expect(c).not.toMatch(/\.uc__(badge|tag)[^{]*\{[^}]*(text-overflow|max-width|overflow: hidden)/)
    // Mobile : seul l'alignement vertical change (haut de la première ligne).
    expect(mediaBlock(c, 'max-width: 860px')).not.toMatch(/\.uc__head \{[^}]*display/)
  })

  it('zoom 200 % (≤ 300 px) : étiquette au-dessus du titre, gabarit retiré, chevron à droite', () => {
    const z = mediaBlock(css(), 'max-width: 300px')
    expect(z).toMatch(/\.uc__head \{ grid-template-columns: minmax\(0, 1fr\) auto; \}/)
    expect(z).toMatch(/\.uc__item-title \{ grid-column: 1; grid-row: 2; \}/)
    expect(z).toMatch(/\.uc__chev \{ grid-column: 2; grid-row: 1; \}/)
    expect(z).toMatch(/\.uc__tag::after \{ display: none; \}/)
  })
})
