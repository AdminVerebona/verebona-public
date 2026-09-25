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
import { readFile, writeFile, rm, mkdir } from 'node:fs/promises'
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

// 3. Centre d'aide : une page statique par page publiée (SEO-01, SEO-02).
//
// Construite sur la coquille SPA (titre et description neutres, sans
// canonical), dont on remplace l'en-tête par celui de la page. Le navigateur
// monte ensuite l'application normalement : le HTML servi aux moteurs et celui
// de la navigation interne viennent des mêmes fonctions (src/help/head.ts).
const esc = ssr.escapeHtmlAttr
const pages = ssr.helpPages()
for (const page of pages) {
  const html = await ssr.render(page.path)
  const h = page.head
  const headTags = [
    h.canonical ? `<link rel="canonical" href="${esc(h.canonical)}">` : '',
    h.noindex ? '<meta name="robots" content="noindex, follow" data-help-robots>' : '',
    h.jsonLd
      ? `<script type="application/ld+json" id="help-jsonld">${JSON.stringify(h.jsonLd).replace(/</g, '\\u003c')}</script>`
      : '',
  ].filter(Boolean).join('\n    ')
  // Remplacements par fonction : un « $& » ou « $' » dans un titre ou un
  // article serait sinon interprété comme motif de remplacement.
  let doc = shell
    .replace(/<title>[\s\S]*?<\/title>/, () => `<title>${esc(h.title)}</title>`)
    .replace(/(<meta\s+name="description"\s+content=")[^"]*(")/, (_, a, b) => `${a}${esc(h.description)}${b}`)
    .replace(APP_MARKER, () => `<div id="app">${html}</div>`)
  if (h.canonical) doc = doc.replace(/(<meta\s+property="og:url"\s+content=")[^"]*(")/, (_, a, b) => `${a}${esc(h.canonical)}${b}`)
  doc = doc.replace('</head>', () => `    ${headTags}\n  </head>`)
  const target = path.join(dist, page.file)
  await mkdir(path.dirname(target), { recursive: true })
  await writeFile(target, doc)
}

await rm(ssrDir, { recursive: true, force: true })
console.log(`[prerender] dist/index.html (${(appHtml.length / 1024).toFixed(1)} KiB de HTML) · dist/spa.html · ${pages.length} pages d'aide`)
