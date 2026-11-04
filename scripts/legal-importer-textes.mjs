/**
 * Dépose des textes juridiques fournis par le PO — chantier 108P-L.
 *
 *   npm run legal:importer-textes -- <export> [--lister] [--ecrire] [--verifier]
 *        [--cguv-code AAAA-MM-JJ-vN] [--cibles mentions-legales,cguv,…] [--remplacer]
 *
 * <export> : export du Google Doc juridique, SANS RETOUCHE :
 *   « Fichier › Télécharger › Page Web (.html, compressé) » (.zip, ou le .html
 *   qu'il contient) ou « Microsoft Word (.docx) ».
 *
 * Modes :
 *   (aucun)     essai à blanc : découpage, conversion, contrôle de fidélité,
 *               rapport — RIEN n'est écrit ;
 *   --lister    titres de bloc trouvés et contenu associé (pour ajuster
 *               src/content/legal/import/decoupage.json) ;
 *   --ecrire    écrit les fragments SI ET SEULEMENT SI tous les contrôles
 *               passent (fidélité mot pour mot, structure, cibles libres) :
 *                 · mentions-legales / confidentialite / sous-traitants /
 *                   parrainage → src/content/legal/<cible>.html (fichier qui
 *                   porte encore le marqueur « à fournir », sauf --remplacer) ;
 *                 · cguv → <article> de src/content/legal/cguv/versions/<code>.html
 *                   (version créée par legal:nouvelle-cguv, NON figée, marqueur
 *                   présent) — rien d'autre du fichier ne change ;
 *               puis le rapport src/content/legal/import/dernier-import.json
 *               (empreinte de l'export, empreinte du texte de chaque contenu),
 *               relu par les tests : toute retouche à la main après l'import
 *               fait échouer `npm test`.
 *   --verifier  compare l'export aux textes DÉJÀ déposés (recette :
 *               « comparaison des textes ») ; n'écrit rien.
 *
 * Ce script ne rédige, ne corrige et ne complète AUCUN texte : il convertit la
 * forme et refuse tout écart (voir scripts/lib/legal-import.mjs).
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  CGUV_LOCK_FILE, CGUV_VERSIONS_DIR, LEGAL_CONTENT_DIR, LEGAL_TEXT_MARKER, checkFragment, forbiddenHits, loadControls, visibleText,
} from './lib/legal-core.mjs'
import {
  IMPORT_CONFIG_FILE, IMPORT_REPORT_FILE, IMPORT_TARGETS, ImportRefusal, convertExport, depositedFingerprint, textFingerprint, fragmentText,
} from './lib/legal-import.mjs'

const root = process.env.LEGAL_ROOT ? path.resolve(process.env.LEGAL_ROOT) : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const TAG = '[legal-importer-textes]'
const fail = (lines) => {
  console.error(`${TAG} REFUSÉ — rien n'a été écrit :`)
  for (const l of [].concat(lines)) console.error(`  · ${l}`)
  process.exit(1)
}

const args = process.argv.slice(2)
const flag = (n) => { const i = args.indexOf(n); if (i === -1) return false; args.splice(i, 1); return true }
const opt = (n) => { const i = args.indexOf(n); if (i === -1) return undefined; const v = args[i + 1]; args.splice(i, 2); return v }
const lister = flag('--lister')
const ecrire = flag('--ecrire')
const verifier = flag('--verifier')
const remplacer = flag('--remplacer')
const cguvCodeArg = opt('--cguv-code')
const ciblesArg = opt('--cibles')
const file = args[0]
if (!file) fail('usage : npm run legal:importer-textes -- <export .docx | .zip | .html> [--lister | --ecrire | --verifier]')
if (!existsSync(file)) fail(`export introuvable : ${file}`)
if ([lister, ecrire, verifier].filter(Boolean).length > 1) fail('choisir un seul mode : --lister, --ecrire ou --verifier')

const targets = ciblesArg ? ciblesArg.split(',').map((s) => s.trim()).filter(Boolean) : [...IMPORT_TARGETS]
for (const t of targets) if (!IMPORT_TARGETS.includes(t)) fail(`cible inconnue « ${t} » (${IMPORT_TARGETS.join(', ')})`)

const configAbs = path.join(root, IMPORT_CONFIG_FILE)
const config = existsSync(configAbs) ? JSON.parse(readFileSync(configAbs, 'utf8')) : fail(`${IMPORT_CONFIG_FILE} absent`)

/* Version des CGUV qui recevra le texte : celle du site, non figée, marqueur présent. */
function cguvTarget() {
  const lock = JSON.parse(readFileSync(path.join(root, CGUV_LOCK_FILE), 'utf8'))
  let code = cguvCodeArg
  if (!code) {
    const dir = path.join(root, CGUV_VERSIONS_DIR)
    const candidates = []
    for (const n of (existsSync(dir) ? readdirSync(dir) : [])) {
      const m = /^(.+)\.json$/.exec(n)
      if (!m) continue
      const meta = JSON.parse(readFileSync(path.join(dir, n), 'utf8'))
      const html = path.join(dir, `${m[1]}.html`)
      if (meta.origin === 'site' && !lock.versions[m[1]] && existsSync(html) && readFileSync(html, 'utf8').includes(LEGAL_TEXT_MARKER)) candidates.push(m[1])
    }
    if (candidates.length !== 1) return { error: `version des CGUV à remplir : ${candidates.length === 0 ? 'aucune (créer la version : npm run legal:nouvelle-cguv -- AAAA-MM-JJ-vN)' : `plusieurs (${candidates.join(', ')}) — préciser --cguv-code`}` }
    code = candidates[0]
  }
  const rel = `${CGUV_VERSIONS_DIR}/${code}.html`
  if (lock.versions[code]) return { code, rel, error: `${code} est déjà figée (publiée) : son texte ne change plus jamais — créer une nouvelle version` }
  if (!existsSync(path.join(root, rel))) return { code, rel, error: `${rel} absent (npm run legal:nouvelle-cguv -- ${code})` }
  return { code, rel }
}
const fileOf = (cible, cg) => (cible === 'cguv' ? cg.rel : `${LEGAL_CONTENT_DIR}/${cible}.html`)

async function main() {
  const buf = readFileSync(file)
  let result
  try {
    result = convertExport(buf, file, config, { checkFragment, targets })
  } catch (e) {
    if (e instanceof ImportRefusal) fail(e.messages)
    throw e
  }
  const { report } = result

  if (lister) {
    console.log(`${TAG} ${report.source.fichier} (${report.source.format}, sha256 ${report.source.sha256})`)
    console.log(`  niveau des titres de bloc : ${report.niveauBloc === 0 ? 'titre du document' : `h${report.niveauBloc}`}`)
    for (const b of report.blocs) console.log(`  · « ${b.titre} » → ${b.cible ?? 'AUCUN CONTENU (règle à ajouter)'}`)
    for (const [c, v] of Object.entries(report.cibles)) console.log(`  = ${c} : ${v.mots} mots (${v.blocsSource.length} bloc(s))`)
    if (result.refusals.length) { console.log('  Points bloquants :'); for (const r of result.refusals) console.log(`    · ${r}`) }
    return
  }

  const cg = targets.includes('cguv') ? cguvTarget() : null
  const refusals = [...result.refusals]

  if (verifier) {
    // Recette : texte de l'export == texte déposé, contenu par contenu. Version CGUV :
    // --cguv-code, sinon celle du dernier import (figée ou non : lecture seule).
    let cgv = cg
    if (targets.includes('cguv')) {
      const repAbs = path.join(root, IMPORT_REPORT_FILE)
      const code = cguvCodeArg ?? (existsSync(repAbs) ? JSON.parse(readFileSync(repAbs, 'utf8')).cibles?.cguv?.version : null)
      cgv = code ? { code, rel: `${CGUV_VERSIONS_DIR}/${code}.html` } : cg
      if (!cgv?.rel) refusals.push(cg?.error ?? 'version des CGUV déposée inconnue (--cguv-code)')
    }
    const cg2 = cgv
    const lines = []
    for (const c of Object.keys(result.fragments)) {
      const rel = c === 'cguv' ? (cg2?.rel ?? null) : fileOf(c)
      if (!rel || !existsSync(path.join(root, rel))) { lines.push(`${c} : fichier déposé introuvable`); continue }
      const deposited = depositedFingerprint(readFileSync(path.join(root, rel), 'utf8'))
      const fromExport = textFingerprint(fragmentText(result.fragments[c]))
      lines.push(`${c} : ${deposited === fromExport ? 'IDENTIQUE à l’export' : 'DIFFÉRENT de l’export'} (${rel})`)
      if (deposited !== fromExport) refusals.push(`${c} : le texte déposé diffère de l’export`)
    }
    for (const l of lines) console.log(`${TAG} ${l}`)
    if (refusals.length) fail(refusals)
    console.log(`${TAG} comparaison OK — export sha256 ${report.source.sha256}`)
    return
  }

  // Cibles libres : marqueur présent (ou --remplacer pour les contenus non versionnés).
  if (cg?.error) refusals.push(cg.error)
  const writes = []
  for (const c of Object.keys(result.fragments)) {
    const rel = fileOf(c, cg ?? {})
    if (!rel) continue
    const abs = path.join(root, rel)
    const current = existsSync(abs) ? readFileSync(abs, 'utf8') : ''
    if (c === 'cguv') {
      if (!cg || cg.error) continue
      const count = current.split(LEGAL_TEXT_MARKER).length - 1
      if (count !== 1) { refusals.push(`${rel} : marqueur ${LEGAL_TEXT_MARKER} attendu une seule fois dans <article> (trouvé ${count})`); continue }
      writes.push({ cible: c, rel, abs, content: current.replace(LEGAL_TEXT_MARKER, result.fragments[c].trimEnd()) })
    } else {
      if (!current.includes(LEGAL_TEXT_MARKER) && !remplacer) { refusals.push(`${rel} : déjà rempli (marqueur absent) — --remplacer pour déposer une nouvelle rédaction fournie par le PO`); continue }
      writes.push({ cible: c, rel, abs, content: result.fragments[c] })
    }
  }

  // Termes interdits (contrôles du build) : signalés, jamais corrigés.
  const controls = loadControls(root)
  const hits = []
  for (const w of writes) hits.push(...forbiddenHits(visibleText(result.fragments[w.cible]), controls, w.cible))

  console.log(`${TAG} export ${report.source.fichier} (${report.source.format}, sha256 ${report.source.sha256})`)
  for (const [c, v] of Object.entries(report.cibles)) console.log(`  · ${c} : ${v.mots} mots, ${v.blocsSource.length} bloc(s) [${v.blocsSource.join(' | ')}] — fidélité ${result.report.fidelite.parContenu[c]?.ok ? 'OK' : 'ÉCHEC'}`)
  if (report.commentairesIgnores) console.log(`  · ${report.commentairesIgnores} commentaire(s) du document non importé(s)`)
  for (const t of report.texteIgnore) console.log(`  · ignoré (décision de la configuration) : ${t.slice(0, 160)}`)
  for (const a of report.avertissements) console.log(`  · avertissement : ${a}`)
  if (hits.length) {
    console.log('  · termes interdits par src/content/legal/controles.json (le build les bloquera ; à arbitrer par le PO, le texte n’est PAS modifié) :')
    for (const h of hits) console.log(`      ${h}`)
  }
  if (refusals.length) fail(refusals)
  if (!ecrire) { console.log(`${TAG} essai à blanc réussi : relancer avec --ecrire pour déposer les textes.`); return }

  // Écriture atomique de chaque fichier (temporaire puis renommage), rapport en dernier.
  for (const w of writes) {
    const tmp = `${w.abs}.import-tmp`
    writeFileSync(tmp, w.content)
    renameSync(tmp, w.abs)
    const back = depositedFingerprint(readFileSync(w.abs, 'utf8'))
    if (back !== report.cibles[w.cible].texteSha256) fail(`${w.rel} : relecture différente après écriture (fichier à restaurer avec git checkout)`)
  }
  const saved = {
    ...report,
    importeLe: new Date().toISOString(),
    cibles: Object.fromEntries(writes.map((w) => [w.cible, { ...report.cibles[w.cible], fichier: w.rel, ...(w.cible === 'cguv' ? { version: cg.code } : {}) }])),
  }
  const repAbs = path.join(root, IMPORT_REPORT_FILE)
  mkdirSync(path.dirname(repAbs), { recursive: true })
  const prev = existsSync(repAbs) ? JSON.parse(readFileSync(repAbs, 'utf8')) : null
  if (prev && ciblesArg) saved.cibles = { ...prev.cibles, ...saved.cibles }
  writeFileSync(`${repAbs}.tmp`, JSON.stringify(saved, null, 2) + '\n')
  renameSync(`${repAbs}.tmp`, repAbs)
  console.log(`${TAG} textes déposés : ${writes.map((w) => w.rel).join(', ')}`)
  console.log(`  Rapport : ${IMPORT_REPORT_FILE}. Étapes suivantes : relire les pages (npm run dev), compléter les décisions de la version CGUV (${cg?.code ?? '—'}.json), npm run legal:figer-cguv -- ${cg?.code ?? '<code>'}, npm test, build.`)
}

main().catch((e) => { console.error(`${TAG} erreur :`, e.message); process.exit(1) })
