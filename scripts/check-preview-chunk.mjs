/**
 * Contrôle du sélecteur de prévisualisation dans `dist/` — CDC 8, observation O2.
 *
 * Exécuté à la fin de `npm run build` et de `npm run build:preprod` (donc en
 * CI et sur l'hébergeur), ou seul : `npm run check:preview-chunk`.
 *
 * L'environnement est celui que le build a figé dans `dist/.site-env.json`
 * (VITE_ENVIRONMENT, pas le `mode` Vite : Scalingo construit la préproduction
 * en mode `production`).
 *
 *   production          aucun chunk `PreviewModeSwitch`, aucune trace du
 *                       sélecteur ni de la garde `?mode=` dans le JS, le CSS
 *                       ou le HTML émis → sinon échec ;
 *   preprod/development le chunk existe et est référencé par le bundle
 *                       d'entrée, la garde `?mode=` est dans index.html
 *                       → sinon échec (le sélecteur aurait disparu).
 *
 * Mécanisme contrôlé : `__VB_CAN_PREVIEW_SITE_MODE__` (vite.config.ts,
 * src/config/site.ts).
 */
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')

/** Traces du sélecteur et de la prévisualisation `?mode=` dans le code émis. */
const MARKERS = [
  'PreviewModeSwitch', // nom du chunk (import dynamique dans le bundle d'entrée)
  'preview-mode-switch', // data-testid du composant
  'vb-preview-switch', // classe du composant (et sa règle CSS mobile)
  'data-mode-request', // garde `?mode=` avant montage (mode-preview-guard.rules.ts)
]
const SCANNED = /\.(js|mjs|css|html)$/

async function files(dir) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...(await files(full)))
    else out.push(full)
  }
  return out
}

const rel = (f) => path.relative(root, f).split(path.sep).join('/')

let siteEnv
try {
  siteEnv = JSON.parse(await readFile(path.join(dist, '.site-env.json'), 'utf8'))
} catch {
  console.error('[check-preview-chunk] dist/.site-env.json introuvable : lancer `npm run build` (ou build:preprod) avant ce contrôle.')
  process.exit(1)
}

const environment = siteEnv.environment
const all = await files(dist)
const errors = []

if (environment === 'production') {
  for (const f of all) {
    const name = path.basename(f)
    if (/PreviewModeSwitch/.test(name)) errors.push(`${rel(f)} : chunk du sélecteur émis`)
    if (/^index\.(full|prelaunch)\.html$/.test(name)) errors.push(`${rel(f)} : accueil de prévisualisation émis`)
    if (!SCANNED.test(name)) continue
    const text = await readFile(f, 'utf8')
    for (const marker of MARKERS) {
      if (text.includes(marker)) errors.push(`${rel(f)} : contient « ${marker} »`)
    }
  }
} else {
  const assets = all.filter((f) => path.dirname(f) === path.join(dist, 'assets'))
  const chunk = assets.find((f) => /^PreviewModeSwitch-.*\.js$/.test(path.basename(f)))
  if (!chunk) {
    errors.push('dist/assets/PreviewModeSwitch-*.js absent : le sélecteur doit rester disponible hors production')
  } else {
    const chunkName = path.basename(chunk)
    const referenced = await Promise.all(
      assets
        .filter((f) => f.endsWith('.js') && f !== chunk)
        .map(async (f) => (await readFile(f, 'utf8')).includes(chunkName)),
    )
    if (!referenced.some(Boolean)) errors.push(`${chunkName} n'est importé par aucun bundle : sélecteur inaccessible`)
  }
  const index = await readFile(path.join(dist, 'index.html'), 'utf8')
  if (!index.includes('data-mode-request')) errors.push('dist/index.html : garde `?mode=` absente')
}

if (errors.length) {
  console.error(`[check-preview-chunk] environnement=${environment} — ${errors.length} défaut(s) :`)
  for (const e of errors) console.error(`  · ${e}`)
  process.exit(1)
}

console.log(
  environment === 'production'
    ? `[check-preview-chunk] production : aucune trace du sélecteur de prévisualisation (${all.length} fichiers contrôlés)`
    : `[check-preview-chunk] ${environment} : sélecteur de prévisualisation présent`,
)
