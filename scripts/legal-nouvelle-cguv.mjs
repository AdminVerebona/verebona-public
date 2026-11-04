/**
 * Prépare une NOUVELLE version des CGUV (procédure de publication, étape 1).
 *
 *   npm run legal:nouvelle-cguv -- 2026-11-15-v1
 *
 * Crée, dans `src/content/legal/cguv/versions/` :
 *   · `<code>.html` : le fichier qui sera servi OCTET POUR OCTET à
 *     `/legal/cguv/versions/<code>.html`. Le texte des CGUV se colle dans
 *     `<article>`, à la place du marqueur ; rien d'autre n'est à modifier ;
 *   · `<code>.json` : métadonnées à compléter par le PO (dates,
 *     requiresReacceptance, résumé du changement).
 * Le code doit être le jour réel de publication (N = 2, 3… si plusieurs le
 * même jour) et postérieur à toutes les versions existantes. Aucun code n'est
 * réutilisé.
 */
import { existsSync, readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  CGUV_DEFAULT_TITLE, CGUV_VERSIONS_DIR, LEGAL_TEXT_MARKER, compareVersionCodes, isCguvVersionCode,
} from './lib/legal-core.mjs'

const root = process.env.LEGAL_ROOT ? path.resolve(process.env.LEGAL_ROOT) : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const fail = (msg) => { console.error(`[legal:nouvelle-cguv] ${msg}`); process.exit(1) }

const code = process.argv[2]
if (!isCguvVersionCode(code)) fail('usage : npm run legal:nouvelle-cguv -- AAAA-MM-JJ-vN (date réelle de publication)')
const dir = path.join(root, CGUV_VERSIONS_DIR)
const existing = [...new Set(readdirSync(dir).map((n) => n.replace(/\.(json|html)$/, '')).filter(isCguvVersionCode))].sort(compareVersionCodes)
if (existing.includes(code)) fail(`${code} existe déjà : un code n'est jamais réutilisé`)
const latest = existing.at(-1)
if (latest && compareVersionCodes(code, latest) <= 0) fail(`${code} doit être postérieur à la dernière version (${latest})`)

/**
 * Gabarit du fichier figé. Volontairement minimal et autonome (aucune
 * ressource externe, aucun script) : il est lisible hors ligne, imprimable,
 * et ses octets ne dépendent d'aucun environnement — même empreinte en
 * préproduction et en production.
 */
const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="verebona-cguv-version" content="${code}">
<title>CGUV Verebona — version ${code}</title>
<style>
body{margin:0;padding:2rem 1rem 4rem;font-family:system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:#26353B;background:#FFFFFF;line-height:1.65}
main{max-width:46rem;margin:0 auto}
header{border-bottom:2px solid #17474D;padding-bottom:1rem;margin-bottom:2rem}
header p{margin:0;color:#52636A;font-size:.95rem}
h2{font-size:1.25rem;margin:2rem 0 .75rem}h3{font-size:1.05rem;margin:1.5rem 0 .5rem}
p,li{margin:0 0 .75rem}ul,ol{padding-left:1.5rem}
table{border-collapse:collapse;width:100%}th,td{border:1px solid #D5DEDC;padding:.4rem .6rem;text-align:left;vertical-align:top}
</style>
</head>
<body>
<main>
<header>
<p>Verebona — CGUV</p>
<p>Version ${code}</p>
</header>
<article>
${LEGAL_TEXT_MARKER}
</article>
</main>
</body>
</html>
`

const meta = {
  code,
  origin: 'site',
  title: CGUV_DEFAULT_TITLE,
  publishedAt: null,
  effectiveAt: null,
  requiresReacceptance: null,
  changeSummary: null,
}

const htmlAbs = path.join(dir, `${code}.html`)
const jsonAbs = path.join(dir, `${code}.json`)
if (existsSync(htmlAbs) || existsSync(jsonAbs)) fail(`${code} : fichiers déjà présents`)
writeFileSync(htmlAbs, html)
writeFileSync(jsonAbs, JSON.stringify(meta, null, 2) + '\n')
console.log(`[legal:nouvelle-cguv] ${CGUV_VERSIONS_DIR}/${code}.html et .json créés.`)
console.log('  1. Coller le texte fourni par le PO dans <article> (à la place du marqueur).')
console.log('  2. Compléter le .json : publishedAt, effectiveAt, requiresReacceptance (décision PO), changeSummary.')
console.log(`  3. npm run legal:figer-cguv -- ${code}   puis commiter les trois fichiers.`)
