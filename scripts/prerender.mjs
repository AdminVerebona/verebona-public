/**
 * Pré-rendu de l'accueil — exécuté après `vite build` (voir package.json).
 *
 * Entrées :
 *   dist/index.html                  document produit par le build client ;
 *   node_modules/.prerender/…        bundle SSR de src/entry-prerender.ts.
 *
 * Sorties :
 *   dist/index.html  accueil : HTML de `/` injecté dans <div id="app">,
 *                    head de l'accueil (titre, description, canonical) ;
 *   dist/spa.html    coquille SPA servie par server.cjs pour les autres
 *                    routes : #app vide, titre neutre, description générique,
 *                    pas de canonical figé (posé par src/config/canonical.ts).
 *
 * Le navigateur monte ensuite l'application avec `createApp` (pas
 * d'hydratation) : le DOM rendu est identique, il n'y a donc ni saut de mise
 * en page ni avertissement d'hydratation à gérer.
 */
import { readFile, writeFile, rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const ssrDir = path.join(root, 'node_modules', '.prerender')
const APP_MARKER = '<div id="app"></div>'

const template = await readFile(path.join(dist, 'index.html'), 'utf8')
if (!template.includes(APP_MARKER)) {
  throw new Error(`[prerender] ${APP_MARKER} introuvable dans dist/index.html`)
}

const ssr = await import(pathToFileURL(path.join(ssrDir, 'entry-prerender.js')).href)

// 1. Coquille SPA pour les routes autres que l'accueil.
const shell = template
  .replace(/<title>[\s\S]*?<\/title>/, `<title>${ssr.escapeHtmlAttr(ssr.SHELL_TITLE)}</title>`)
  .replace(
    /(<meta\s+name="description"\s+content=")[^"]*(")/,
    `$1${ssr.escapeHtmlAttr(ssr.DEFAULT_DESCRIPTION)}$2`,
  )
  .replace(/\s*<link rel="canonical"[^>]*>/, '')
await writeFile(path.join(dist, 'spa.html'), shell)

// 2. Accueil pré-rendu.
const appHtml = await ssr.render('/')
for (const needle of ['<h1', '<h2', '<h3']) {
  if (!appHtml.includes(needle)) throw new Error(`[prerender] ${needle} absent du rendu de l'accueil`)
}
await writeFile(path.join(dist, 'index.html'), template.replace(APP_MARKER, `<div id="app">${appHtml}</div>`))

await rm(ssrDir, { recursive: true, force: true })
console.log(`[prerender] dist/index.html (${(appHtml.length / 1024).toFixed(1)} KiB de HTML) · dist/spa.html`)
