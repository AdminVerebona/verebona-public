/**
 * Build — publication des textes figés des CGUV et du manifeste (chantier 104P).
 *
 * Maillon de `npm run build` / `npm run build:preprod`, après le pré-rendu et
 * les contrôles de routes : copie octet pour octet chaque version publiée vers
 * `dist/legal/cguv/versions/<code>.html`, puis écrit `dist/legal/cguv/versions.json`
 * EN DERNIER. L'origine des permaliens vient de `dist/.site-env.json`
 * (`siteOrigin`, écrit par vite.config.ts depuis VITE_PUBLIC_SITE_URL).
 *
 * Tant qu'aucune version n'est publiable (textes à fournir), aucun manifeste
 * n'est écrit : `scripts/check-legal-texts.mjs` (maillon suivant) fait alors
 * échouer le build en listant ce qui manque.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { publishLegalToDist } from './lib/legal-publish.mjs'

// LEGAL_ROOT : autre racine (tests sur des sources factices) ; dist/ y est relatif.
const root = process.env.LEGAL_ROOT ? path.resolve(process.env.LEGAL_ROOT) : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')

let siteEnv
try {
  siteEnv = JSON.parse(readFileSync(path.join(dist, '.site-env.json'), 'utf8'))
} catch {
  console.error('[publish-legal] dist/.site-env.json absent : lancer le build complet')
  process.exit(1)
}
if (typeof siteEnv.siteOrigin !== 'string') {
  console.error('[publish-legal] siteOrigin absent de dist/.site-env.json')
  process.exit(1)
}

try {
  const r = publishLegalToDist({ root, dist, siteOrigin: siteEnv.siteOrigin })
  for (const w of r.warnings) console.warn(`[publish-legal] info : ${w}`)
  if (r.manifest) {
    console.log(`[publish-legal] ${r.published.length} version(s) des CGUV publiée(s) (courante ${r.manifest.current}) · manifeste ${siteEnv.siteOrigin}/legal/cguv/versions.json écrit en dernier`)
  } else {
    console.warn(`[publish-legal] aucune version des CGUV publiable : manifeste NON écrit (${r.pending.length} élément(s) à fournir, voir check-legal-texts)`)
  }
} catch (e) {
  console.error(String(e.message ?? e))
  process.exit(1)
}
