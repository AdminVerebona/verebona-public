/**
 * Chemins des routes du site public — SOURCE UNIQUE (lot 72, ticket
 * « liens obsolètes app ↔ vitrine »).
 *
 * Module pur (aucun import Vue) : il est lu par
 *   - `src/router/index.ts`         (déclaration des routes) ;
 *   - `vite.config.ts`              (build : `dist/.site-routes.json`, que
 *                                    `server.cjs` consulte pour ne servir la
 *                                    coquille SPA en 200 qu'aux routes réelles) ;
 *   - `src/config/link-inventory.rules.ts` (inventaire des liens, consommé
 *                                    par l'application).
 *
 * `tests/l72p-liens-routes.test.ts` vérifie que le routeur instancié déclare
 * exactement ces chemins : ajouter une route sans passer par cette table
 * fait échouer les tests.
 */
export const ROUTE_PATHS = {
  home: '/',
  help: '/aide',
  'help-category': '/aide/theme/:category',
  'help-article': '/aide/:slug',
  ressources: '/ressources',
  'ressources-article': '/ressources/:slug',
  contact: '/contact',
  'legal-mentions': '/mentions-legales',
  'legal-cgu': '/cgu',
  'legal-confid': '/confidentialite',
  'signup-redirect': '/inscription',
  'not-found': '/:pathMatch(.*)*',
} as const

export type RouteName = keyof typeof ROUTE_PATHS

/** Route attrape-tout (page 404 du routeur) : jamais une destination. */
export const CATCH_ALL_ROUTE: RouteName = 'not-found'

/** Chemins sans paramètre : pages réelles servies par la coquille SPA ou pré-rendues. */
export function staticRoutePaths(): string[] {
  return Object.entries(ROUTE_PATHS)
    .filter(([name, p]) => name !== CATCH_ALL_ROUTE && !p.includes(':'))
    .map(([, p]) => p)
}

/** Motifs à paramètre (`/aide/:slug`…) : pages du corpus, servies par leur HTML pré-rendu. */
export function dynamicRoutePaths(): string[] {
  return Object.entries(ROUTE_PATHS)
    .filter(([name, p]) => name !== CATCH_ALL_ROUTE && p.includes(':'))
    .map(([, p]) => p)
}
