/**
 * Fige une version des CGUV (procédure de publication, étape 3).
 *
 *   npm run legal:figer-cguv -- 2026-11-15-v1
 *
 * Refuse tant que le texte porte le marqueur, qu'une décision du PO manque
 * (dates, requiresReacceptance) ou qu'un défaut de structure subsiste. Sinon,
 * écrit dans `src/content/legal/cguv/empreintes.lock.json` l'empreinte SHA-256
 * du fichier figé ET ses métadonnées : à partir de là, toute modification des
 * octets, des dates ou de la décision fait échouer le build et les tests.
 * Commiter ensuite les trois fichiers (.html, .json, verrou).
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { CGUV_LOCK_FILE, frozenMeta, loadLegalSources } from './lib/legal-core.mjs'
import { writeCguvLock } from './lib/legal-publish.mjs'

const root = process.env.LEGAL_ROOT ? path.resolve(process.env.LEGAL_ROOT) : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const fail = (msg) => { console.error(`[legal:figer-cguv] REFUSÉ — ${msg}`); process.exit(1) }

const code = process.argv[2]
if (!code) fail('usage : npm run legal:figer-cguv -- AAAA-MM-JJ-vN')
const sources = loadLegalSources(root)
const v = sources.versions.find((x) => x.code === code)
if (!v) fail(`version ${code} inconnue`)
const related = sources.errors.filter((e) => e.includes(code))
if (related.length) fail(`défauts à corriger :\n  · ${related.join('\n  · ')}`)
if (v.status === 'publiee') { console.log(`[legal:figer-cguv] ${code} est déjà figée (sha256 ${v.sha256}).`); process.exit(0) }
if (v.status !== 'a-figer') {
  const missing = sources.pending.filter((p) => p.includes(code))
  fail(`${code} n'est pas prête (${v.status}) :\n  · ${missing.join('\n  · ')}`)
}

const lock = JSON.parse(readFileSync(path.join(root, CGUV_LOCK_FILE), 'utf8'))
lock.versions[code] = { sha256: v.sha256, meta: frozenMeta(v.meta), figeeLe: new Date().toISOString() }
writeCguvLock(root, lock, CGUV_LOCK_FILE)
console.log(`[legal:figer-cguv] ${code} figée : sha256 ${v.sha256}, substantielle = ${v.meta.requiresReacceptance ? 'oui' : 'non'}.`)
console.log(`  À commiter : ${v.htmlRel}, ${v.jsonRel}, ${CGUV_LOCK_FILE}. Elle sera publiée au prochain déploiement.`)
