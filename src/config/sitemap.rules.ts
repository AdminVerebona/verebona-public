/**
 * Règles du sitemap XML du site public — CDC Sitemap §5 à §11.
 *
 * Ce fichier ne contient que des fonctions pures : aucune lecture de
 * `import.meta.env`, aucun état, aucune dépendance à Vue. Même contrat que
 * `site-mode.rules.ts`, et pour la même raison — il est partagé par :
 *   - `vite.config.ts`          (build : émission de sitemap.xml et robots.txt) ;
 *   - `src/config/canonical.ts` (navigateur : balise canonical par route) ;
 *   - les tests unitaires (`tests/sitemap.test.ts`).
 *
 * ══════════════════════════════════════════════════════════════════════════
 * POURQUOI UNE LISTE EXPLICITE PLUTÔT QUE LES ROUTES DU ROUTER
 *
 * `src/router/index.ts` déclare aussi `/contact`, les trois pages légales,
 * la redirection `/inscription` et le catch-all 404. Dériver le sitemap du
 * router les ferait toutes entrer dans l'index : les pages légales sont hors
 * périmètre V1 (§4), `/inscription` est une redirection (§7), et le
 * catch-all n'est pas une page.
 *
 * La liste ci-dessous est donc tenue à la main, volontairement (§8). Son
 * coût de maintenance est documenté dans le README (« Sitemap et
 * indexation »), et `tests/sitemap.test.ts` verrouille son contenu.
 * ══════════════════════════════════════════════════════════════════════════
 */

/**
 * Domaine canonique du site public (CDC §7 « Domaine »).
 *
 * Codé en dur, et non lu dans `import.meta.env` : un build de préproduction
 * mal configuré produirait sinon un sitemap listant des URLs
 * `preprod.verebona.fr`, ce que le §10 interdit explicitement. La valeur ne
 * dépend pas de l'environnement — seule son émission en dépend.
 *
 * ⚠️ Avec `www.`, comme l'exige le CDC. L'hébergement doit servir ce domaine
 * en direct : une redirection `www` -> apex ferait échouer la règle §7
 * « aucune URL du sitemap ne doit rediriger ».
 */
export const SITE_ORIGIN = 'https://www.verebona.fr'

/** URL déclarée dans robots.txt et soumise à Search Console (§5). */
export const SITEMAP_URL = `${SITE_ORIGIN}/sitemap.xml`

/**
 * Pages publiques indexables — périmètre V1 (§3.1 et §13).
 *
 * Les futures sous-pages du centre d'aide (`/aide/<id>`) s'ajoutent ici au
 * moment de leur mise en production, jamais par anticipation (§3.2).
 */
export const INDEXABLE_PATHS = ['/', '/aide'] as const

export type IndexablePath = (typeof INDEXABLE_PATHS)[number]

/**
 * URL absolue et canonique d'un chemin interne.
 *
 * Normalise ce qui, sinon, produirait deux URLs pour une même page :
 *   - la query et le fragment sont retirés (§7 « Paramètres ») ;
 *   - le slash final est retiré, sauf pour la racine que le §6 écrit
 *     `https://www.verebona.fr/`.
 */
export function canonicalUrl(path: string): string {
  const pathname = path.split('#')[0].split('?')[0]
  const absolute = pathname.startsWith('/') ? pathname : `/${pathname}`
  const normalized = absolute.length > 1 ? absolute.replace(/\/+$/, '') : '/'
  return `${SITE_ORIGIN}${normalized}`
}

/** Échappe les cinq caractères réservés de XML (sitemaps.org, §2.2). */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Document sitemap complet, conforme à la structure attendue au §6.
 *
 * Ni `lastmod`, ni `changefreq`, ni `priority` : le §7 les proscrit en V1.
 * Une date de dernière modification ne serait ici qu'inventée — le contenu
 * des pages vit dans le code, pas dans un CMS daté.
 */
export function buildSitemapXml(paths: readonly string[] = INDEXABLE_PATHS): string {
  const entries = paths.map(
    (path) => `  <url>\n    <loc>${escapeXml(canonicalUrl(path))}</loc>\n  </url>`,
  )
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</urlset>',
    '',
  ].join('\n')
}

/**
 * Contenu de robots.txt pour l'environnement servi.
 *
 * La ligne `Sitemap:` n'est ajoutée qu'en production (§9), et une seule fois :
 * le fichier étant produit par cette fonction et par elle seule, la consigne
 * « ne pas la dupliquer » est tenue par construction.
 *
 * Hors production, le fichier reste un `Disallow: /` sans référence au
 * sitemap — annoncer le sitemap de production depuis la préproduction
 * inviterait à explorer un domaine qui n'est pas le sien (§10).
 */
export function buildRobotsTxt(indexable: boolean): string {
  if (!indexable) return 'User-agent: *\nDisallow: /\n'
  return `User-agent: *\nAllow: /\n\nSitemap: ${SITEMAP_URL}\n`
}
