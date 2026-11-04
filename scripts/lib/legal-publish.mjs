/**
 * Publication de la rubrique « Légal » dans `dist/` — chantier 104P (P0-B).
 *
 * Exécutée APRÈS le pré-rendu (pages déjà écrites), dans cet ordre :
 *   1. contrôle des sources (structure, immuabilité) ;
 *   2. vérifie que chaque page pré-rendue existe (5 contenus, une page par
 *      version publiée, page 404 « version inconnue ») ;
 *   3. copie OCTET POUR OCTET chaque texte figé vers
 *      `dist/legal/cguv/versions/<code>.html` (écriture temporaire + renommage),
 *      relit le fichier écrit et compare son SHA-256 au verrou ;
 *   4. écrit le manifeste `dist/legal/cguv/versions.json` EN DERNIER
 *      (temporaire + renommage) : il n'annonce jamais une version dont le
 *      fichier ou la page ne seraient pas en place.
 */
import { mkdirSync, readFileSync, renameSync, writeFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import {
  CGUV_UNKNOWN_VERSION_PAGE, LEGAL_DOCUMENTS, LEGAL_PAGES_DIR, buildCguvManifest, checkManifestContract,
  loadLegalSources, publishedVersions, serializeManifest, sha256Hex,
} from './legal-core.mjs'

export const legalPageFile = (key) => `${LEGAL_PAGES_DIR}/${key}.html`
export const cguvVersionPageFile = (code) => `${LEGAL_PAGES_DIR}/cguv/versions/${code}.html`
export const cguvTextFile = (code) => `legal/cguv/versions/${code}.html`
export const CGUV_MANIFEST_FILE = 'legal/cguv/versions.json'

function atomicWrite(target, data) {
  mkdirSync(path.dirname(target), { recursive: true })
  const tmp = `${target}.tmp-${process.pid}`
  writeFileSync(tmp, data)
  renameSync(tmp, target)
}

export function publishLegalToDist({ root, dist, siteOrigin, now = new Date() }) {
  const sources = loadLegalSources(root)
  if (sources.errors.length) {
    throw new Error(`[legal] ${sources.errors.length} défaut(s) dans src/content/legal :\n  · ${sources.errors.join('\n  · ')}`)
  }
  const published = publishedVersions(sources)

  const expectedPages = [
    ...LEGAL_DOCUMENTS.map((d) => legalPageFile(d.key)),
    CGUV_UNKNOWN_VERSION_PAGE,
    ...published.map((v) => cguvVersionPageFile(v.code)),
  ]
  const missing = expectedPages.filter((f) => !existsSync(path.join(dist, f)))
  if (missing.length) throw new Error(`[legal] pages pré-rendues absentes : ${missing.join(', ')}`)

  for (const v of published) {
    const target = path.join(dist, cguvTextFile(v.code))
    atomicWrite(target, v.bytes)
    const served = sha256Hex(readFileSync(target))
    const locked = sources.lock.versions[v.code]?.sha256
    if (served !== v.sha256 || served !== locked) {
      throw new Error(`[legal] ${cguvTextFile(v.code)} : empreinte écrite ${served} ≠ verrou ${locked}`)
    }
  }

  if (published.length === 0) {
    return { manifest: null, published, pending: sources.pending, warnings: sources.warnings }
  }
  const manifest = buildCguvManifest(published, siteOrigin, now.toISOString())
  const problems = checkManifestContract(manifest, siteOrigin)
  if (problems.length) throw new Error(`[legal] manifeste non conforme au contrat :\n  · ${problems.join('\n  · ')}`)
  atomicWrite(path.join(dist, CGUV_MANIFEST_FILE), serializeManifest(manifest))
  return { manifest, published, pending: sources.pending, warnings: sources.warnings }
}

/* ── Verrou des versions publiées (procédures du PO) ────────────────────── */

/** Écrit le verrou trié par code (format stable, diff lisible). */
export function writeCguvLock(root, lock, lockRel) {
  const versions = Object.fromEntries(Object.entries(lock.versions).sort(([a], [b]) => a.localeCompare(b)))
  atomicWrite(path.join(root, lockRel), JSON.stringify({ ...lock, versions }, null, 2) + '\n')
}
