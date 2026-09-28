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
 *                    pas de canonical figé (posé par src/config/canonical.ts),
 *                    pas de JSON-LD Organization/WebSite (accueil seulement).
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

// Le bundle SSR est un module ES en `.js`, rangé sous node_modules/ : Node
// n'y voit pas le `"type": "module"` du projet (la recherche du package.json
// s'arrête à node_modules). Node ≥ 22.12 le devine seul ; Node 20 le lit
// comme du CommonJS et échoue (« Cannot use import statement outside a
// module »). On déclare donc explicitement le dossier en module ES.
await writeFile(path.join(ssrDir, 'package.json'), '{ "type": "module" }\n')
const ssr = await import(pathToFileURL(path.join(ssrDir, 'entry-prerender.js')).href)

// 1. Coquille SPA pour les routes autres que l'accueil.
const shellBase = template
  .replace(/<title>[\s\S]*?<\/title>/, `<title>${ssr.escapeHtmlAttr(ssr.SHELL_TITLE)}</title>`)
  .replace(
    /(<meta\s+name="description"\s+content=")[^"]*(")/,
    `$1${ssr.escapeHtmlAttr(ssr.DEFAULT_DESCRIPTION)}$2`,
  )
  .replace(/\s*<link rel="canonical"[^>]*>/, '')
  // CDC Données structurées §2, §6, §8.1 : Organization et WebSite vont sur
  // l'accueil canonique seulement. La coquille sert toutes les autres routes
  // et les pages d'aide : sans ce retrait, le graphe était recopié sur ~100
  // pages. Les pages d'aide gardent leur `TechArticle`, dont `publisher`
  // référence `#organization` (un @id que Google résout depuis l'accueil).
  .replace(/\s*<script type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/g, '')
// CDC Données structurées §6 : les balises Open Graph / Twitter de l'accueil
// (URL, titre, description) ne valent que pour l'accueil. La coquille reçoit
// des valeurs neutres, sans og:url ; chaque page d'aide, les siennes (§3).
const withSocial = (doc, head) =>
  ssr.stripSocialMeta(doc).replace('</head>', () => `    ${ssr.socialMetaHtml(head)}\n  </head>`)
const shell = withSocial(shellBase, { title: ssr.SHELL_TITLE, description: ssr.DEFAULT_DESCRIPTION, url: null })
if (shell.includes('application/ld+json')) {
  throw new Error('[prerender] JSON-LD Organization/WebSite encore présent dans spa.html')
}
await writeFile(path.join(dist, 'spa.html'), shell)

// 2. Accueil pré-rendu.
//
// `data-prerender-mode` : mode dans lequel le HTML a été rendu. En
// préproduction, le script de `index.html` masque ce HTML avant la première
// peinture quand `?mode=` demande l'autre mode (CDC pré-lancement §5.3) ;
// `src/main.ts` retire l'attribut une fois l'application montée.
const appRoot = (mode, html) => `<div id="app" data-prerender-mode="${mode}">${html}</div>`
const appHtml = await ssr.render('/')
for (const needle of ['<h1', '<h2', '<h3']) {
  if (!appHtml.includes(needle)) throw new Error(`[prerender] ${needle} absent du rendu de l'accueil`)
}
await writeFile(path.join(dist, 'index.html'), template.replace(APP_MARKER, () => appRoot(ssr.DEFAULT_SITE_MODE, appHtml)))

// 2 bis. Préproduction : accueil pré-rendu dans l'autre mode, servi par
// server.cjs pour `/?mode=<autre>` (CDC pré-lancement §5.3). Un nouvel onglet
// ouvert sur `/?mode=prelaunch` affiche d'emblée la version pré-lancement,
// sans aucun lien d'inscription actif avant le montage de Vue.
const variants = []
if (ssr.CAN_PREVIEW_SITE_MODE) {
  const other = ssr.DEFAULT_SITE_MODE === 'full' ? 'prelaunch' : 'full'
  const otherHtml = await ssr.renderInMode('/', other)
  if (other === 'prelaunch' && /href="[^"]*\/(signup|login)\b/.test(otherHtml)) {
    throw new Error('[prerender] lien d\'inscription ou de connexion actif dans l\'accueil pré-lancement')
  }
  await writeFile(path.join(dist, `index.${other}.html`), template.replace(APP_MARKER, () => appRoot(other, otherHtml)))
  variants.push(`dist/index.${other}.html`)
}

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
  let doc = withSocial(shellBase, {
    title: h.title,
    description: h.description,
    url: h.canonical,
    type: h.jsonLd ? 'article' : 'website',
  })
    .replace(/<title>[\s\S]*?<\/title>/, () => `<title>${esc(h.title)}</title>`)
    .replace(/(<meta\s+name="description"\s+content=")[^"]*(")/, (_, a, b) => `${a}${esc(h.description)}${b}`)
    .replace(APP_MARKER, () => appRoot(ssr.DEFAULT_SITE_MODE, html))
  doc = doc.replace('</head>', () => `    ${headTags}\n  </head>`)
  const target = path.join(dist, page.file)
  await mkdir(path.dirname(target), { recursive: true })
  await writeFile(target, doc)
}

await rm(ssrDir, { recursive: true, force: true })
console.log(`[prerender] dist/index.html (${(appHtml.length / 1024).toFixed(1)} KiB de HTML) · dist/spa.html · ${pages.length} pages d'aide${variants.length ? ` · ${variants.join(' · ')}` : ''}`)
