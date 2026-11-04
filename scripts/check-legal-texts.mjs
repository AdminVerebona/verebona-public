/**
 * Contrôle BLOQUANT de la rubrique « Légal » — chantier 104P (P0-A / P0-B).
 *
 * Dernier maillon de `npm run build` et `npm run build:preprod` (donc sur
 * l'hébergeur). Échoue tant que :
 *   · un texte juridique porte encore le marqueur <!-- TEXTE-JURIDIQUE-A-FOURNIR -->
 *     (Mentions légales, CGUV, Confidentialité, Sous-traitants, Parrainage) ;
 *   · une décision du PO manque pour une version des CGUV (dates,
 *     requiresReacceptance), ou une version prête n'a pas été figée ;
 *   · le manifeste servi est absent ou non conforme au contrat, ou un texte
 *     figé servi ne donne pas l'empreinte annoncée ;
 *   · le contenu servi contient un terme interdit (CGSU, CGVU, « Standard
 *     gratuite », « Pro », « Contact DPO », « 2025 »…) — règles adaptables
 *     dans `src/content/legal/controles.json`.
 * Les archives reprises de l'application (versions historiques déjà acceptées)
 * sont exemptées du contrôle des termes : leurs octets ne se modifient jamais.
 *
 *   node scripts/check-legal-texts.mjs            (après un build)
 *   node scripts/check-legal-texts.mjs --sources  (sources seules, sans dist/)
 */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  LEGAL_DOCUMENTS, LEGAL_TEXT_MARKER, checkManifestContract, forbiddenHits, loadControls, loadLegalSources,
  publishedVersions, sha256Hex, visibleText,
} from './lib/legal-core.mjs'
import { CGUV_MANIFEST_FILE, cguvTextFile, cguvVersionPageFile, legalPageFile } from './lib/legal-publish.mjs'

// LEGAL_ROOT : autre racine (tests sur des sources factices) ; dist/ y est relatif.
const root = process.env.LEGAL_ROOT ? path.resolve(process.env.LEGAL_ROOT) : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const sourcesOnly = process.argv.includes('--sources')

const sources = loadLegalSources(root)
const controls = loadControls(root)
const blocking = []

if (sources.errors.length) blocking.push(['Défauts de structure ou d’immuabilité', sources.errors])
if (sources.pending.length) blocking.push([`Textes juridiques et décisions du PO à fournir (${LEGAL_TEXT_MARKER})`, sources.pending])

// Termes interdits dans les SOURCES des textes du site (hors archives de l'application).
const sourceHits = []
for (const d of sources.documents) if (d.raw) sourceHits.push(...forbiddenHits(visibleText(d.raw), controls, d.source))
for (const v of sources.versions) {
  if (v.bytes && v.meta.origin === 'site') sourceHits.push(...forbiddenHits(visibleText(v.text), controls, v.htmlRel))
}
if (sourceHits.length) blocking.push(['Termes interdits dans les textes', sourceHits])

if (!sourcesOnly) {
  const distProblems = []
  let siteOrigin = null
  try {
    siteOrigin = JSON.parse(readFileSync(path.join(dist, '.site-env.json'), 'utf8')).siteOrigin
  } catch {
    distProblems.push('dist/.site-env.json absent ou illisible')
  }

  // Pages servies : présentes, et sans terme interdit dans leur texte visible.
  const published = publishedVersions(sources)
  const pages = [
    ...LEGAL_DOCUMENTS.map((d) => ({ file: legalPageFile(d.key), exempt: false })),
    ...published.map((v) => ({ file: cguvVersionPageFile(v.code), exempt: v.meta.origin === 'archive-application' })),
  ]
  for (const p of pages) {
    const full = path.join(dist, p.file)
    if (!existsSync(full)) { distProblems.push(`dist/${p.file} : page absente`); continue }
    if (!p.exempt) distProblems.push(...forbiddenHits(visibleText(readFileSync(full, 'utf8')), controls, `dist/${p.file}`))
  }

  // Manifeste et textes figés, tels qu'ils seront servis.
  const manifestPath = path.join(dist, CGUV_MANIFEST_FILE)
  if (!existsSync(manifestPath)) {
    if (!sources.pending.length) distProblems.push(`dist/${CGUV_MANIFEST_FILE} : manifeste absent`)
  } else if (siteOrigin) {
    let manifest = null
    try { manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) } catch { distProblems.push(`dist/${CGUV_MANIFEST_FILE} : JSON illisible`) }
    if (manifest) {
      distProblems.push(...checkManifestContract(manifest, siteOrigin).map((e) => `manifeste : ${e}`))
      const listed = new Set()
      for (const v of manifest.versions ?? []) {
        listed.add(v.code)
        const file = path.join(dist, cguvTextFile(v.code))
        if (!existsSync(file)) { distProblems.push(`dist/${cguvTextFile(v.code)} : texte figé annoncé mais absent`); continue }
        const served = sha256Hex(readFileSync(file))
        if (served !== v.sha256) distProblems.push(`dist/${cguvTextFile(v.code)} : sha256 ${served} ≠ manifeste ${v.sha256}`)
        const src = published.find((p) => p.code === v.code)
        if (!src) distProblems.push(`manifeste : ${v.code} n'est pas une version publiée des sources`)
        else if (src.meta.origin === 'site') distProblems.push(...forbiddenHits(visibleText(src.text), controls, `dist/${cguvTextFile(v.code)}`))
      }
      for (const v of published) if (!listed.has(v.code)) distProblems.push(`manifeste : version publiée ${v.code} absente`)
    }
  }
  if (distProblems.length) blocking.push(['Contenu servi (dist/)', [...new Set(distProblems)]])
}

for (const w of sources.warnings) console.warn(`[check-legal-texts] info : ${w}`)
if (blocking.length) {
  console.error('[check-legal-texts] BUILD BLOQUÉ — rubrique « Légal » non publiable :')
  for (const [title, items] of blocking) {
    console.error(`\n  ${title} :`)
    for (const i of items) console.error(`    · ${i}`)
  }
  console.error('\n  Procédure : src/content/legal/README.md et docs/legal.md.')
  process.exit(1)
}
console.log(`[check-legal-texts] rubrique « Légal » conforme : ${LEGAL_DOCUMENTS.length} contenus, ${publishedVersions(sources).length} version(s) des CGUV publiée(s), aucun marqueur ni terme interdit`)
