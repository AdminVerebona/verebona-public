/**
 * IndexNow, étape de build (chantier 105Q) — exécuté dans `npm run build` après
 * `check-seo-html` (un build en échec plus loin n'est de toute façon pas déployé).
 *
 * PRODUCTION SEULEMENT (`dist/.site-env.json` : production + indexable). En
 * préproduction ou en local : aucun fichier écrit, code 0.
 *
 *   1. Empreinte de chaque URL du sitemap (pages publiques canoniques
 *      indexables) → `dist/indexnow-manifest.json` (public : il sera relu au
 *      déploiement suivant).
 *   2. Manifeste du site EN LIGNE (`https://www.verebona.fr/indexnow-manifest.json`,
 *      encore servi par la version précédente pendant le build) : différence →
 *      `dist/.indexnow-pending.json` (dotfile, non servi), lu par `server.cjs`
 *      qui notifie IndexNow après le démarrage.
 *
 * Ne fait JAMAIS échouer le build : une erreur est journalisée et la
 * notification est simplement sautée.
 *
 *   node scripts/indexnow-prepare.mjs            (après un build)
 *   INDEXNOW_PREVIOUS_MANIFEST=<url|fichier|none> pour tester ; « none » = tout notifier.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const require = createRequire(import.meta.url)
const { changedUrls, pageFingerprint, sitemapUrls } = require('./lib/indexnow.cjs')

export const MANIFEST_FILE = 'indexnow-manifest.json'
export const PENDING_FILE = '.indexnow-pending.json'

/** Fichier pré-rendu servi pour une URL publique du sitemap, ou null. */
export function fileForUrl(dist, url, origin) {
  if (!url.startsWith(`${origin}/`)) return null
  const p = url.slice(origin.length)
  if (p === '/') return path.join(dist, 'index.html')
  if (p === '/aide') return path.join(dist, 'aide', 'index.html')
  if (p === '/ressources') return path.join(dist, 'ressources', 'index.html')
  const legal = /^\/legal\/([a-z-]+)$/.exec(p)
  if (legal) return path.join(dist, 'legal', '.pages', `${legal[1]}.html`)
  if (/^\/(aide|ressources)\/[a-z0-9/-]+$/.test(p)) return path.join(dist, `${p.slice(1)}.html`)
  return path.join(dist, '.pages', `${p.slice(1)}.html`)
}

export function buildManifest(dist, origin) {
  const xml = readFileSync(path.join(dist, 'sitemap.xml'), 'utf8')
  const pages = {}
  const missing = []
  for (const url of sitemapUrls(xml)) {
    const file = fileForUrl(dist, url, origin)
    if (!file || !existsSync(file)) { missing.push(url); continue }
    pages[url] = pageFingerprint(readFileSync(file, 'utf8'))
  }
  return { manifest: { schema: 'verebona-indexnow-v1', origin, pages }, missing }
}

async function loadPrevious(source, origin) {
  if (source === 'none') return { prev: null, note: 'état précédent ignoré (INDEXNOW_PREVIOUS_MANIFEST=none)' }
  const where = source || `${origin}/${MANIFEST_FILE}`
  if (!/^https?:\/\//.test(where)) return { prev: JSON.parse(readFileSync(where, 'utf8')), note: `état précédent : ${where}` }
  const res = await fetch(where, { signal: AbortSignal.timeout(10000), headers: { Accept: 'application/json' } })
  if (res.status === 404) return { prev: null, note: `aucun manifeste en ligne (${where} : 404) — premier déploiement : toutes les URL` }
  if (!res.ok) throw new Error(`${where} : HTTP ${res.status}`)
  const prev = await res.json()
  if (!prev || prev.schema !== 'verebona-indexnow-v1') throw new Error(`${where} : manifeste illisible`)
  return { prev, note: `état précédent : ${where}` }
}

export async function prepare(root, env = process.env, log = console) {
  const dist = path.join(root, 'dist')
  let siteEnv = null
  try { siteEnv = JSON.parse(readFileSync(path.join(dist, '.site-env.json'), 'utf8')) } catch { /* absent */ }
  if (!siteEnv || siteEnv.environment !== 'production' || siteEnv.indexable !== true) {
    log.log(`[indexnow-prepare] ${siteEnv ? siteEnv.environment : 'environnement inconnu'} : rien à préparer (production seulement)`)
    return { status: 'skipped' }
  }
  const origin = siteEnv.siteOrigin || 'https://www.verebona.fr'
  const { manifest, missing } = buildManifest(dist, origin)
  if (missing.length) log.warn(`[indexnow-prepare] ${missing.length} URL du sitemap sans page pré-rendue (ignorées) : ${missing.slice(0, 5).join(' ')}`)
  writeFileSync(path.join(dist, MANIFEST_FILE), JSON.stringify(manifest, null, 2) + '\n')
  let urls = []
  let note
  try {
    const { prev, note: n } = await loadPrevious(env.INDEXNOW_PREVIOUS_MANIFEST, origin)
    urls = changedUrls(prev, manifest)
    note = n
  } catch (e) {
    note = `état précédent illisible (${e.message}) : aucune notification préparée`
    log.warn(`[indexnow-prepare] ${note}`)
  }
  writeFileSync(path.join(dist, PENDING_FILE), JSON.stringify({ urls, note }, null, 2) + '\n')
  log.log(`[indexnow-prepare] ${Object.keys(manifest.pages).length} URL suivies · ${urls.length} à notifier au démarrage · ${note}`)
  return { status: 'ok', urls, note }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
  prepare(root).catch((e) => console.warn(`[indexnow-prepare] ignoré : ${e.message}`))
}
