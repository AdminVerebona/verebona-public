/**
 * Lot 80P — retour PO du 22/10 : « Carrousel : je ne sais pas pourquoi
 * parfois ça marche et parfois non » (capture : bandeau des types de biens
 * immobile, SUR DEUX LIGNES, coupé entre « Local commercial » et « Loisir /
 * Sport », mots en 22 px).
 *
 * Diagnostic (reproduction Playwright Chromium, scratchpad l80/captures) :
 *   - 252 chargements, 1280 / 1440 / 390 px, à froid, à chaud, ancre
 *     #cas-usage, navigation SPA aller / retour, polices et JS retardés,
 *     page gelée pendant le chargement (onglet en arrière-plan), page
 *     masquée au chargement, CPU ÷ 6, redimensionnement, mouvement réduit
 *     basculé à chaud : le bandeau défile à CHAQUE fois ;
 *   - la seule mise en page « deux lignes, 22 px, 8 px de marge » est celle
 *     de `@media (prefers-reduced-motion: reduce)` ; la capture du PO lui est
 *     identique au pixel près (même coupure de ligne à 1280 px).
 *   Cause : le navigateur du PO signale par moments « mouvement réduit »
 *   (Windows : Accessibilité › Effets visuels › « Effets d'animation »
 *   désactivés — réglage que modifient aussi les sessions Bureau à distance
 *   et certains outils de prise en main à distance ; macOS / iOS « Réduire
 *   les animations » ; Android « Supprimer les animations »). Le site
 *   respecte ce choix (décision 71P, conservée par le ticket).
 *
 * Ces tests verrouillent ce qui rend le comportement déterministe : le repli
 * statique n'existe que sous la préférence système ; le démarrage ne dépend
 * ni d'une mesure de largeur, ni des polices, ni de la visibilité de
 * l'onglet, ni d'un état mémorisé ; un changement de la préférence en cours
 * de visite est suivi dans les deux sens. Géométrie et mouvement réels :
 * `npm run test:a11y` (« Bandeau des types de biens : défile à chaque
 * chargement »).
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import UseCasesSection from '../src/sections/UseCasesSection.vue'

const root = process.cwd()
const read = (p: string) => readFileSync(path.join(root, p), 'utf8')
const noComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/<!--[\s\S]*?-->/g, '').replace(/^\s*\/\/.*$/gm, '')
const sfc = read('src/sections/UseCasesSection.vue')
const css = noComments(sfc.slice(sfc.indexOf('<style')))
const script = noComments(sfc.slice(sfc.indexOf('<script'), sfc.indexOf('</script>')))

/** Découpe un bloc `@media (cond) { … }` ; renvoie aussi la feuille SANS ce bloc. */
function splitMedia(src: string, cond: string): { block: string; rest: string } {
  const start = src.indexOf(`@media (${cond}) {`)
  if (start < 0) throw new Error(`@media (${cond}) absent`)
  let depth = 0
  for (let i = src.indexOf('{', start); i < src.length; i++) {
    if (src[i] === '{') depth++
    else if (src[i] === '}' && --depth === 0) return { block: src.slice(start, i + 1), rest: src.slice(0, start) + src.slice(i + 1) }
  }
  throw new Error('bloc non fermé')
}

/** matchMedia simulé, préférence « mouvement réduit » modifiable en cours de visite. */
function fakeMotion(reduce: boolean) {
  const listeners = new Set<(e: { matches: boolean }) => void>()
  const state = { reduce }
  vi.stubGlobal('matchMedia', (q: string) => ({
    get matches() { return /prefers-reduced-motion: reduce/.test(q) ? state.reduce : false },
    media: q,
    addEventListener: (_: string, f: (e: { matches: boolean }) => void) => listeners.add(f),
    removeEventListener: (_: string, f: (e: { matches: boolean }) => void) => listeners.delete(f),
  }))
  return {
    set(v: boolean) { state.reduce = v; listeners.forEach((f) => f({ matches: v })) },
    listeners,
  }
}

let wrappers: VueWrapper[] = []
afterEach(() => { wrappers.forEach((w) => w.unmount()); wrappers = []; document.body.innerHTML = ''; vi.unstubAllGlobals() })
async function mountUc() {
  const w = mount(UseCasesSection, { attachTo: document.body })
  wrappers.push(w)
  await flushPromises()
  const kinds = () => w.find('.uc__kinds').classes()
  return {
    w,
    m: () => w.find('.uc__marquee'),
    ready: () => kinds().includes('uc__kinds--ready'),
    paused: () => kinds().includes('uc__kinds--paused'),
    copy: () => w.find('.uc__marquee-list--copy').exists(),
  }
}

describe('L80P-D1 — l’état de la capture (deux lignes, immobile) est exclusivement celui du mouvement réduit', () => {
  const { block, rest } = splitMedia(css, 'prefers-reduced-motion: reduce')

  it('repli statique (retour à la ligne, piste en bloc, animation coupée, 22 px / 8 px) : uniquement sous prefers-reduced-motion', () => {
    expect(block).toMatch(/\.uc__kinds \.uc__marquee-track \{ display: block; animation: none !important;/)
    expect(block).toMatch(/\.uc__marquee-list \{ flex-wrap: wrap;/)
    expect(block).toMatch(/\.uc__marquee-item \{ font-size: 22px; padding: 8px 20px 8px 0;/)
    // Hors de ce bloc : aucune règle ne fait passer la liste à la ligne, ne
    // coupe l'animation ni ne retire la copie de boucle.
    expect(rest).not.toMatch(/flex-wrap:\s*wrap/)
    expect(rest).not.toMatch(/animation:\s*none/)
    expect(rest).not.toMatch(/uc__marquee-list--copy[^{]*\{[^}]*display:\s*none/)
    // Mobile : 22 px aussi, mais une seule ligne (14 px de marge, pas de
    // retour à la ligne) — la capture (8 px, deux lignes) n'est pas le mobile.
    expect(splitMedia(css, 'max-width: 860px').block).toMatch(/\.uc__marquee-item \{ font-size: 22px; gap: 20px; padding: 14px 20px 14px 0; \}/)
  })

  it('animation posée par une seule classe, ajoutée au montage, et jamais par une classe de repli', () => {
    expect(rest).toMatch(/\.uc__kinds--ready \.uc__marquee-track \{ animation: uc-marquee 48s linear infinite; \}/)
    expect(sfc).not.toMatch(/uc__kinds--(static|fallback|reduced)/)
  })
})

describe('L80P-D2 — démarrage déterministe : aucune dépendance aux conditions variables du chargement', () => {
  it('ni mesure de largeur, ni polices, ni visibilité de l’onglet, ni observateur, ni état mémorisé', () => {
    for (const re of [/localStorage/, /sessionStorage/, /document\.cookie/, /ResizeObserver/, /IntersectionObserver/,
      /document\.fonts/, /offsetWidth|scrollWidth|clientWidth|getBoundingClientRect/, /visibilityState|document\.hidden/,
      /requestAnimationFrame/, /setTimeout\([^)]*ready/]) {
      expect(script, String(re)).not.toMatch(re)
    }
    // Le seul déclencheur : le montage.
    expect(script).toMatch(/onMounted\(\(\) => \{[\s\S]*ready\.value = true\s*\}\)/)
  })

  it('20 montages successifs (dont certains arrêtés avant démontage) : défile à chaque fois, aucun arrêt reporté', async () => {
    fakeMotion(false)
    for (let i = 0; i < 20; i++) {
      const uc = await mountUc()
      expect(uc.ready(), `montage ${i}`).toBe(true)
      expect(uc.copy(), `montage ${i}`).toBe(true)
      expect(uc.paused(), `montage ${i}`).toBe(false)
      expect(uc.m().attributes('tabindex'), `montage ${i}`).toBe('0')
      if (i % 3 === 0) { uc.m().element.focus(); await flushPromises(); expect(uc.paused()).toBe(true) }
      if (i % 4 === 1) {
        const e = new MouseEvent('click', { bubbles: true })
        const down = new MouseEvent('pointerdown', { bubbles: true })
        Object.defineProperty(down, 'pointerType', { value: 'touch' })
        uc.m().element.dispatchEvent(down); uc.m().element.dispatchEvent(e)
        await flushPromises()
        expect(uc.paused()).toBe(true)
      }
      uc.w.unmount(); wrappers = []
    }
  })
})

describe('L80P-D3 — préférence système modifiée en cours de visite (Bureau à distance, réglage Windows)', () => {
  it('mouvement réduit activé puis désactivé : statique puis défile de nouveau, sans recharger', async () => {
    const motion = fakeMotion(false)
    const uc = await mountUc()
    expect(uc.m().attributes('tabindex')).toBe('0')
    motion.set(true)
    await flushPromises()
    expect(uc.m().attributes('tabindex')).toBeUndefined()
    expect(uc.m().attributes('role')).toBeUndefined()
    expect(uc.paused()).toBe(false)
    motion.set(false)
    await flushPromises()
    expect(uc.ready()).toBe(true)
    expect(uc.copy()).toBe(true)
    expect(uc.m().attributes('tabindex')).toBe('0')
    expect(uc.paused()).toBe(false)
  })

  it('arrivée en mouvement réduit : immobile, pas d’arrêt de tabulation (décision 71P / 72G conservée)', async () => {
    fakeMotion(true)
    const uc = await mountUc()
    expect(uc.m().attributes('tabindex')).toBeUndefined()
    expect(uc.paused()).toBe(false)
  })

  it('écouteur retiré au démontage (aucune fuite entre deux visites SPA de l’accueil)', async () => {
    const motion = fakeMotion(false)
    const uc = await mountUc()
    expect(motion.listeners.size).toBe(1)
    uc.w.unmount(); wrappers = []
    expect(motion.listeners.size).toBe(0)
  })
})

describe('L80P-V1 — version servie : rien ne peut servir un ancien bandeau', () => {
  it('aucun service worker ; HTML revalidé et ressources nommées par empreinte (server.cjs, testé par server.test.ts)', () => {
    for (const f of ['src/main.ts', 'index.html']) expect(read(f)).not.toMatch(/serviceWorker/)
    const server = read('server.cjs')
    expect(server).toMatch(/html: `\$\{cacheScope\}, no-cache`/)
    expect(server).toMatch(/immutable: `\$\{cacheScope\}, max-age=31536000, immutable`/)
  })
})
