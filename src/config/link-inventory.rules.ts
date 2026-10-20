/**
 * Inventaire des destinations du site public — lot 72 (ticket « liens
 * obsolètes app ↔ vitrine », §3.5). Fonctions PURES : aucune lecture de
 * fichier ici (voir `link-inventory.build.ts`), pour que les tests et le
 * build partagent exactement la même logique.
 *
 * L'inventaire est DÉRIVÉ DU CODE, jamais tenu à la main :
 *   · routes      ← `src/router/route-paths.ts` (table du routeur, dont
 *                   l'égalité avec le routeur instancié est testée) ;
 *   · ancres      ← attributs `id="…"` statiques des sections importées par
 *                   `src/views/HomeView.vue` ;
 *   · pages       ← corpus du Centre d'aide et des Ressources (pages publiées
 *                   en PRODUCTION : un lien de l'application doit marcher
 *                   partout) ;
 *   · anciennes URL ← `src/config/legacy-routes.rules.ts` ;
 *   · liens vers l'application ← appels littéraux `appUrl('…')` du code.
 *
 * Il est commité à la racine (`link-inventory.json`) et copié dans
 * l'application (`src/lib/public-site/link-inventory.json`), dont les tests
 * valident chaque lien vers la vitrine. Synchronisation : README, section
 * « Inventaire des liens ».
 */
export const LINK_INVENTORY_SCHEMA = 'verebona-public-links-v1'

export interface LinkInventory {
  schema: typeof LINK_INVENTORY_SCHEMA
  /** Pages réelles : chemins sans paramètre, et motifs à paramètre du routeur. */
  routes: { static: string[]; dynamic: string[] }
  /** Ancres de l'accueil (`/#<id>`). */
  homeAnchors: string[]
  /** Pages du corpus publiées en production (instances des routes dynamiques). */
  pages: { help: string[]; ressources: string[] }
  /** Anciennes URL redirigées (301) → destination finale. */
  legacyRedirects: Record<string, string>
  /** Pages retirées sans équivalent (404 franche). */
  retired: string[]
  /** Chemins de l'APPLICATION ciblés par la vitrine (`appUrl('…')`). */
  appLinks: string[]
  /** Fichiers de données publiés et lus par l'application (catalogue d'aide, corpus T2). */
  dataFiles: string[]
}

const sortUniq = (v: Iterable<string>) => [...new Set(v)].sort()

/** Partie `<template>` d'un composant monofichier Vue (tout le texte à défaut). */
export function templateOf(sfc: string): string {
  const start = sfc.indexOf('<template>')
  const end = sfc.lastIndexOf('</template>')
  return start === -1 || end === -1 ? sfc : sfc.slice(start, end)
}

/** Identifiants statiques (`id="…"`, jamais `:id`) d'un gabarit. */
export function staticIds(template: string): string[] {
  const out: string[] = []
  for (const m of template.matchAll(/(?<![:\w-])id="([A-Za-z][\w-]*)"/g)) out.push(m[1])
  return out
}

/** Composants `.vue` importés par un composant (chemins relatifs tels qu'écrits). */
export function vueImports(sfc: string): string[] {
  return [...sfc.matchAll(/import\s+\w+\s+from\s+'(\.[^']+\.vue)'/g)].map((m) => m[1])
}

/** Chemins littéraux passés à `appUrl('…')` / `appUrl("…")`. */
export function appUrlLiterals(source: string): string[] {
  return [...source.matchAll(/\bappUrl\(\s*(['"])(\/[^'"]*)\1\s*\)/g)].map((m) => m[2])
}

export function buildLinkInventory(input: {
  staticRoutes: string[]
  dynamicRoutes: string[]
  homeAnchors: string[]
  helpPages: string[]
  ressourcesPages: string[]
  legacyRedirects: Record<string, string>
  retired: readonly string[]
  appLinks: string[]
  dataFiles: string[]
}): LinkInventory {
  return {
    schema: LINK_INVENTORY_SCHEMA,
    routes: { static: sortUniq(input.staticRoutes), dynamic: sortUniq(input.dynamicRoutes) },
    homeAnchors: sortUniq(input.homeAnchors),
    pages: {
      help: sortUniq(input.helpPages.filter((p) => p.startsWith('/aide/'))),
      ressources: sortUniq(input.ressourcesPages.filter((p) => p.startsWith('/ressources/'))),
    },
    legacyRedirects: Object.fromEntries(Object.entries(input.legacyRedirects).sort(([a], [b]) => a.localeCompare(b))),
    retired: sortUniq(input.retired),
    appLinks: sortUniq(input.appLinks),
    dataFiles: sortUniq(input.dataFiles),
  }
}

export type PublicHrefVerdict =
  | { status: 'ok' }
  | { status: 'redirect'; target: string }
  | { status: 'retired' }
  | { status: 'missing-page' }
  | { status: 'missing-anchor'; anchor: string }

/**
 * Verdict sur un lien interne au site (`/chemin?query#ancre`). Même règle
 * que la copie de l'application (`src/lib/public-site/link-inventory.ts`) :
 *   · ancienne URL redirigée → `redirect` (lier la destination finale :
 *     jamais de saut évitable) ;
 *   · page retirée → `retired` ;
 *   · route statique ou page du corpus → `ok`, l'ancre devant exister sur
 *     l'accueil (seule page à sections ancrées) ;
 *   · sinon `missing-page`.
 */
export function checkPublicHref(href: string, inv: LinkInventory): PublicHrefVerdict {
  const hashAt = href.indexOf('#')
  const anchor = hashAt === -1 ? '' : href.slice(hashAt + 1)
  const beforeHash = hashAt === -1 ? href : href.slice(0, hashAt)
  const rawPath = beforeHash.split('?')[0] || '/'
  const path = rawPath.length > 1 ? rawPath.toLowerCase().replace(/\/+$/, '') : rawPath
  // Fichier (extension) : seuls les fichiers de données publiés sont des destinations.
  if (/\/[^/]*\.[a-z0-9]+$/i.test(path)) return inv.dataFiles.includes(path) ? { status: 'ok' } : { status: 'missing-page' }
  if (inv.legacyRedirects[path]) return { status: 'redirect', target: inv.legacyRedirects[path] }
  if (inv.retired.includes(path)) return { status: 'retired' }
  const known = inv.routes.static.includes(path) || inv.pages.help.includes(path) || inv.pages.ressources.includes(path)
  if (!known) return { status: 'missing-page' }
  if (anchor && (path !== '/' || !inv.homeAnchors.includes(anchor))) return { status: 'missing-anchor', anchor }
  return { status: 'ok' }
}

/**
 * Comparaison d'un inventaire commité avec celui dérivé du code. Toute
 * différence de structure (routes, ancres, anciennes URL, liens vers
 * l'application) est une dérive. Pour les pages du corpus, seule une page
 * DISPARUE en est une (un lien pourrait la viser) : publier un article ne
 * rend pas l'inventaire faux, et n'impose pas de le régénérer.
 */
export function inventoryDrift(committed: LinkInventory, current: LinkInventory): string[] {
  const drift: string[] = []
  const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)
  if (committed.schema !== current.schema) drift.push(`schema : ${committed.schema} ≠ ${current.schema}`)
  if (!same(committed.routes, current.routes)) drift.push('routes du routeur modifiées')
  if (!same(committed.homeAnchors, current.homeAnchors)) drift.push('ancres de l’accueil modifiées')
  if (!same(committed.legacyRedirects, current.legacyRedirects)) drift.push('anciennes URL redirigées modifiées')
  if (!same(committed.retired, current.retired)) drift.push('pages retirées modifiées')
  if (!same(committed.appLinks, current.appLinks)) drift.push('liens vers l’application modifiés')
  if (!same(committed.dataFiles, current.dataFiles)) drift.push('fichiers de données modifiés')
  for (const kind of ['help', 'ressources'] as const) {
    const gone = committed.pages[kind].filter((p) => !current.pages[kind].includes(p))
    if (gone.length) drift.push(`pages ${kind} disparues : ${gone.join(', ')}`)
  }
  return drift
}
