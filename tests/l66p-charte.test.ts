/**
 * Lot 66P — charte graphique « Sérénité » 2026 sur le site public
 * (charte v1.1 du 14/10/2026 : §1 couleurs, §2 typographie, §3 logo,
 * §4 mascotte, §5 composants, §6 site public).
 *
 * Ces tests verrouillent ce que la migration graphique ne doit ni perdre
 * (états FULL / PRELAUNCH, catalogue d'aide, Ressources) ni réintroduire
 * (anciennes polices, dégradés de fond, contrastes insuffisants).
 */
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { defineComponent, h } from 'vue'
import { readHelpSources } from '../help.build'
import { loadCorpus } from '../src/help/corpus'
import { buildCatalog } from '../src/help/outputs'
import { loadRessourceCorpus } from '../ressources.build'
import { buildRessourceRoutes } from '../src/ressources/outputs'

const root = process.cwd()
const read = (p: string) => readFileSync(path.join(root, p), 'utf8')
const sha = (v: unknown) => createHash('sha256').update(JSON.stringify(v)).digest('hex')

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(path.join(root, dir))) {
    const rel = `${dir}/${name}`
    if (statSync(path.join(root, rel)).isDirectory()) walk(rel, out)
    else out.push(rel)
  }
  return out
}
const styleSources = () => walk('src').filter((f) => /\.(css|vue)$/.test(f))

/** Contraste WCAG 2.x entre deux couleurs #RRGGBB. */
function contrast(a: string, b: string): number {
  const lum = (hex: string) => {
    const [r, g, bl] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl
  }
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/** Valeur hexadécimale d'un jeton de `src/tokens.css`, alias `var(--x)` résolus. */
function token(name: string): string {
  const css = read('src/tokens.css')
  const m = new RegExp(`--${name}:\\s*([^;]+);`).exec(css)
  if (!m) throw new Error(`jeton --${name} absent`)
  const v = m[1].trim()
  const alias = /^var\(--([\w-]+)\)$/.exec(v)
  return alias ? token(alias[1]) : v
}

describe('L66P-01 — jetons de la charte (§1)', () => {
  it('palette de marque exacte', () => {
    expect(token('vb-petrole')).toBe('#17474D')
    expect(token('vb-petrole-hover')).toBe('#10383E')
    expect(token('vb-cuivre')).toBe('#D66B53')
    expect(token('vb-cuivre-texte')).toBe('#AA4E38')
    expect(token('vb-ivoire')).toBe('#F8F6F1')
    expect(token('vb-brume')).toBe('#E2EBE9')
    expect(token('vb-encre')).toBe('#26353B')
    expect(token('vb-gris')).toBe('#52636A')
    expect(token('vb-filet')).toBe('#D5DEDC')
    expect(token('bg-page')).toBe('#F8F6F1')
    expect(token('accent')).toBe('#17474D')
  })

  it('contrastes AA ≥ 4,5:1 des couples de texte utilisés (cuivre doux exclu du petit texte)', () => {
    const pairs: Array<[string, string]> = [
      ['text-primary', 'bg-page'], ['text-muted', 'bg-page'], ['text-muted', 'bg-section'], ['text-muted', 'bg-card'],
      ['text-heading', 'bg-section'], ['attention', 'bg-page'], ['attention', 'bg-card'],
      ['attention-on-subtle', 'bg-section'], ['attention-on-subtle', 'attention-soft'],
      ['on-accent', 'accent'], ['on-accent', 'accent-hover'], ['vb-blanc', 'vb-cuivre-texte'],
    ]
    for (const [fg, bg] of pairs) expect(contrast(token(fg), token(bg)), `${fg} sur ${bg}`).toBeGreaterThanOrEqual(4.5)
    // Le cuivre doux n'atteint pas 4,5:1 : il est réservé aux grands titres (≥ 40 px gras).
    expect(contrast(token('vb-cuivre'), token('bg-page'))).toBeLessThan(4.5)
    const style = read('src/style.css')
    expect(style).toMatch(/\.vb-accent \{ color: var\(--accent-display\); \}/)
    expect(style).toMatch(/@media \(max-width: 860px\) \{[\s\S]*\.vb-accent \{ color: var\(--attention\); \}/)
    // Badge « Recommandé » : pas de blanc sur cuivre doux (3,45:1).
    expect(style).toMatch(/\.vb-badge--recommended \{ background: var\(--vb-cuivre-texte\); color: var\(--vb-blanc\);/)
  })

  it('aucun dégradé de fond dans les styles du site (readme « Fonds »)', () => {
    for (const f of styleSources()) expect(read(f), f).not.toMatch(/(linear|radial|conic)-gradient\(/)
  })

  it('focus : anneau 3 px cuivre texte décalé ; prefers-reduced-motion respecté', () => {
    const style = read('src/style.css')
    expect(token('focus-color')).toBe('#AA4E38')
    expect(style).toMatch(/:focus-visible \{ outline: 3px solid var\(--focus-color\); outline-offset: 3px; \}/)
    expect(style).toMatch(/@media \(prefers-reduced-motion: reduce\)/)
    // 0s et non .01ms : sinon toutes les propriétés transitent (anneau de focus lu à 0 px).
    expect(style).toMatch(/@media \(prefers-reduced-motion: reduce\) \{[^}]*transition-duration: 0s !important;/)
    // Commentaires exclus (« jamais d'`outline: none` sans remplaçant »).
    for (const f of styleSources()) expect(read(f).replace(/\/\*[\s\S]*?\*\//g, ''), f).not.toMatch(/outline:\s*(none|0)\b/)
  })
})

describe('L66P-02 — Figtree seule, auto-hébergée (§2)', () => {
  it('@font-face Figtree vers des fichiers présents, préchargés, repli métrique', () => {
    const fonts = read('src/fonts.css')
    const urls = [...fonts.matchAll(/url\('([^']+)'\)/g)].map((m) => m[1])
    expect(urls).toEqual(['/fonts/figtree-latin-wght-5.3.0.woff2', '/fonts/figtree-latin-ext-wght-5.3.0.woff2'])
    for (const u of urls) expect(existsSync(path.join(root, 'public', u)), u).toBe(true)
    expect(fonts).toMatch(/font-family: 'Figtree Fallback';[\s\S]*size-adjust/)
    expect(read('public/fonts/LICENSE.txt')).toMatch(/Figtree[\s\S]*SIL Open Font License/)
    const html = read('index.html')
    expect(html).toContain('<link rel="preload" href="/fonts/figtree-latin-wght-5.3.0.woff2" as="font" type="font/woff2" crossorigin />')
    expect(html).not.toMatch(/fonts\.(googleapis|gstatic)\.com/)
    expect(token('font-sans')).toMatch(/^'Figtree', 'Figtree Fallback', /)
    expect(read('src/style.css')).toMatch(/body \{[^}]*font-family: var\(--font-sans\);/)
  })

  it('anciennes familles retirées (polices, références)', () => {
    expect(readdirSync(path.join(root, 'public/fonts')).filter((f) => f.endsWith('.woff2')).every((f) => f.startsWith('figtree-'))).toBe(true)
    for (const f of [...styleSources(), ...walk('src').filter((x) => x.endsWith('.ts')), 'index.html']) {
      expect(read(f), f).not.toMatch(/Bricolage|Instrument Sans|Space Mono/)
    }
  })
})

/* ── Accueil monté : modes FULL / PRELAUNCH ─────────────────────────────── */

const Stub = defineComponent({ render: () => h('div') })
const HOME = '../src/views/HomeView.vue'
const HEADER = '../src/components/AppHeader.vue'

async function mountHome(env: { VITE_ENVIRONMENT: string; VITE_DEFAULT_SITE_MODE: string }) {
  vi.resetModules()
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ catalog_version: null, status: 'unavailable', purchasable: false, offers: [] }), { status: 200 })))
  vi.stubEnv('VITE_ENVIRONMENT', env.VITE_ENVIRONMENT)
  vi.stubEnv('VITE_DEFAULT_SITE_MODE', env.VITE_DEFAULT_SITE_MODE)
  Object.defineProperty(window, 'scrollY', { value: 1000, configurable: true })
  window.history.replaceState(null, '', '/')
  const router = createRouter({ history: createMemoryHistory(), routes: ['/', '/aide', '/ressources', '/contact'].map((p) => ({ path: p, component: Stub })) })
  await router.push('/')
  await router.isReady()
  const out: VueWrapper[] = []
  for (const p of [HEADER, HOME]) {
    const mod = await import(/* @vite-ignore */ p)
    out.push(mount(mod.default, { global: { plugins: [router] }, attachTo: document.body }))
  }
  await flushPromises()
  return { header: out[0], home: out[1], all: out }
}

const appLinks = (w: VueWrapper) => w.findAll('a').map((a) => a.attributes('href') ?? '').filter((href) => /\/(signup|login)\b/.test(href))

let mounted: VueWrapper[] = []
afterEach(() => { mounted.forEach((w) => w.unmount()); mounted = []; document.body.innerHTML = '' })

describe('L66P-03 — accueil selon la charte §6, états FULL et PRELAUNCH', () => {
  beforeAll(async () => { await import(/* @vite-ignore */ HOME); await import(/* @vite-ignore */ HEADER) }, 120_000)

  it('ordre des sections : Hero · Bénéfices · Application · Comment ça marche · Cas d’usage · Fonctionnalités · Tarifs · Confiance · FAQ · CTA final', async () => {
    const { home, all } = await mountHome({ VITE_ENVIRONMENT: 'preprod', VITE_DEFAULT_SITE_MODE: 'full' })
    mounted = all
    const classes = home.findAll('main > section').map((s) => s.classes().find((c) => /^(hero|ben|app|how|uc|feat|pr|trust|faq|cta)$/.test(c)))
    expect(classes).toEqual(['hero', 'ben', 'app', 'how', 'uc', 'feat', 'pr', 'trust', 'faq', 'cta'])
    // Ticket SEO accueil : H1 unique, puis le H2 des bénéfices et ses quatre H3.
    const headings = home.findAll('h1, h2, h3').map((e) => `${e.element.tagName}:${e.text()}`)
    expect(home.findAll('h1')).toHaveLength(1)
    expect(headings.slice(0, 6)).toEqual([
      'H1:Profitez de vos biens. Passez moins de temps à les gérer.',
      'H2:Centralisez, organisez, valorisez.',
      'H3:Retrouvez vite ce qui compte', 'H3:Anticipez les dates importantes',
      'H3:Suivez l’histoire de vos biens', 'H3:Valorisez-les le moment venu',
    ])
    // H1 sur deux lignes : pétrole puis mot accentué cuivre.
    const lines = home.findAll('h1 .hero__line')
    expect(lines).toHaveLength(2)
    expect(lines[1].classes()).toContain('vb-accent')
  })

  it('FULL : CTA d’essai (héros, tarifs, menu) et CTA final pétrole « Créez votre compte »', async () => {
    const { header, home, all } = await mountHome({ VITE_ENVIRONMENT: 'preprod', VITE_DEFAULT_SITE_MODE: 'full' })
    mounted = all
    expect(appLinks(header).length).toBeGreaterThan(0)
    expect(appLinks(home).length).toBeGreaterThan(0)
    expect(home.find('.hero a.vb-btn--primary').text()).toContain('Essayer gratuitement pendant 7 jours')
    expect(home.find('.hero').text()).toContain('Essai Premium sans carte bancaire · 2 biens et 30 documents · aucun abonnement déclenché automatiquement')
    expect(home.find('[data-testid="final-cta"]').text()).toBe('Créez votre compte')
    expect(home.find('.vb-pill').exists()).toBe(false)
  })

  it('PRELAUNCH (production) : aucun CTA — ni lien vers l’application, ni bouton d’action, seulement des pilules informatives', async () => {
    const { header, home, all } = await mountHome({ VITE_ENVIRONMENT: 'production', VITE_DEFAULT_SITE_MODE: 'prelaunch' })
    mounted = all
    expect(appLinks(header)).toEqual([])
    expect(appLinks(home)).toEqual([])
    // Aucun lien stylé en bouton d'action (le seul « bouton » restant est le
    // dépliage de la FAQ / des cas d'usage, jamais un lien de souscription).
    expect([...header.findAll('a.vb-btn'), ...home.findAll('a.vb-btn')].map((a) => a.text())).toEqual([])
    const pills = [...header.findAll('.vb-pill'), ...home.findAll('.vb-pill')]
    expect(pills.map((p) => p.element.tagName).every((t) => t !== 'A' && t !== 'BUTTON')).toBe(true)
    expect(pills.map((p) => p.text())).toEqual(expect.arrayContaining(['Ouverture prochaine', 'Verebona arrive bientôt', 'Bientôt disponible']))
    expect(home.find('[data-testid="final-cta"]').exists()).toBe(false)
  })

  it('mascottes : recoloration provisoire par filtre CSS (§4), une seule par premier écran', async () => {
    const { home, all } = await mountHome({ VITE_ENVIRONMENT: 'preprod', VITE_DEFAULT_SITE_MODE: 'full' })
    mounted = all
    const mascots = home.findAll('img').filter((i) => (i.attributes('src') ?? '').includes('/assets/mascot/'))
    expect(mascots.length).toBeGreaterThan(0)
    for (const m of mascots) expect(m.classes(), m.attributes('src')).toContain('vb-mascot')
    expect(home.find('.hero').findAll('img[src*="/assets/mascot/"]')).toHaveLength(1)
    expect(token('vb-mascotte-filtre')).toBe('hue-rotate(-30deg) saturate(1.1) brightness(1.02) contrast(1.08)')
    expect(read('src/style.css')).toMatch(/\.vb-mascot \{ filter: var\(--vb-mascotte-filtre\);/)
  })

  it('header non fixe, logo 34 px (readme « Layout », §3)', async () => {
    const { header, all } = await mountHome({ VITE_ENVIRONMENT: 'preprod', VITE_DEFAULT_SITE_MODE: 'full' })
    mounted = all
    const svg = header.find('a[aria-label="Verebona — accueil"] svg')
    expect(svg.attributes('width')).toBe('34')
    expect(svg.findAll('rect').at(-1)!.attributes('fill')).toBe('#D66B53')
    expect(read('src/components/AppHeader.vue')).not.toMatch(/position:\s*(fixed|sticky)/)
  })
})

describe('L66P-04 — tarifs : la source reste le catalogue de l’application', () => {
  it('aucun montant codé en dur dans la section tarifs', () => {
    const src = read('src/sections/PricingSection.vue')
    expect(src).not.toMatch(/\d+,\d{2}\s*€|\b(39|69|99)\s*€/)
    expect(src).toMatch(/priceOf\(card\.code\)/)
  })
})

describe('L66P-05 — catalogue d’aide et Ressources inchangés par la migration graphique', () => {
  const { files, categories } = readHelpSources(root)
  const corpus = loadCorpus(files, categories)

  it('catalogue JSON lu par l’application : contenu identique à la base lot53pv7', () => {
    const at = '2026-10-16T00:00:00Z'
    const prod = buildCatalog(corpus, 'production', 'v', 'https://www.verebona.fr', at)
    const pre = buildCatalog(corpus, 'preprod', 'v', 'https://www.verebona.fr', at)
    expect(prod.schema).toBe('verebona-help-catalog-v1')
    expect(sha(prod)).toBe('f1ab0c490aa5bd234517c2c1d9074826744a872b64f91d4a743a7b328d00f4b8')
    expect(sha(pre)).toBe('0605045f44887aafb69066162be209cdfa8dce638103401ef6fa8424a319e3f4')
  })

  it('Ressources : routes publiées identiques à la base lot53pv7', () => {
    const rs = loadRessourceCorpus(root)
    expect(sha(buildRessourceRoutes(rs, 'production'))).toBe('a056af5b61f913adfffc13d6f6ca8500fbc6e8431bd60f31e815bed48a0d174e')
  })
})
