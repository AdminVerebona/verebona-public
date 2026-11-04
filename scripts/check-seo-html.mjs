/**
 * Contrôle SEO du HTML SERVI — chantier 105Q (audit Bing du 02/11/2026).
 *
 * Démarre `server.cjs` sur `dist/` (port libre, sans CANONICAL_HOST ni
 * authentification) et vérifie ce qu'un robot reçoit réellement, sans
 * exécuter de JavaScript :
 *   · chaque page publique : 200, un seul <title> non vide, meta description,
 *     UN H1, canonical absolue sur www.verebona.fr égale à l'URL, pas de
 *     noindex involontaire (production) ; titres uniques, marque jamais doublée ;
 *   · les 13 <title> de l'audit Bing, exacts ;
 *   · anciennes adresses légales : 301 vers une page /legal/… qui a son H1 ;
 *   · /contact : H1 « Contacter Verebona » ;
 *   · accueil : chaque <img> porte un attribut alt ; captures produit décrites ;
 *     JSON-LD Organization + WebSite (production) ;
 *   · robots.txt et sitemap : en production, le sitemap ne liste que des pages
 *     servies en 200, canoniques, indexables (aucune redirection, 404,
 *     préproduction, page privée) ; hors production, ni sitemap ni index.
 *
 *   node scripts/check-seo-html.mjs           (après un build ; code 1 si défaut)
 *   node scripts/check-seo-html.mjs --json    (relevé complet, pour la recette)
 */
import { spawn } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { request } from 'node:http'
import { createServer } from 'node:net'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

export const SITE = 'https://www.verebona.fr'

/** Audit Bing §2 : titres exacts attendus (libellés validés). */
export const BING_TITLES = {
  '/aide/downgrade-impaye-duo': 'Premium Duo : impayé ou changement d’offre | Aide Verebona',
  '/aide/interroger-verebona-donnees': 'Interroger ses biens et documents | Aide Verebona',
  '/aide/confiance-conflits-valeurs': 'IA : confiance et conflits de données | Aide Verebona',
  '/aide/classement-rattachement-document': 'Classer et rattacher un document | Aide Verebona',
  '/aide/ecriture-bloquee': 'Ajout ou modification bloqués | Aide Verebona',
  '/aide/assistant-aide-application': 'Assistant : questions sur l’application | Aide Verebona',
  '/aide/mois-offerts-parrainage': 'Mois offerts : échéances et parrainage | Aide Verebona',
  '/aide/recherche-donnees-vs-aide': 'Recherche : données ou Centre d’aide ? | Verebona',
  '/aide/historique-dossiers-generes': 'Dossiers générés : historique et actions | Aide Verebona',
  '/aide/quitter-retirer-duo': 'Quitter le Duo ou retirer un membre | Aide Verebona',
  '/aide/invitation-transmission-duo-probleme': 'Invitation Duo ou transmission invalide | Aide Verebona',
  '/aide/email-verification-non-recu': 'E-mail de vérification non reçu | Aide Verebona',
  '/ressources': 'Guides : factures, garanties et échéances | Verebona',
}

/** Audit Bing §3 : anciennes adresses (301, chantier 104P) et page canonique. */
export const LEGACY_LEGAL = {
  '/cgu': '/legal/cguv',
  '/cguv': '/legal/cguv',
  '/cgvu': '/legal/cguv',
  '/confidentialite': '/legal/confidentialite',
  '/mentions-legales': '/legal/mentions-legales',
}

const decode = (s) => s
  .replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
const text = (html) => decode(html.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim()

/** Relevé SEO d'un document HTML. */
export function inspectHtml(html) {
  const titles = [...html.matchAll(/<title>([\s\S]*?)<\/title>/g)].map((m) => decode(m[1]).trim())
  const desc = /<meta\s+name="description"\s+content="([^"]*)"/.exec(html)
  const canon = [...html.matchAll(/<link rel="canonical" href="([^"]*)"/g)].map((m) => decode(m[1]))
  const robots = /<meta name="robots" content="([^"]*)"/.exec(html)
  const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => text(m[1]))
  const imgs = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => {
    const tag = m[0]
    const alt = /\salt="([^"]*)"/.exec(tag)
    return { src: (/\ssrc="([^"]*)"/.exec(tag) || [])[1] || '', alt: alt ? decode(alt[1]) : null }
  })
  const jsonLd = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1])
  return {
    title: titles[0] ?? null, titleCount: titles.length,
    description: desc ? decode(desc[1]) : null,
    canonical: canon[0] ?? null, canonicalCount: canon.length,
    robots: robots ? robots[1] : null,
    h1: h1s, imgs, jsonLd,
  }
}

function freePort() {
  return new Promise((resolve, reject) => {
    const srv = createServer()
    srv.listen(0, '127.0.0.1', () => { const { port } = srv.address(); srv.close(() => resolve(port)) })
    srv.on('error', reject)
  })
}

function get(port, p) {
  return new Promise((resolve, reject) => {
    const req = request({ host: '127.0.0.1', port, path: encodeURI(p), method: 'GET' }, (res) => {
      const chunks = []
      res.on('data', (c) => chunks.push(c))
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks).toString('utf8') }))
    })
    req.on('error', reject)
    req.end()
  })
}

/** Démarre server.cjs sur `root/dist` ; renvoie { port, stop }. */
export async function startServer(root, extraEnv = {}) {
  const port = await freePort()
  // NODE_PATH : dépendances du dépôt, pour un server.cjs copié ailleurs (tests).
  const repoModules = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'node_modules')
  const env = { ...process.env, PORT: String(port), NODE_PATH: repoModules, BASIC_AUTH_ENABLED: 'false', CANONICAL_HOST: '', INDEXNOW_KEY: '', CONTAINER: '', ...extraEnv }
  const child = spawn(process.execPath, [path.join(root, 'server.cjs')], { cwd: root, env, stdio: ['ignore', 'pipe', 'pipe'] })
  let out = ''
  child.stdout.on('data', (d) => { out += d })
  child.stderr.on('data', (d) => { out += d })
  const deadline = Date.now() + 15000
  while (!out.includes('Listening on port')) {
    if (child.exitCode !== null) throw new Error(`server.cjs arrêté : ${out}`)
    if (Date.now() > deadline) { child.kill(); throw new Error(`server.cjs ne démarre pas : ${out}`) }
    await new Promise((r) => setTimeout(r, 50))
  }
  return { port, logs: () => out, stop: () => new Promise((r) => { child.once('exit', r); child.kill() }) }
}

/** Chemins des pages publiques à contrôler, d'après le sitemap (production) ou `dist/`. */
function publicPaths(dist, sitemapXml) {
  if (sitemapXml) {
    return [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => decode(m[1]).slice(SITE.length) || '/')
  }
  const out = ['/', '/aide', '/ressources']
  const walk = (dir, prefix) => {
    if (!existsSync(dir)) return
    for (const n of readdirSync(dir, { withFileTypes: true })) {
      if (n.isDirectory() && !n.name.startsWith('.')) walk(path.join(dir, n.name), `${prefix}/${n.name}`)
      else if (n.name.endsWith('.html') && n.name !== 'index.html') out.push(`${prefix}/${n.name.slice(0, -5)}`)
    }
  }
  walk(path.join(dist, 'aide'), '/aide')
  walk(path.join(dist, 'ressources'), '/ressources')
  for (const k of ['mentions-legales', 'cguv', 'confidentialite', 'sous-traitants', 'parrainage']) out.push(`/legal/${k}`)
  return out
}

export async function checkSeoHtml(root) {
  const dist = path.join(root, 'dist')
  const siteEnv = JSON.parse(readFileSync(path.join(dist, '.site-env.json'), 'utf8'))
  const prod = siteEnv.environment === 'production' && siteEnv.indexable === true
  const errors = []
  const fail = (m) => errors.push(m)
  const warnings = []
  const pages = []
  const server = await startServer(root)
  try {
    // robots.txt et sitemap.
    const robots = await get(server.port, '/robots.txt')
    const sitemap = await get(server.port, '/sitemap.xml')
    if (robots.status !== 200) fail(`/robots.txt : HTTP ${robots.status}`)
    if (prod) {
      if (!/^User-agent: \*\nAllow: \/\n/.test(robots.body) || !robots.body.includes(`Sitemap: ${SITE}/sitemap.xml`)) fail('/robots.txt : production attendue (Allow + Sitemap)')
      if (sitemap.status !== 200 || !String(sitemap.headers['content-type']).startsWith('application/xml')) fail(`/sitemap.xml : HTTP ${sitemap.status} ${sitemap.headers['content-type']}`)
    } else {
      if (!robots.body.includes('Disallow: /')) fail('/robots.txt : « Disallow: / » attendu hors production')
      if (sitemap.status !== 404) fail(`/sitemap.xml : 404 attendu hors production (reçu ${sitemap.status})`)
    }
    const locs = prod ? [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => decode(m[1])) : []
    for (const loc of locs) {
      if (!loc.startsWith(`${SITE}/`)) fail(`sitemap : URL hors du domaine canonique ${loc}`)
      if (/preprod|localhost|\/inscription|\/api\/|\/legal\/cguv\/versions|\?|#/.test(loc)) fail(`sitemap : URL non publique ou technique ${loc}`)
    }
    if (new Set(locs).size !== locs.length) fail('sitemap : URL en double')

    const paths = [...new Set([...publicPaths(dist, prod ? sitemap.body : null), '/contact', ...Object.keys(BING_TITLES)])]
    const inSitemap = new Set(locs)
    for (const p of paths) {
      const r = await get(server.port, p)
      const info = { path: p, status: r.status, xRobots: r.headers['x-robots-tag'] ?? null, inSitemap: inSitemap.has(`${SITE}${p === '/' ? '/' : p}`), ...inspectHtml(r.body) }
      pages.push(info)
      const where = `${p} :`
      if (r.status !== 200) { fail(`${where} HTTP ${r.status}`); continue }
      if (info.titleCount !== 1 || !info.title) fail(`${where} ${info.titleCount} <title>`)
      if (!info.description) fail(`${where} meta description absente`)
      if (info.h1.length !== 1 || !info.h1[0]) fail(`${where} ${info.h1.length} H1 (un seul attendu, non vide)`)
      const expected = `${SITE}${p}`
      if (info.canonicalCount !== 1 || info.canonical !== expected) fail(`${where} canonical ${info.canonical} (attendu ${expected})`)
      // Suffixe doublé (« … | Verebona | Verebona », « Verebona | … | Aide Verebona ») ;
      // même règle que src/config/seo-title.rules.ts (hasDoubledSuffix).
      if (info.title && info.title.split('|').map((x) => x.trim()).filter((x) => /^(?:Aide |Centre d[’']aide )?Verebona$/.test(x)).length > 1) fail(`${where} suffixe de marque doublé dans le titre « ${info.title} »`)
      const noindex = /noindex/i.test(`${info.robots ?? ''} ${info.xRobots ?? ''}`)
      if (prod && noindex) fail(`${where} noindex en production`)
      if (!prod && !noindex) fail(`${where} indexable hors production`)
    }
    // Unicité : bloquante en production. En préproduction (tout `noindex`), les
    // articles « blocked » sont publiés pour relecture : un doublon y est
    // signalé (à départager avant republication) sans bloquer le build.
    const titles = new Map()
    for (const pg of pages) {
      if (!pg.title || pg.status !== 200) continue
      const msg = `titre en double « ${pg.title} » : ${titles.get(pg.title)} et ${pg.path}`
      if (titles.has(pg.title)) (prod ? fail(msg) : warnings.push(msg))
      else titles.set(pg.title, pg.path)
    }
    for (const [p, t] of Object.entries(BING_TITLES)) {
      const pg = pages.find((x) => x.path === p)
      if (pg && pg.title !== t) fail(`${p} : titre « ${pg.title} » (attendu « ${t} »)`)
    }

    // §3 : anciennes adresses légales et /contact.
    for (const [from, to] of Object.entries(LEGACY_LEGAL)) {
      const r = await get(server.port, from)
      if (r.status !== 301 || r.headers.location !== to) fail(`${from} : ${r.status} → ${r.headers.location} (301 → ${to} attendu)`)
      const target = pages.find((x) => x.path === to)
      if (!target || target.h1.length !== 1) fail(`${to} : H1 unique attendu sur la page canonique`)
    }
    const contact = pages.find((x) => x.path === '/contact')
    if (!contact || contact.h1[0] !== 'Contacter Verebona') fail(`/contact : H1 « ${contact && contact.h1[0]} » (attendu « Contacter Verebona »)`)
    const notFound = await get(server.port, '/page-qui-n-existe-pas')
    if (notFound.status !== 404) fail(`/page-qui-n-existe-pas : HTTP ${notFound.status} (404 attendu)`)

    // §4 : images de l'accueil.
    const home = pages.find((x) => x.path === '/')
    if (home) {
      for (const img of home.imgs) if (img.alt === null) fail(`/ : <img src="${img.src}"> sans attribut alt`)
      for (const img of home.imgs.filter((i) => /\/assets\/app-(desktop|mobile)-/.test(i.src))) {
        if (!img.alt) fail(`/ : capture produit ${img.src} sans alternative textuelle`)
      }
      if (prod) {
        const ld = home.jsonLd.join('\n')
        if (!ld.includes('"Organization"') || !ld.includes('"WebSite"')) fail('/ : JSON-LD Organization + WebSite absent')
        if (/"(offers|aggregateRating|price)"/.test(ld)) fail('/ : JSON-LD avec prix ou note')
      }
    }
  } finally {
    await server.stop()
  }
  return { environment: siteEnv.environment, prod, errors, warnings, pages }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
  const r = await checkSeoHtml(root)
  if (process.argv.includes('--json')) console.log(JSON.stringify(r, null, 2))
  for (const w of r.warnings) console.warn(`[check-seo-html] attention (${r.environment}) : ${w}`)
  if (r.errors.length) {
    console.error(`[check-seo-html] ${r.errors.length} défaut(s) (${r.environment}) :\n${r.errors.map((e) => `  · ${e}`).join('\n')}`)
    process.exit(1)
  }
  console.log(`[check-seo-html] ${r.environment} · ${r.pages.length} pages servies contrôlées · ${r.warnings.length ? `${r.warnings.length} doublon(s) de titre signalé(s) (préproduction)` : 'titres uniques'} · 13 titres de l'audit Bing · H1 · canonical · robots${r.prod ? ' · sitemap' : ''}`)
}
