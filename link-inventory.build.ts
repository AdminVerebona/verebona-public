/**
 * Inventaire des liens du site public, dérivé du code — lot 72.
 *
 * Lecture des sources (routeur, accueil, corpus, appels `appUrl`) puis
 * `buildLinkInventory` (fonctions pures de `src/config/link-inventory.rules.ts`).
 * Utilisé par `vite.config.ts` (fichier `dist/.site-routes.json` lu par
 * `server.cjs`) et par `tests/l72p-liens-routes.test.ts`, qui compare le
 * résultat à `link-inventory.json` commité.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { dynamicRoutePaths, staticRoutePaths } from './src/router/route-paths'
import { LEGACY_REDIRECTS, RETIRED_PATHS } from './src/config/legacy-routes.rules'
import { appUrlLiterals, buildLinkInventory, staticIds, templateOf, vueImports, type LinkInventory } from './src/config/link-inventory.rules'
import { loadHelpCorpus } from './help.build'
import { categoryPath, publishedArticles } from './src/help/outputs'
import { loadRessourceCorpus } from './ressources.build'
import { visibleArticles } from './src/ressources/outputs'
import { CATALOG_PATH, T2_CORPUS_PATH } from './src/help/config'

export const LINK_INVENTORY_FILE = 'link-inventory.json'
export const HOME_VIEW = 'src/views/HomeView.vue'

/** Fichiers sources (`.ts`, `.vue`) sous `dir`, récursivement. */
export function sourceFiles(root: string, dir = 'src'): string[] {
  const out: string[] = []
  const walk = (d: string) => {
    for (const name of readdirSync(path.join(root, d))) {
      const rel = path.join(d, name)
      if (statSync(path.join(root, rel)).isDirectory()) walk(rel)
      else if (/\.(ts|vue)$/.test(name)) out.push(rel.split(path.sep).join('/'))
    }
  }
  walk(dir)
  return out.sort()
}

/** Ancres de l'accueil : `id` statiques des composants importés par HomeView. */
export function homeAnchors(root: string): string[] {
  const homePath = path.join(root, HOME_VIEW)
  const home = readFileSync(homePath, 'utf8')
  const ids = [...staticIds(templateOf(home))]
  for (const rel of vueImports(home)) {
    ids.push(...staticIds(templateOf(readFileSync(path.resolve(path.dirname(homePath), rel), 'utf8'))))
  }
  return ids
}

export function computeLinkInventory(root: string): LinkInventory {
  const help = loadHelpCorpus(root)
  const helpArticles = publishedArticles(help, 'production')
  const withArticles = new Set(helpArticles.map((a) => a.category))
  const ressources = loadRessourceCorpus(root)
  return buildLinkInventory({
    staticRoutes: staticRoutePaths(),
    dynamicRoutes: dynamicRoutePaths(),
    homeAnchors: homeAnchors(root),
    // Pages publiées en PRODUCTION : ce que l'application peut viser partout.
    helpPages: [
      ...help.categories.filter((c) => withArticles.has(c.slug)).map(categoryPath),
      ...helpArticles.map((a) => a.canonical),
    ],
    ressourcesPages: visibleArticles(ressources, 'production').map((a) => a.path),
    legacyRedirects: LEGACY_REDIRECTS,
    retired: RETIRED_PATHS,
    appLinks: sourceFiles(root).flatMap((f) => appUrlLiterals(readFileSync(path.join(root, f), 'utf8'))),
    // Lus par l'application (« Besoin d'aide », assistant) : servis hors Basic Auth.
    dataFiles: [CATALOG_PATH, T2_CORPUS_PATH],
  })
}

export function serializeInventory(inv: LinkInventory): string {
  return JSON.stringify(inv, null, 2) + '\n'
}
