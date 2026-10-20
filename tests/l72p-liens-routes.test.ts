/**
 * Lot 72 — cohérence liens ↔ routes ↔ ancres du site public (ticket
 * « liens obsolètes app ↔ vitrine », §3.2, §3.5).
 *
 * Tout est DÉRIVÉ DU CODE :
 *   · routes   : le routeur instancié (`src/router/index.ts`) doit déclarer
 *                exactement la table `src/router/route-paths.ts` ;
 *   · ancres   : `id` statiques des composants de l'accueil ;
 *   · liens    : chaque `link('…')`, `anchor('…')`, `router.push('…')`,
 *                `to="…"`, `href="/…"` ou `href="#…"` des sources.
 *
 * `link-inventory.json` (racine) est l'inventaire commité, copié dans
 * l'application. Il est régénéré par :
 *     UPDATE_LINK_INVENTORY=1 npx vitest run tests/l72p-liens-routes.test.ts
 */
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { mount, flushPromises } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { defineComponent, h } from 'vue'
import { ROUTE_PATHS } from '../src/router/route-paths'
import { checkPublicHref, inventoryDrift, type LinkInventory } from '../src/config/link-inventory.rules'
import { LINK_INVENTORY_FILE, computeLinkInventory, serializeInventory, sourceFiles } from '../link-inventory.build'
import { INDEXABLE_PATHS } from '../src/config/sitemap.rules'
import { loadHelpCorpus } from '../help.build'
import { helpSitemapPaths } from '../src/help/outputs'
import { loadRessourceCorpus } from '../ressources.build'
import { ressourcesSitemapPaths } from '../src/ressources/outputs'

const root = process.cwd()
const current = computeLinkInventory(root)
const inventoryPath = path.join(root, LINK_INVENTORY_FILE)
if (process.env.UPDATE_LINK_INVENTORY === '1') writeFileSync(inventoryPath, serializeInventory(current))
const lire = (f: string) => readFileSync(path.join(root, f), 'utf8')

describe('L72P-INV-01 — inventaire dérivé du code, commité et à jour', () => {
  it('L72P-INV-01a — le routeur instancié déclare exactement la table `route-paths.ts`', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 200 })))
    const { default: router } = await import('../src/router/index')
    const declared = router.getRoutes().map((r) => r.path).sort()
    expect(declared).toEqual(Object.values(ROUTE_PATHS).map((p) => p).sort())
  }, 30_000)

  it('L72P-INV-01b — `link-inventory.json` existe et ne dérive pas du code (sinon : UPDATE_LINK_INVENTORY=1)', () => {
    expect(existsSync(inventoryPath), `${LINK_INVENTORY_FILE} absent`).toBe(true)
    const committed = JSON.parse(readFileSync(inventoryPath, 'utf8')) as LinkInventory
    expect(inventoryDrift(committed, current)).toEqual([])
  })

  it('L72P-INV-01c — contenu attendu : routes, ancres de l’accueil, routes dynamiques, liens vers l’application', () => {
    expect(current.routes.static).toEqual(expect.arrayContaining(['/', '/aide', '/ressources', '/contact', '/mentions-legales', '/cgu', '/confidentialite']))
    expect(current.routes.static).not.toContain('/pourquoi-verebona')
    expect(current.routes.static).not.toContain('/comment-ca-marche')
    expect(current.routes.dynamic).toEqual(['/aide/:slug', '/aide/theme/:category', '/ressources/:slug'])
    // Sections ancrées de l'accueil (menus, pied de page, application).
    expect(current.homeAnchors).toEqual(expect.arrayContaining(['how', 'cas-usage', 'features', 'pricing', 'faq']))
    expect(current.pages.help.length).toBeGreaterThan(0)
    expect(current.appLinks).toEqual(expect.arrayContaining(['/login', '/signup']))
  })

  it('L72P-INV-01d — la détection de dérive n’est pas vide : une ancre retirée ou une page disparue est signalée', () => {
    const sans = { ...current, homeAnchors: current.homeAnchors.filter((a) => a !== 'how') }
    expect(inventoryDrift(current, sans)).toContain('ancres de l’accueil modifiées')
    const pageEnMoins = { ...current, pages: { ...current.pages, help: current.pages.help.slice(1) } }
    expect(inventoryDrift(current, pageEnMoins)[0]).toMatch(/pages help disparues/)
    // Publier un article n'est pas une dérive.
    const pagePlus = { ...current, pages: { ...current.pages, help: [...current.pages.help, '/aide/nouveau'] } }
    expect(inventoryDrift(current, pagePlus)).toEqual([])
  })
})

describe('L72P-INV-02 — anciennes URL : redirections intentionnelles distinguées des liens cassés', () => {
  it('L72P-INV-02a — /comment-ca-marche → /#how (destination finale valide, ancre présente) ; /pourquoi-verebona retirée', () => {
    expect(current.legacyRedirects).toEqual({ '/comment-ca-marche': '/#how' })
    expect(current.retired).toEqual(['/pourquoi-verebona'])
  })

  it('L72P-INV-02b — aucune chaîne : chaque cible est une destination finale existante, aucune ancienne URL n’est une route', () => {
    for (const [from, to] of Object.entries(current.legacyRedirects)) {
      expect({ from, verdict: checkPublicHref(to, current) }).toEqual({ from, verdict: { status: 'ok' } })
      expect(current.routes.static).not.toContain(from)
    }
    for (const p of current.retired) expect(current.routes.static).not.toContain(p)
  })

  it('L72P-INV-02c — verdicts : lien cassé, ancre absente, redirection, page retirée, route dynamique', () => {
    expect(checkPublicHref('/comment-ca-marche', current)).toEqual({ status: 'redirect', target: '/#how' })
    expect(checkPublicHref('/pourquoi-verebona', current)).toEqual({ status: 'retired' })
    expect(checkPublicHref('/tarifs', current)).toEqual({ status: 'missing-page' })
    expect(checkPublicHref('/#nexiste-pas', current)).toEqual({ status: 'missing-anchor', anchor: 'nexiste-pas' })
    expect(checkPublicHref('/contact#how', current)).toEqual({ status: 'missing-anchor', anchor: 'how' })
    expect(checkPublicHref('/#pricing', current)).toEqual({ status: 'ok' })
    expect(checkPublicHref(current.pages.help[0], current)).toEqual({ status: 'ok' })
    expect(checkPublicHref('/aide/article-inexistant', current)).toEqual({ status: 'missing-page' })
    expect(checkPublicHref('/aide?q=facture', current)).toEqual({ status: 'ok' })
    expect(checkPublicHref('/aide/catalogue.json', current)).toEqual({ status: 'ok' })
    expect(checkPublicHref('/aide/inconnu.json', current)).toEqual({ status: 'missing-page' })
  })
})

describe('L72P-INV-03 — liens internes de la vitrine (headers, footers, menus, pages)', () => {
  const files = sourceFiles(root)
  const found: Array<{ file: string; href: string; relative?: boolean }> = []
  const samePage: Array<{ file: string; href: string }> = []
  for (const file of files) {
    const src = lire(file)
    const add = (href: string, relative = false) => found.push({ file, href, ...(relative ? { relative } : {}) })
    for (const m of src.matchAll(/\blink\(\s*'([^']+)'\s*\)/g)) add(m[1])
    for (const m of src.matchAll(/\b(?:anchor|goToAnchor)\(\s*'([^']+)'\s*\)/g)) add(`/#${m[1]}`)
    for (const m of src.matchAll(/router\.push\(\s*'([^']+)'\s*\)/g)) add(m[1])
    for (const m of src.matchAll(/router\.push\(\{\s*path:\s*'([^']+)'/g)) add(m[1])
    for (const m of src.matchAll(/(?<![:\w])to="(\/[^"]*)"/g)) add(m[1])
    for (const m of src.matchAll(/(?<![:\w])href="(\/[^"/][^"]*|\/)"/g)) add(m[1])
    // Ancre relative : vers un `id` du même composant (même page), sinon
    // elle n'a de sens que sur l'accueil (sections de HomeView).
    for (const m of src.matchAll(/(?<![:\w])href="#([^"]+)"/g)) {
      if (new RegExp(`(?<![:\\w-])id="${m[1]}"`).test(src)) samePage.push({ file, href: `#${m[1]}` })
      else add(`/#${m[1]}`, true)
    }
  }

  it('L72P-INV-03a — l’analyse trouve bien les liens (contrôle non vide)', () => {
    expect(found.length).toBeGreaterThan(20)
    expect(found.some((f) => f.href === '/#how')).toBe(true)
    expect(found.some((f) => f.href === '/ressources')).toBe(true)
    // Ancre vers la même page reconnue comme telle (Centre d'aide : « Rechercher »).
    expect(samePage).toContainEqual({ file: 'src/views/help/HelpArticleView.vue', href: '#ha-search-zone' })
  })

  it('L72P-INV-03b — chaque lien interne mène à une route, une page du corpus ou une ancre existante', () => {
    const casses = found
      .filter(({ href }) => !href.startsWith('/assets/') && !href.startsWith('/fonts/'))
      .map(({ file, href }) => ({ file, href, verdict: checkPublicHref(href, current) }))
      .filter((r) => r.verdict.status !== 'ok')
    expect(casses).toEqual([])
  })

  it('L72P-INV-03c — ancres relatives (`href="#…"`) réservées aux sections de l’accueil', () => {
    const relatives = found.filter((f) => f.relative)
    expect(relatives.length).toBeGreaterThan(0) // CTA final (#pricing) : contrôle non vide
    for (const { file } of relatives) expect(file, file).toMatch(/^src\/sections\//)
  })
})

describe('L72P-INV-04 — header, menu mobile et pied de page : ancres absolues (nouvel onglet, sans JS)', () => {
  const Stub = defineComponent({ render: () => h('div') })
  let router: ReturnType<typeof createRouter>
  beforeAll(async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 200 })))
    router = createRouter({ history: createMemoryHistory(), routes: Object.values(ROUTE_PATHS).filter((p) => !p.includes(':')).map((path) => ({ path, component: Stub })) })
    await router.push('/aide')
    await router.isReady()
  }, 30_000)

  const hrefs = async (file: string, open = false) => {
    const { vHover } = await import('../src/directives/hover')
    const mod = await import(/* @vite-ignore */ file)
    const w = mount(mod.default, { global: { plugins: [router], directives: { hover: vHover } }, attachTo: document.body })
    await flushPromises()
    if (open) { await w.find('button[aria-controls="vb-mobile-menu"]').trigger('click'); await flushPromises() }
    const out = w.findAll('a').map((a) => ({ text: a.text().trim(), href: a.attributes('href') ?? '' }))
    w.unmount()
    return out
  }

  it('L72P-INV-04a — header desktop et menu mobile, depuis /aide : « Comment ça marche » → /#how, etc.', async () => {
    const liens = await hrefs('../src/components/AppHeader.vue', true)
    const nav = liens.filter((l) => ['Comment ça marche', "Cas d'usage", 'Tarifs', 'FAQ'].includes(l.text))
    expect(nav).toHaveLength(8) // 4 desktop + 4 menu mobile
    for (const l of nav) {
      expect(l.href, l.text).toMatch(/^\/(\?[^#]*)?#/)
      expect(checkPublicHref(l.href, current), l.text).toEqual({ status: 'ok' })
    }
    expect(nav.find((l) => l.text === 'Comment ça marche')?.href).toBe('/#how')
  }, 30_000)

  it('L72P-INV-04b — pied de page : toutes les destinations existent', async () => {
    const liens = await hrefs('../src/components/AppFooter.vue')
    expect(liens.length).toBeGreaterThanOrEqual(10)
    for (const l of liens) expect({ text: l.text, verdict: checkPublicHref(l.href, current) }).toEqual({ text: l.text, verdict: { status: 'ok' } })
    expect(liens.find((l) => l.text === 'Comment ça marche')?.href).toBe('/#how')
    expect(liens.find((l) => l.text === 'Tarifs')?.href).toBe('/#pricing')
    expect(liens.map((l) => l.text)).not.toContain('Pourquoi Verebona ?')
  }, 30_000)
})

describe('L72P-INV-05 — SEO : sitemap de production', () => {
  it('L72P-INV-05a — chaque URL du sitemap est une destination réelle (ni ancienne URL, ni page retirée, ni 404)', () => {
    const paths = [
      ...INDEXABLE_PATHS,
      ...helpSitemapPaths(loadHelpCorpus(root), 'production'),
      ...ressourcesSitemapPaths(loadRessourceCorpus(root)),
    ]
    expect(paths.length).toBeGreaterThan(2)
    const invalides = paths.map((p) => ({ p, v: checkPublicHref(p, current) })).filter((r) => r.v.status !== 'ok')
    expect(invalides).toEqual([])
  })
})

describe('L72P-INV-06 — contrôle d’après build', () => {
  it('L72P-INV-06a — build et build:preprod exécutent scripts/check-site-routes.mjs après le pré-rendu', () => {
    const { scripts } = JSON.parse(lire('package.json')) as { scripts: Record<string, string> }
    for (const name of ['build', 'build:preprod']) {
      expect(scripts[name]).toMatch(/node scripts\/prerender\.mjs && node scripts\/check-site-routes\.mjs/)
    }
  })
})
