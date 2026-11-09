// @vitest-environment node
/**
 * Chantier 105Q — audit Bing Webmaster Tools du 02/11/2026 (docs/seo/recette-bing-2026-11-02.md).
 *
 *   §2  13 <title> exacts, uniques, suffixe jamais doublé, longueur indicative ;
 *   §3  H1 : anciennes URL légales redirigées (104P), /contact « Contacter Verebona » ;
 *   §4  captures produit de l'accueil décrites (alt), décor en alt="" ;
 *   §5  seoTitle indépendant du H1 avec repli court ; IndexNow (production
 *       seulement, clé par variable d'environnement) ; HTML réellement servi
 *       par server.cjs (si un build est présent dans dist/) ; pas de 2FA promise.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { request } from 'node:http'
import { readHelpSources } from '../help.build'
import { loadCorpus } from '../src/help/corpus'
import { helpArticleHead, helpCategoryHead, helpHomeHead } from '../src/help/head'
import { loadRessourceCorpus } from '../ressources.build'
import { RESSOURCES_H1, ressourceArticleHead, ressourcesIndexHead } from '../src/ressources/head'
import { HOME_TITLE, ROUTE_DESCRIPTIONS, ROUTE_TITLES, DEFAULT_DESCRIPTION, headForRoute } from '../src/config/head.rules'
import { HELP_TITLE_SUFFIX, TITLE_LENGTH_HINT, effectiveSeoTitle, fallbackSeoTitle, hasDoubledSuffix } from '../src/config/seo-title.rules'
import { sitePages } from '../src/config/site-pages'
import { BING_TITLES, checkSeoHtml, startServer } from '../scripts/check-seo-html.mjs'
import { buildManifest } from '../scripts/indexnow-prepare.mjs'

const require = createRequire(import.meta.url)
const indexNow = require('../scripts/lib/indexnow.cjs')
const root = process.cwd()
const read = (p: string) => readFileSync(path.join(root, p), 'utf8')

const { files, categories } = readHelpSources(root)
const corpus = loadCorpus(files.map((f) => ({ ...f, updatedAt: null })), categories)
const bySlug = new Map(corpus.articles.map((a) => [a.slug, a]))
const ressources = loadRessourceCorpus(root)

/** H1 éditoriaux des 12 articles : inchangés par le chantier (seul le <title> change). */
const H1 = {
  'downgrade-impaye-duo': 'Que se passe-t-il lors d’un downgrade ou d’un impayé Duo ?',
  'interroger-verebona-donnees': 'Interroger Verebona sur ses biens, documents et échéances',
  'confiance-conflits-valeurs': 'Comprendre confiance, conflits et protection des valeurs',
  'classement-rattachement-document': 'Comprendre le classement et le rattachement d’un document',
  'ecriture-bloquee': 'Je ne peux plus ajouter ou modifier un bien ou un document',
  'assistant-aide-application': 'Comment Verebona répond aux questions sur l’application',
  'mois-offerts-parrainage': 'Comprendre l’application des mois offerts de parrainage',
  'recherche-donnees-vs-aide': 'Différencier recherche de données et recherche dans le Centre d’aide',
  'historique-dossiers-generes': 'Retrouver, télécharger, relancer ou supprimer un dossier généré',
  'quitter-retirer-duo': 'Retirer le second utilisateur ou quitter un espace partagé',
  'invitation-transmission-duo-probleme': 'Une invitation de transmission ou Duo ne fonctionne pas',
  'email-verification-non-recu': 'Je ne reçois pas l’e-mail de vérification ou de réinitialisation',
} as const

/** Tous les <title> de pages publiques connus sans build. */
function allTitles(): Array<{ path: string; title: string }> {
  const cat = new Map(corpus.categories.map((c) => [c.slug, c]))
  const out = [
    { path: '/', title: HOME_TITLE },
    { path: '/aide', title: helpHomeHead().title },
    { path: '/ressources', title: ressourcesIndexHead().title },
    ...Object.entries(ROUTE_TITLES).map(([k, t]) => ({ path: `route:${k}`, title: t })),
    ...corpus.categories.map((c) => ({ path: `/aide/theme/${c.slug}`, title: helpCategoryHead(c).title })),
    // Pages servies seulement : un article « blocked » n'a pas de page publique.
    // (AID-HELP-013 et AID-NOTIF-005, bloqués au lot 105P, partagent titre et H1 :
    // à départager avant toute republication — signalé au PO.)
    ...corpus.articles.filter((a) => a.status === 'published').map((a) => ({ path: a.canonical, title: helpArticleHead(a, cat.get(a.category)).title })),
    ...ressources.articles.filter((a) => a.status === 'published').map((a) => ({ path: a.path, title: ressourceArticleHead(a, undefined).title })),
  ]
  return out
}

describe('L105Q-01 — §2 : les 13 <title> de l’audit Bing', () => {
  it('corpus valide', () => {
    expect(corpus.issues.map((i) => `${i.articleId} ${i.field} ${i.message}`)).toEqual([])
    expect(ressources.articles.length).toBeGreaterThan(0) // loadRessourceCorpus lève au moindre défaut
  })

  it('titres exacts ; H1, slug et canonical inchangés', () => {
    expect(Object.keys(BING_TITLES)).toHaveLength(13)
    for (const [p, expected] of Object.entries(BING_TITLES)) {
      if (p === '/ressources') {
        expect(ressourcesIndexHead().title).toBe(expected)
        expect(ressourcesIndexHead().canonical).toBe('https://www.verebona.fr/ressources')
        expect(RESSOURCES_H1).toBe('Ressources')
        continue
      }
      const slug = p.slice('/aide/'.length)
      const a = bySlug.get(slug)
      expect(a, p).toBeDefined()
      expect(helpArticleHead(a!, undefined).title, p).toBe(expected)
      expect(a!.title, `${p} : H1 éditorial`).toBe(H1[slug as keyof typeof H1])
      expect(a!.canonical).toBe(p)
      expect(helpArticleHead(a!, undefined).canonical).toBe(`https://www.verebona.fr${p}`)
      // Le H1 reste le titre de l'article dans le JSON-LD (headline), pas le <title>.
      expect((helpArticleHead(a!, undefined).jsonLd as { headline: string }).headline).toBe(a!.title)
    }
  })

  it('longueur indicative : les 13 titres ≤ 65 caractères, jamais tronqués', () => {
    for (const t of Object.values(BING_TITLES)) {
      expect(t.length, t).toBeLessThanOrEqual(TITLE_LENGTH_HINT)
      expect(t).not.toMatch(/(…|\.\.\.)$/)
      expect(t).toMatch(/\| (Aide )?Verebona$/)
    }
  })

  it('unicité des <title> et suffixe jamais doublé, sur toutes les pages connues', () => {
    const titles = allTitles()
    const seen = new Map<string, string>()
    for (const { path: p, title } of titles) {
      expect(title.trim(), p).not.toBe('')
      expect(hasDoubledSuffix(title), `${p} : « ${title} »`).toBe(false)
      const other = seen.get(title)
      expect(other, `titre « ${title} » partagé par ${other} et ${p}`).toBeUndefined()
      seen.set(title, p)
    }
    // Information (pas un échec) : titres au-delà de la longueur indicative.
    const long = titles.filter((t) => t.title.length > 70)
    if (long.length) console.info(`[105Q] ${long.length} titre(s) > 70 caractères (indicatif, hors audit) : ${long.map((t) => t.path).join(', ')}`)
  })

  it('détection du suffixe doublé', () => {
    expect(hasDoubledSuffix('Découvrir Verebona | Aide Verebona')).toBe(false)
    expect(hasDoubledSuffix('Classer un document | Aide Verebona | Verebona')).toBe(true)
    expect(hasDoubledSuffix('Verebona | Contact | Verebona')).toBe(true)
  })

  // Lot 113-27 (Trello #728) : AID-SEARCH-003 et AID-AI-005 retouchés ensuite (offre Standard) — une
  // modification postérieure, datée et validée, reste conforme (updatedAt = validatedAt ≥ 2026-11-02).
  it('dates : les 12 articles retouchés portent updatedAt = validatedAt ≥ 2026-11-02 (EDITOR-02, D-O)', () => {
    for (const slug of Object.keys(H1)) {
      const raw = files.find((f) => f.path.endsWith(`/${bySlug.get(slug)!.id}.md`))!.raw
      const updated = /^updatedAt: (\d{4}-\d{2}-\d{2})$/m.exec(raw)?.[1]
      const validated = /^validatedAt: (\d{4}-\d{2}-\d{2})$/m.exec(raw)?.[1]
      expect(updated, slug).toBeDefined()
      expect(validated, slug).toBe(updated)
      expect(updated! >= '2026-11-02', slug).toBe(true)
      expect(bySlug.get(slug)!.status).toBe('published')
    }
  })
})

describe('L105Q-02 — §5 : seoTitle indépendant du H1, repli court', () => {
  it('repli : H1 + suffixe de rubrique, « | Verebona » si trop long, jamais tronqué ni doublé', () => {
    expect(fallbackSeoTitle('Ajouter un document', HELP_TITLE_SUFFIX)).toBe('Ajouter un document | Aide Verebona')
    const long = 'Différencier recherche de données et recherche dans le Centre d’aide'
    expect(fallbackSeoTitle(long, HELP_TITLE_SUFFIX)).toBe(`${long} | Verebona`)
    expect(fallbackSeoTitle('Contact | Verebona', HELP_TITLE_SUFFIX)).toBe('Contact | Verebona')
    expect(effectiveSeoTitle('  ', 'Titre', HELP_TITLE_SUFFIX)).toBe('Titre | Aide Verebona')
    expect(effectiveSeoTitle('Propre | Aide Verebona', 'Titre', HELP_TITLE_SUFFIX)).toBe('Propre | Aide Verebona')
  })

  it('aide : un article sans seoTitle reçoit le repli (plus d’échec de build)', () => {
    const f = files.find((x) => x.path.endsWith('/AID-DOC-005.md'))!
    const variant = { ...f, raw: f.raw.replace(/^seoTitle: .*\n/m, '') }
    const r = loadCorpus([variant, ...files.filter((x) => x !== f)].map((x) => ({ ...x, updatedAt: null })), categories)
    expect(r.issues.filter((i) => i.field === 'seoTitle')).toEqual([])
    const a = r.articles.find((x) => x.id === 'AID-DOC-005')!
    expect(a.seoTitle).toBe(`${a.title} | Verebona`) // H1 long : suffixe court
  })

  it('Ressources : seoTitle facultatif, repli « H1 | Verebona »', () => {
    const src = read('src/ressources/corpus.ts')
    expect(src).toMatch(/effectiveSeoTitle\(str\('seoTitle'\), str\('h1'\) \?\? '', SITE_TITLE_SUFFIX\)/)
    for (const a of ressources.articles) expect(a.seoTitle.endsWith(' | Verebona'), a.id).toBe(true)
  })
})

describe('L105Q-03 — §3 : H1 des 4 URL', () => {
  it('/contact : H1 « Contacter Verebona », page pré-rendue, canonique, description propre', () => {
    expect(read('src/views/ContactView.vue')).toMatch(/<h1 class="vb-page-hero__title">Contacter Verebona<\/h1>/)
    const [contact] = sitePages()
    expect(contact).toMatchObject({ path: '/contact', file: '.pages/contact.html' })
    expect(contact.head).toMatchObject({ title: ROUTE_TITLES.contact, canonical: 'https://www.verebona.fr/contact', noindex: false })
    expect(headForRoute('contact', 'full').description).toBe(ROUTE_DESCRIPTIONS.contact)
    expect(ROUTE_DESCRIPTIONS.contact).not.toBe(DEFAULT_DESCRIPTION)
  })

  it('/cgu, /confidentialite, /mentions-legales : 301 (104P) vers /legal/…, aucun H1 forcé sur l’ancienne URL', () => {
    const legacy = read('src/config/legacy-routes.rules.ts')
    expect(legacy).toMatch(/'\/cgu': '\/legal\/cguv'/)
    expect(legacy).toMatch(/'\/confidentialite': '\/legal\/confidentialite'/)
    expect(legacy).toMatch(/'\/mentions-legales': '\/legal\/mentions-legales'/)
  })
})

describe('L105Q-04 — §4 et §5 : images de l’accueil, promesses produit', () => {
  it('aucune balise <img> sans attribut alt dans les composants', () => {
    const walk = (d: string, out: string[] = []): string[] => {
      for (const n of readdirSync(path.join(root, d))) {
        const rel = `${d}/${n}`
        if (statSync(path.join(root, rel)).isDirectory()) walk(rel, out)
        else if (rel.endsWith('.vue')) out.push(rel)
      }
      return out
    }
    for (const f of walk('src')) {
      for (const tag of read(f).match(/<img\b[^>]*>/g) ?? []) expect(tag, f).toMatch(/\s:?alt=/)
    }
  })

  it('aucune double authentification promise sur le site (pas de 2FA en V1)', () => {
    const sources = ['src/sections/TrustSection.vue', 'src/sections/FaqSection.vue', 'src/views/HomeView.vue', 'src/composables/useLanding.ts']
    for (const f of sources) expect(read(f).replace(/<!--[\s\S]*?-->/g, ''), f).not.toMatch(/\b2FA\b|deux facteurs|double authentification/i)
  })

  it('pas d’analytics ni de pixel ajouté', () => {
    expect(read('index.html')).not.toMatch(/gtag|googletagmanager|clarity\.ms|bat\.bing\.com|plausible|matomo/i)
  })
})

describe('L105Q-05 — IndexNow (fonctions pures)', () => {
  const PROD = { environment: 'production', indexable: true }
  it('actif en production indexable avec une clé valide seulement', () => {
    expect(indexNow.indexNowStatus({ INDEXNOW_KEY: 'abcdef12-3456' }, PROD).enabled).toBe(true)
    expect(indexNow.indexNowStatus({ INDEXNOW_KEY: 'abcdef12-3456' }, { environment: 'preprod', indexable: false }).enabled).toBe(false)
    expect(indexNow.indexNowStatus({}, PROD).enabled).toBe(false)
    expect(indexNow.indexNowStatus({ INDEXNOW_KEY: 'court' }, PROD).enabled).toBe(false)
    expect(indexNow.indexNowStatus({ INDEXNOW_KEY: 'abcdef12-3456', INDEXNOW_ENABLED: 'false' }, PROD).enabled).toBe(false)
    expect(indexNow.indexNowStatus({ INDEXNOW_KEY: 'abcdef12-3456' }, null).enabled).toBe(false)
  })

  it('aucune clé dans le dépôt', () => {
    expect(read('server.cjs')).toMatch(/process\.env/)
    expect(existsSync(path.join(root, 'public')) && readdirSync(path.join(root, 'public')).filter((n) => /^[A-Za-z0-9-]{8,128}\.txt$/.test(n))).toEqual([])
  })

  it('empreinte : ignore les noms hachés et les identifiants techniques, suit le contenu', () => {
    const page = (js: string, id: string, h1: string) =>
      `<html><head><title>T</title><script src="/assets/index-${js}.js"></script></head><body><div id="app"><h1>${h1}</h1><input id="ha-search-${id}"><a href="/aide">x</a></div></body></html>`
    expect(indexNow.pageFingerprint(page('AAA', 'x1', 'Titre'))).toBe(indexNow.pageFingerprint(page('BBB', 'y2', 'Titre')))
    expect(indexNow.pageFingerprint(page('AAA', 'x1', 'Titre'))).not.toBe(indexNow.pageFingerprint(page('AAA', 'x1', 'Autre')))
  })

  it('URL changées : ajout, modification, retrait ; tout au premier envoi', () => {
    const prev = { pages: { a: '1', b: '2', c: '3' } }
    const next = { pages: { a: '1', b: '9', d: '4' } }
    expect(indexNow.changedUrls(prev, next)).toEqual(['b', 'c', 'd'])
    expect(indexNow.changedUrls(null, next)).toEqual(['a', 'b', 'd'])
  })

  it('envoi : succès 202, reprise sur 500, arrêt sur 403, erreurs journalisées', async () => {
    const logs: string[] = []
    const log = { log: (m: string) => logs.push(m), error: (m: string) => logs.push(`ERR ${m}`) }
    const calls: Array<{ body: string }> = []
    const seq = [500, 202]
    const fetchImpl = async (_: string, init: { body: string }) => { calls.push(init); return { status: seq.shift() ?? 202 } }
    const r = await indexNow.submitIndexNow({ host: 'www.verebona.fr', key: 'abcdef12-3456', urls: ['https://www.verebona.fr/aide'], fetchImpl, log, retryDelaysMs: [0] })
    expect(r).toMatchObject({ sent: 1, failed: 0 })
    expect(calls).toHaveLength(2)
    expect(JSON.parse(calls[0].body)).toEqual({
      host: 'www.verebona.fr', key: 'abcdef12-3456', keyLocation: 'https://www.verebona.fr/abcdef12-3456.txt', urlList: ['https://www.verebona.fr/aide'],
    })
    const denied = await indexNow.submitIndexNow({ host: 'h', key: 'abcdef12-3456', urls: ['u'], fetchImpl: async () => ({ status: 403 }), log, retryDelaysMs: [0] })
    expect(denied).toMatchObject({ sent: 0, failed: 1 })
    expect(logs.some((l) => l.startsWith('ERR') && l.includes('403') && l.includes('définitif'))).toBe(true)
    const offline = await indexNow.submitIndexNow({ host: 'h', key: 'abcdef12-3456', urls: ['u'], fetchImpl: async () => { throw new Error('ECONNRESET') }, log, attempts: 2, retryDelaysMs: [0] })
    expect(offline.failed).toBe(1)
    expect(logs.filter((l) => l.includes('ECONNRESET'))).toHaveLength(2)
  })
})

interface Res { status: number; headers: Record<string, string | string[] | undefined>; body: string }
const get = (port: number, p: string): Promise<Res> => new Promise((resolve, reject) => {
  const req = request({ host: '127.0.0.1', port, path: p }, (res) => {
    const c: Buffer[] = []
    res.on('data', (d) => c.push(d))
    res.on('end', () => resolve({ status: res.statusCode!, headers: res.headers, body: Buffer.concat(c).toString('utf8') }))
  })
  req.on('error', reject)
  req.end()
})

describe('L105Q-06 — server.cjs démarré : /contact pré-rendu, clé IndexNow', () => {
  const KEY = 'verebona-test-0123456789'
  const dirs: string[] = []
  function site(environment: 'production' | 'preprod') {
    const dir = mkdtempSync(path.join(tmpdir(), 'verebona-l105q-'))
    dirs.push(dir)
    copyFileSync(path.join(root, 'server.cjs'), path.join(dir, 'server.cjs'))
    mkdirSync(path.join(dir, 'scripts/lib'), { recursive: true })
    copyFileSync(path.join(root, 'scripts/lib/indexnow.cjs'), path.join(dir, 'scripts/lib/indexnow.cjs'))
    const dist = path.join(dir, 'dist')
    mkdirSync(path.join(dist, '.pages'), { recursive: true })
    writeFileSync(path.join(dist, 'index.html'), '<html>ACCUEIL</html>')
    writeFileSync(path.join(dist, 'spa.html'), '<html>SPA</html>')
    writeFileSync(path.join(dist, '.pages/contact.html'), '<html><h1>Contacter Verebona</h1></html>')
    writeFileSync(path.join(dist, '.site-env.json'), JSON.stringify({ environment, indexable: environment === 'production', defaultMode: 'prelaunch', siteOrigin: 'https://www.verebona.fr' }))
    writeFileSync(path.join(dist, '.site-routes.json'), JSON.stringify({ staticRoutes: ['/', '/contact', '/aide'], legacyRedirects: {}, retired: [] }))
    writeFileSync(path.join(dist, 'indexnow-manifest.json'), JSON.stringify({ schema: 'verebona-indexnow-v1', pages: { 'https://www.verebona.fr/': 'aa', 'https://www.verebona.fr/aide': 'bb' } }))
    writeFileSync(path.join(dist, '.indexnow-pending.json'), JSON.stringify({ urls: ['https://www.verebona.fr/aide'] }))
    return dir
  }
  afterAll(() => dirs.forEach((d) => rmSync(d, { recursive: true, force: true })))

  it('production avec clé : clé servie, manifeste marqué tant que non notifié, /contact pré-rendu', async () => {
    const s = await startServer(site('production'), { INDEXNOW_KEY: KEY, INDEXNOW_DELAY_SECONDS: '3600' })
    try {
      const key = await get(s.port, `/${KEY}.txt`)
      expect(key.status).toBe(200)
      expect(key.body).toBe(KEY)
      expect(String(key.headers['content-type'])).toMatch(/^text\/plain/)
      const m = JSON.parse((await get(s.port, '/indexnow-manifest.json')).body)
      expect(m.pages).toEqual({ 'https://www.verebona.fr/': 'aa', 'https://www.verebona.fr/aide': 'non-notifie' })
      const contact = await get(s.port, '/contact')
      expect(contact.status).toBe(200)
      expect(contact.body).toContain('<h1>Contacter Verebona</h1>')
      expect((await get(s.port, '/.pages/contact.html')).status).toBe(404)
      expect((await get(s.port, '/aide-x')).status).toBe(404)
      expect(s.logs()).toMatch(/\[indexnow\] actif, 1 URL à notifier/)
    } finally { await s.stop() }
  })

  it('préproduction : jamais de clé ni de notification, même avec la variable', async () => {
    const s = await startServer(site('preprod'), { INDEXNOW_KEY: KEY, INDEXNOW_DELAY_SECONDS: '0' })
    try {
      expect((await get(s.port, `/${KEY}.txt`)).status).toBe(404)
      expect(s.logs()).toMatch(/\[indexnow\] inactif \(environnement autre que la production indexable\)/)
      expect(s.logs()).not.toMatch(/notifiée/)
    } finally { await s.stop() }
  })
})

/**
 * HTML RÉELLEMENT SERVI par server.cjs sur le dernier build (`dist/`) : la
 * même vérification que l'étape `check-seo-html` du build. Ignoré sans build.
 */
const built = existsSync(path.join(root, 'dist/.site-env.json')) && existsSync(path.join(root, 'dist/spa.html'))
describe.skipIf(!built)('L105Q-07 — HTML servi par le dernier build (dist/)', () => {
  let result: Awaited<ReturnType<typeof checkSeoHtml>>
  beforeAll(async () => { result = await checkSeoHtml(root) }, 60000)

  it('aucun défaut SEO (200, title, description, H1, canonical, robots, sitemap)', () => {
    expect(result.errors).toEqual([])
  })

  it('les 13 titres et /contact dans le HTML servi', () => {
    for (const [p, t] of Object.entries(BING_TITLES)) expect(result.pages.find((x) => x.path === p)?.title, p).toBe(t)
    expect(result.pages.find((x) => x.path === '/contact')?.h1).toEqual(['Contacter Verebona'])
  })

  it('production : le manifeste IndexNow couvre exactement le sitemap', () => {
    if (!result.prod) return
    const { manifest, missing } = buildManifest(path.join(root, 'dist'), 'https://www.verebona.fr')
    expect(missing).toEqual([])
    expect(Object.keys(manifest.pages).length).toBe(result.pages.filter((p) => p.inSitemap).length)
  })
})
