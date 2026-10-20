/**
 * Contrôle d'après build des routes et ancres — lot 72 (ticket « liens
 * obsolètes app ↔ vitrine », §3.5).
 *
 * Exécuté à la fin de `npm run build` et de `npm run build:preprod` (donc
 * sur l'hébergeur), sur le `dist/` RÉELLEMENT produit :
 *   · `dist/.site-routes.json` existe (sans lui, `server.cjs` retomberait
 *     sur des « soft 404 ») et déclare des routes ;
 *   · chaque ancre de l'accueil (`homeAnchors`, dérivées des sources) est
 *     présente dans l'accueil PRÉ-RENDU (`dist/index.html`) : un lien
 *     `/#how` de l'application atterrit sur une section qui existe dans le
 *     HTML servi, et pas seulement dans le code ;
 *   · chaque ancienne URL redirige vers une destination servie (route
 *     déclarée, ancre présente) — jamais vers une autre ancienne URL.
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const fail = (msg) => { console.error(`[check-site-routes] ${msg}`); process.exit(1) }

let routes
try {
  routes = JSON.parse(await readFile(path.join(dist, '.site-routes.json'), 'utf8'))
} catch {
  fail('dist/.site-routes.json absent : server.cjs servirait la coquille SPA en 200 pour toute adresse')
}
if (!Array.isArray(routes.staticRoutes) || !routes.staticRoutes.includes('/')) fail('staticRoutes vide ou sans « / »')

const home = await readFile(path.join(dist, 'index.html'), 'utf8')
const ids = new Set([...home.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))
const absentes = (routes.homeAnchors ?? []).filter((a) => !ids.has(a))
if (absentes.length) fail(`ancres absentes de l'accueil pré-rendu : ${absentes.join(', ')}`)

for (const [from, to] of Object.entries(routes.legacyRedirects ?? {})) {
  const [p, hash] = to.split('#')
  const pathOnly = p.split('?')[0] || '/'
  if (routes.legacyRedirects[pathOnly]) fail(`chaîne de redirections : ${from} → ${to}`)
  if (!routes.staticRoutes.includes(pathOnly)) fail(`${from} → ${to} : destination non déclarée`)
  if (hash && (pathOnly !== '/' || !ids.has(hash))) fail(`${from} → ${to} : ancre absente de l'accueil`)
}

console.log(`[check-site-routes] ${routes.staticRoutes.length} routes · ${(routes.homeAnchors ?? []).length} ancres présentes · ${Object.keys(routes.legacyRedirects ?? {}).length} redirection(s) · ${(routes.retired ?? []).length} page(s) retirée(s)`)
