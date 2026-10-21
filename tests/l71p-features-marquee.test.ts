/**
 * Lot 71P — décisions PO du 19/10 sur la page d'accueil.
 *
 * 1. La visite « Verebona en six vues » (lots 69P / 70P) est fusionnée dans la
 *    section Fonctionnalités (#features) : neuf vues illustrées, un seul
 *    composant, grille sur grand écran et carrousel accessible sur mobile ; la
 *    visite disparaît de la section Application.
 * 2. « Les biens que Verebona prend en charge » redevient un bandeau défilant
 *    (comme avant le lot 66), accessible : pause au survol et au focus,
 *    arrêt complet en mouvement réduit, contenu unique pour les lecteurs
 *    d'écran, aucun débordement horizontal. Lot 72G (PO) : surtitre et bouton
 *    pause / reprise retirés ; arrêt au clic / toucher (L72G-01).
 * 3. « Centralisez, organisez, valorisez. » : les icônes deviennent des
 *    mini-vues décoratives.
 *
 * jsdom n'applique ni les media queries ni les animations : règles CSS
 * vérifiées dans les sources, comportement dans les composants montés, rendu
 * réel par les captures et `npm run test:a11y` (parcours clavier du bandeau).
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import AppShowcaseSection from '../src/sections/AppShowcaseSection.vue'
import BenefitsSection from '../src/sections/BenefitsSection.vue'
import FeaturesSection from '../src/sections/FeaturesSection.vue'
import UseCasesSection from '../src/sections/UseCasesSection.vue'
import { FEATURES } from '../src/sections/features'

const root = process.cwd()
const read = (p: string) => readFileSync(path.join(root, p), 'utf8')
const noComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/<!--[\s\S]*?-->/g, '')
const styleOf = (p: string) => noComments(read(p).slice(read(p).indexOf('<style')))
const ssr = async (...comps: unknown[]) =>
  (await renderToString(createSSRApp({ render: () => comps.map((c) => h(c as never)) }))).replace(/<!--[\s\S]*?-->/g, '')

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
function srcFiles(dir: string): string[] {
  return readdirSync(path.join(root, dir)).flatMap((f) => {
    const p = path.join(dir, f)
    return statSync(path.join(root, p)).isDirectory() ? srcFiles(p) : [p]
  })
}

let wrappers: VueWrapper[] = []
const track = <T extends VueWrapper>(w: T) => { wrappers.push(w); return w }
beforeEach(() => {
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} }))
})
afterEach(() => { wrappers.forEach((w) => w.unmount()); wrappers = []; document.body.innerHTML = '' })

const TITLES = [
  'La fiche de chaque bien', 'Des documents classés', 'Des informations extraites',
  'Un agenda des échéances', 'Le coût de possession', 'Verebona vous répond',
  'Un espace toujours à jour', 'Un dossier complet en un clic', 'L’espace Duo',
]
const KINDS = ['Voiture', 'Appartement', 'Garage', 'Moto', 'Maison', 'Terrain', 'Vélo', 'Local commercial', 'Loisir / Sport', 'Électronique']

describe('L71P-01 — Fonctionnalités : neuf vues, dans l’ordre du PO', () => {
  it('neuf cartes, titres et ordre exacts ; H2 puis neuf H3 ; numéros décoratifs', () => {
    const w = track(mount(FeaturesSection))
    expect(w.find('section').attributes('id')).toBe('features')
    const items = w.findAll('#feat-track > li')
    expect(items).toHaveLength(9)
    expect(items.map((i) => i.attributes('data-view'))).toEqual(['bien', 'docs', 'infos', 'agenda', 'cout', 'question', 'ajour', 'dossier', 'duo'])
    expect(FEATURES.map((f) => f.title)).toEqual(TITLES)
    const hs = w.findAll('h2, h3').map((e) => `${e.element.tagName}:${e.text()}`)
    expect(hs).toEqual(['H2:Ce que Verebona vous permet de faire.', ...TITLES.map((t, i) => `H3:${String(i + 1).padStart(2, '0')}${t}`)])
    for (const n of w.findAll('.feat__num')) expect(n.attributes('aria-hidden')).toBe('true')
  })

  it('textes repris des anciennes cartes quand elles correspondent, sinon de la visite', () => {
    const t = Object.fromEntries(FEATURES.map((f) => [f.key, f.text]))
    expect(t.agenda).toBe('Toutes les dates liées à vos biens réunies dans un agenda unique, alimenté automatiquement.')
    expect(t.ajour).toBe('Repérez d’un coup d’œil les fiches incomplètes et complétez-les en quelques secondes.')
    expect(t.dossier).toBe('Exportez un dossier structuré — vente, assurance, succession — prêt à partager.')
    expect(t.duo).toBe('Collaborez avec une autre personne dans un espace commun, sans perdre en organisation.')
    expect(t.question).toBe('Posez une question sur vos biens : la réponse s’appuie sur vos propres documents.')
  })

  it('vues riches du PO : fiche presque complète, Dossier_vente.zip prêt, espace commun à deux, coût 2 180 €', () => {
    const w = track(mount(FeaturesSection))
    const v = (k: string) => w.find(`[data-view="${k}"] .feat__stage`).text()
    expect(v('ajour')).toMatch(/Fiche presque complète[\s\S]*À compléter/)
    expect(v('dossier')).toMatch(/Dossier_vente\.zip[\s\S]*Prêt/)
    expect(v('duo')).toMatch(/Espace commun[\s\S]*Léa & Marc · 2 membres/)
    expect(v('cout')).toMatch(/2 180 €[\s\S]*1 890 €[\s\S]*170 €[\s\S]*120 €/)
    expect(w.find('[data-view="question"] img.feat__mascot').exists()).toBe(true)
  })
})

describe('L71P-02 — la visite a quitté la section Application', () => {
  it('Application : démonstration ordinateur + téléphone conservée, plus aucune visite', async () => {
    const w = track(mount(AppShowcaseSection))
    expect(w.find('.app__laptop').exists()).toBe(true)
    expect(w.find('.app__phone').exists()).toBe(true)
    expect(w.find('.tour, #tour-track').exists()).toBe(false)
    expect(w.text()).not.toContain('Verebona en six vues')
    for (const f of FEATURES) expect(w.text()).not.toContain(f.text)
    expect(await ssr(AppShowcaseSection)).not.toMatch(/six vues|tour__/)
  })

  it('code devenu inutile supprimé (ProductTour, tour.ts, carrousel des types de biens)', () => {
    expect(existsSync(path.join(root, 'src/components/demo/ProductTour.vue'))).toBe(false)
    expect(existsSync(path.join(root, 'src/components/demo/tour.ts'))).toBe(false)
    for (const f of srcFiles('src').filter((p) => /\.(vue|ts)$/.test(p))) {
      expect(read(f), f).not.toMatch(/ProductTour|TOUR_VIEWS|tour__|uc__kind\b|uc__kinds-wrap/)
    }
    expect(read('src/sections/UseCasesSection.vue')).not.toMatch(/CarouselControls|useScrollCarousel/)
  })
})

describe('L71P-03 — pas de doublon de texte', () => {
  it('HTML prérendu de l’accueil (Application + Fonctionnalités) : chaque titre / phrase une seule fois', async () => {
    const html = await ssr(AppShowcaseSection, FeaturesSection)
    const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/'/g, '&#39;')
    const count = (n: string) => html.split(esc(n)).length - 1
    for (const f of FEATURES) {
      expect(count(f.title), f.title).toBe(1)
      expect(count(f.text), f.text).toBe(1)
    }
    // Anciens titres des cartes Fonctionnalités remplacés.
    for (const old of ['Centralisez vos biens', 'Reliez documents', 'Partagez à deux (Duo)', 'L&#39;agenda de vos biens']) expect(html).not.toContain(old)
  })
})

describe('L71P-04 / L72G-01 — bandeau défilant des types de biens (WCAG 2.2.2, sans bouton visible)', () => {
  // Lot 72G (demande PO du 19/10) : ni surtitre ni bouton « Mettre en pause ».
  // Alternative conservée : arrêt au survol, au focus clavier, au clic /
  // toucher ; aucun mouvement en prefers-reduced-motion.
  it('prérendu : une seule liste de 10 types, dans l’ordre, sans copie de boucle ; ni surtitre ni bouton ; pas d’arrêt de tabulation', async () => {
    const html = await ssr(UseCasesSection)
    for (const k of KINDS) expect(html.split(`>${k.replace('/', '/')}</li>`).length - 1, k).toBe(1)
    expect(html).not.toContain('uc__marquee-list--copy')
    expect(html).not.toContain('uc__kinds--ready')
    expect(html).not.toMatch(/uc__kinds-toggle|uc__kinds-title|Mettre en pause|Les biens que Verebona prend en charge<\/p>/)
    expect(html).not.toMatch(/class="uc__marquee"[^>]*tabindex/)
    expect(html).toMatch(/<ul id="uc-kinds" class="uc__marquee-list" aria-label="Les biens que Verebona prend en charge">/)
  })

  it('monté : liste nommée ; copie de boucle aria-hidden ; aucun bouton ; le bandeau est un arrêt de tabulation nommé', async () => {
    const w = track(mount(UseCasesSection, { attachTo: document.body }))
    await flushPromises()
    const list = w.find('#uc-kinds')
    expect(list.attributes('aria-label')).toBe('Les biens que Verebona prend en charge')
    expect(list.findAll('li').map((l) => l.text())).toEqual(KINDS)
    expect(list.attributes('aria-hidden')).toBeUndefined()
    const copy = w.find('.uc__marquee-list--copy')
    expect(copy.attributes('aria-hidden')).toBe('true')
    expect(copy.findAll('li').map((l) => l.text())).toEqual(KINDS)
    expect(w.findAll('.uc__marquee ul:not([aria-hidden])')).toHaveLength(1)
    expect(w.find('.uc__kinds').findAll('a, button, input')).toHaveLength(0)
    expect(w.find('.uc__kinds').text()).not.toMatch(/pause|Reprendre|prend en charge/i)
    const m = w.find('.uc__marquee')
    expect(m.attributes('tabindex')).toBe('0')
    expect(m.attributes('role')).toBe('group')
    expect(m.attributes('aria-label')).toMatch(/s’arrête au focus, au survol ou au toucher/)
    expect(w.find('.uc__kinds').classes()).toContain('uc__kinds--ready')
  })

  it('clic / toucher : arrête puis relance le défilement', async () => {
    const w = track(mount(UseCasesSection, { attachTo: document.body }))
    await flushPromises()
    const m = w.find('.uc__marquee')
    await m.trigger('pointerdown')
    await m.trigger('pointerup')
    await m.trigger('click')
    expect(w.find('.uc__kinds').classes()).toContain('uc__kinds--paused')
    await m.trigger('click')
    expect(w.find('.uc__kinds').classes()).not.toContain('uc__kinds--paused')
  })

  it('focus clavier : arrêt durable (même après la sortie du focus) ; un focus donné au pointeur n’arrête pas', async () => {
    const w = track(mount(UseCasesSection, { attachTo: document.body }))
    await flushPromises()
    const m = w.find('.uc__marquee')
    const el = m.element as HTMLElement
    await m.trigger('pointerdown')
    el.focus()
    await flushPromises()
    expect(w.find('.uc__kinds').classes()).not.toContain('uc__kinds--paused')
    await m.trigger('pointerup')
    await new Promise((r) => setTimeout(r, 650))
    el.blur()
    el.focus()
    await flushPromises()
    expect(w.find('.uc__kinds').classes()).toContain('uc__kinds--paused')
    el.blur()
    await flushPromises()
    expect(w.find('.uc__kinds').classes()).toContain('uc__kinds--paused')
  })

  it('prefers-reduced-motion : ni arrêt de tabulation ni rôle (rien ne bouge), clic sans effet', async () => {
    vi.stubGlobal('matchMedia', (q: string) => ({ matches: q.includes('reduce'), media: q, addEventListener() {}, removeEventListener() {} }))
    const w = track(mount(UseCasesSection, { attachTo: document.body }))
    await flushPromises()
    const m = w.find('.uc__marquee')
    expect(m.attributes('tabindex')).toBeUndefined()
    expect(m.attributes('role')).toBeUndefined()
    await m.trigger('click')
    expect(w.find('.uc__kinds').classes()).not.toContain('uc__kinds--paused')
  })

  it('CSS : défilement continu après montage, pause au survol (pointeur fin), au focus et à l’arrêt ; aucun débordement de page', () => {
    const css = styleOf('src/sections/UseCasesSection.vue')
    expect(css).toMatch(/\.uc__marquee \{ overflow: hidden;/)
    expect(css).toMatch(/\.uc__kinds--ready \.uc__marquee-track \{ animation: uc-marquee \d+s linear infinite; \}/)
    expect(css).toMatch(/\.uc__kinds--paused \.uc__marquee-track, \.uc__marquee:focus-visible \.uc__marquee-track \{ animation-play-state: paused; \}/)
    expect(mediaBlock(css, 'hover: hover')).toMatch(/\.uc__marquee:hover \.uc__marquee-track \{ animation-play-state: paused; \}/)
    expect(css).toMatch(/\.uc__marquee:focus-visible \{ outline-offset: -3px; \}/)
    expect(css).toMatch(/@keyframes uc-marquee \{ from \{ transform: translateX\(0\); \} to \{ transform: translateX\(-50%\); \} \}/)
    expect(css).not.toMatch(/uc__kinds-toggle|uc__kinds-title|uc__kinds-head/)
    expect(css).not.toMatch(/gradient\(/)
    // Mobile : bandeau jusqu'aux bords de l'écran, toujours découpé.
    expect(mediaBlock(css, 'max-width: 860px')).toMatch(/\.uc__marquee \{ margin-inline: -20px; padding-inline: 20px; \}/)
    // Aucune minuterie JavaScript ne fait bouger le bandeau.
    expect(read('src/sections/UseCasesSection.vue')).not.toMatch(/setInterval\(|requestAnimationFrame\(/)
    // Icônes pause / lecture devenues inutiles : retirées.
    expect(read('src/components/icons.ts')).not.toMatch(/^\s*(pause|play):/m)
  })

  it('prefers-reduced-motion : arrêt complet, liste statique lisible, sans copie', () => {
    const m = mediaBlock(styleOf('src/sections/UseCasesSection.vue'), 'prefers-reduced-motion: reduce')
    expect(m).toMatch(/\.uc__kinds \.uc__marquee-track \{ display: block; animation: none !important; transform: none; width: auto; \}/)
    expect(m).toMatch(/\.uc__marquee-list \{ flex-wrap: wrap; flex-shrink: 1; min-width: 0; \}/)
    expect(m).toMatch(/\.uc__marquee-list--copy \{ display: none; \}/)
  })
})

describe('L71P-05 — « Centralisez, organisez, valorisez. » : mini-vues', () => {
  it('quatre mini-vues décoratives au-dessus des titres ; titres, textes et signature conservés', () => {
    const w = track(mount(BenefitsSection))
    const items = w.findAll('.ben__item')
    expect(items).toHaveLength(4)
    expect(w.find('.ben__icon').exists()).toBe(false)
    const expected: Array<[string, string, RegExp]> = [
      ['Retrouvez vite ce qui compte', 'Contrats, garanties, diagnostics au bon endroit.', /garantie lave-linge[\s\S]*Garantie lave-linge/],
      ['Anticipez les dates importantes', 'Assurances, contrôles et entretiens au bon moment.', /12\s*MARS[\s\S]*01\s*JANV/],
      ['Suivez l’histoire de vos biens', 'Un historique clair qui se construit dans le temps.', /2021\s*Achat[\s\S]*2024\s*Entretien[\s\S]*2026\s*Réparation/],
      ['Valorisez-les le moment venu', 'Vente, assurance ou transmission mieux documentées.', /Dossier de vente[\s\S]*Prêt[\s\S]*Valeur estimée/],
    ]
    items.forEach((it, i) => {
      const view = it.find('.ben__view')
      expect(view.attributes('aria-hidden')).toBe('true')
      expect(it.element.firstElementChild).toBe(view.element)
      expect(view.text()).toMatch(expected[i][2])
      expect(view.findAll('h1, h2, h3, h4, a, button, input, [tabindex]')).toHaveLength(0)
      expect(it.find('h3').text()).toBe(expected[i][0])
      expect(it.find('.ben__text').text()).toBe(expected[i][1])
    })
    expect(w.find('.ben__sign').text()).toBe('Être prêt avant d’en avoir besoin.')
  })

  // Lot 75O : seule exception, la recherche animée de « Retrouvez » (règles
  // `ben__search--play` / `ben__result--play`, l75o-mascotte-recherche.test.ts).
  it('CSS : vignette de 120 px, aplats et bordures 1 px, sans ombre ni autre animation', () => {
    const css = styleOf('src/sections/BenefitsSection.vue')
    expect(css).toMatch(/\.ben__view \{[^}]*height: 120px;/)
    expect(css).not.toMatch(/gradient\(|box-shadow/)
    const anims = css.split('}').filter((r) => /animation/.test(r)).map((r) => r.trim().split('{')[0].trim())
    expect(anims.every((sel) => /ben__(search|result)|^@media|^\.ben__search \.ben__query/.test(sel) || sel === '')).toBe(true)
    expect([...css.matchAll(/@keyframes ([\w-]+)/g)].map((m) => m[1])).toEqual(['ben-type', 'ben-scan', 'ben-found'])
  })
})
