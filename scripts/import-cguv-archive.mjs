/**
 * Reprise d'une version des CGUV publiée autrefois par l'APPLICATION
 * (contrat § 3.3) — octet pour octet, jamais régénérée.
 *
 *   node scripts/import-cguv-archive.mjs <fichier.html> --code 2026-07-30-v1 --sha256 <empreinte attendue>
 *        [--published-at 2026-07-30T00:00:00Z] [--title "…"]
 *
 * · <fichier.html> : l'original téléchargé depuis l'application
 *   (`https://<app>/api/legal/cgvu/versions/<code>/download`, ou la page
 *   `https://<app>/cguv/versions/<code>` enregistrée telle quelle — réponse
 *   `X-Legal-Source: archive-historique`).
 * · --sha256 : l'empreinte relevée dans l'application (BO › CGUV, colonne
 *   empreinte de la version). Le fichier est REFUSÉ si ses octets ne donnent
 *   pas exactement cette empreinte (rien n'est écrit).
 *
 * Effet : copie des octets dans `src/content/legal/cguv/versions/<code>.html`,
 * métadonnées `<code>.json` (origin « archive-application »,
 * requiresReacceptance false, publishedAt = date d'origine), empreinte figée
 * dans le verrou. Idempotent : relancer avec le même fichier ne change rien.
 * À commiter ensuite (les trois fichiers).
 */
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  CGUV_DEFAULT_TITLE, CGUV_LOCK_FILE, CGUV_LOCK_SCHEMA, CGUV_VERSIONS_DIR, frozenMeta, isCguvVersionCode, isIsoUtc, sha256Hex,
} from './lib/legal-core.mjs'
import { writeCguvLock } from './lib/legal-publish.mjs'

const root = process.env.LEGAL_ROOT ? path.resolve(process.env.LEGAL_ROOT) : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const fail = (msg) => { console.error(`[import-cguv-archive] REFUSÉ — ${msg}`); process.exit(1) }

const args = process.argv.slice(2)
const opt = (name) => {
  const i = args.indexOf(name)
  if (i === -1) return undefined
  const v = args[i + 1]
  args.splice(i, 2)
  return v
}
const code = opt('--code')
const expected = (opt('--sha256') ?? '').trim().toLowerCase()
const publishedAtArg = opt('--published-at')
const titleArg = opt('--title')
const file = args[0]

if (!file || !code || !expected) fail('usage : node scripts/import-cguv-archive.mjs <fichier.html> --code AAAA-MM-JJ-vN --sha256 <64 hex>')
if (!isCguvVersionCode(code)) fail(`code « ${code} » invalide (AAAA-MM-JJ-vN, date réelle)`)
if (!/^[0-9a-f]{64}$/.test(expected)) fail('--sha256 : 64 caractères hexadécimaux attendus')
if (!existsSync(file)) fail(`fichier introuvable : ${file}`)

const bytes = readFileSync(file)
const actual = sha256Hex(bytes)
if (actual !== expected) fail(`empreinte du fichier ${actual} ≠ empreinte attendue ${expected}. Ce n'est pas l'original figé : retélécharger le fichier depuis l'application, sans l'ouvrir ni l'enregistrer avec un éditeur.`)
if (!/^\s*<(!doctype html|html)/i.test(bytes.toString('utf8'))) console.warn('[import-cguv-archive] attention : le fichier ne commence pas par <!DOCTYPE html> (vérifier qu’il s’agit bien de la page d’archive)')

const htmlRel = `${CGUV_VERSIONS_DIR}/${code}.html`
const jsonRel = `${CGUV_VERSIONS_DIR}/${code}.json`
const htmlAbs = path.join(root, htmlRel)
const jsonAbs = path.join(root, jsonRel)

const lockAbs = path.join(root, CGUV_LOCK_FILE)
const lock = existsSync(lockAbs) ? JSON.parse(readFileSync(lockAbs, 'utf8')) : { schema: CGUV_LOCK_SCHEMA, versions: {} }
if (lock.versions[code] && lock.versions[code].sha256 !== actual) fail(`${code} est déjà publiée avec l'empreinte ${lock.versions[code].sha256} : une version publiée ne change jamais`)

if (existsSync(htmlAbs)) {
  const current = sha256Hex(readFileSync(htmlAbs))
  if (current !== actual) fail(`${htmlRel} existe déjà avec d'autres octets (${current})`)
}

const existing = existsSync(jsonAbs) ? JSON.parse(readFileSync(jsonAbs, 'utf8')) : null
if (existing && existing.origin !== 'archive-application') fail(`${code} est une version du site (origin « ${existing.origin} »), pas une archive de l'application`)
if (existing?.sha256 && existing.sha256 !== actual) fail(`${jsonRel} attend l'empreinte ${existing.sha256}`)

const publishedAt = publishedAtArg ?? existing?.publishedAt ?? `${code.slice(0, 10)}T00:00:00Z`
if (!isIsoUtc(publishedAt)) fail(`--published-at « ${publishedAt} » : date ISO 8601 UTC (…Z) attendue`)
if (lock.versions[code] && lock.versions[code].meta?.publishedAt !== publishedAt) fail(`${code} est déjà figée avec publishedAt ${lock.versions[code].meta?.publishedAt}`)

const meta = {
  code,
  origin: 'archive-application',
  title: titleArg ?? existing?.title ?? CGUV_DEFAULT_TITLE,
  publishedAt,
  effectiveAt: existing?.effectiveAt ?? publishedAt,
  // Contrat § 3.3 : une version reprise de l'application est non substantielle.
  requiresReacceptance: false,
  changeSummary: existing?.changeSummary ?? null,
  sha256: actual,
}

copyFileSync(file, htmlAbs)
if (sha256Hex(readFileSync(htmlAbs)) !== actual) fail('copie altérée (empreinte différente après écriture)')
writeFileSync(jsonAbs, JSON.stringify(meta, null, 2) + '\n')
lock.versions[code] = { sha256: actual, meta: frozenMeta(meta), figeeLe: lock.versions[code]?.figeeLe ?? new Date().toISOString() }
writeCguvLock(root, lock, CGUV_LOCK_FILE)

console.log(`[import-cguv-archive] ${code} importée octet pour octet (sha256 ${actual}).`)
console.log(`  À commiter : ${htmlRel}, ${jsonRel}, ${CGUV_LOCK_FILE}`)
console.log('  Au prochain déploiement, la version apparaît dans /legal/cguv/versions.json et dans l’historique.')
