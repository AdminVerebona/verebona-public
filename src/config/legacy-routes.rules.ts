/**
 * Anciennes URL du site public — lot 72 (ticket « liens obsolètes app ↔
 * vitrine », §3.3). Module pur, lu au build (`dist/.site-routes.json` pour
 * `server.cjs`) et par l'inventaire des liens.
 *
 * Règles du ticket :
 *   · équivalent fonctionnel pertinent → UNE redirection 301 vers la
 *     destination finale (jamais de chaîne) ;
 *   · aucun équivalent → vraie 404 (jamais une redirection systématique
 *     vers l'accueil) ;
 *   · le contenu supprimé n'est pas recréé.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * UN FRAGMENT DANS L'EN-TÊTE `Location`
 *
 * `/comment-ca-marche` → `/#how` : le fragment est porté par l'en-tête
 * `Location` lui-même. C'est conforme (RFC 9110 §10.2.2 : la valeur est une
 * URI-reference, fragment compris) et suivi par tous les navigateurs
 * actuels (Chrome, Firefox, Safari, Edge) : ils chargent `/` puis défilent
 * jusqu'à `id="how"`. Si l'URL demandée portait déjà un fragment, celui de
 * `Location` l'emporte (même RFC). Les robots ignorent le fragment : pour
 * eux, la page déplacée est l'accueil — c'est exact, la section y vit.
 * La query éventuelle (`?utm_…`) est conservée AVANT le fragment.
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Usage réel des deux URL connues (ticket §3.3) : aucune route ni aucun
 * lien ne les déclarait dans l'historique de ce dépôt (depuis sa base du
 * 25/09/2026). Elles n'étaient liées QUE par le pied de page de
 * l'application (pages d'inscription et de vérification d'e-mail). Leur
 * indexation éventuelle n'est vérifiable que dans Search Console (point
 * ouvert du rapport) ; elles n'ont jamais figuré au sitemap.
 */

/** Ancienne URL → destination finale (chemin interne, fragment éventuel). */
export const LEGACY_REDIRECTS: Readonly<Record<string, string>> = {
  // Section « Comment ça marche » intégrée à l'accueil (HowItWorksSection, id="how").
  '/comment-ca-marche': '/#how',
}

/**
 * Pages retirées SANS équivalent : 404 franche. Listées pour que l'inventaire
 * distingue un retrait intentionnel d'un lien cassé (un lien vers l'une
 * d'elles est refusé par les contrôles des deux dépôts).
 */
export const RETIRED_PATHS: readonly string[] = [
  // « Pourquoi Verebona ? » : aucune section équivalente ; décision du ticket :
  // ne pas recréer la page, ne pas rediriger vers l'accueil.
  '/pourquoi-verebona',
]

/** Chemin normalisé pour la comparaison : minuscules, sans slash final. */
export function normalizeSitePath(p: string): string {
  const lower = p.toLowerCase()
  return lower.length > 1 ? lower.replace(/\/+$/, '') || '/' : lower
}

/**
 * URL de redirection d'une ancienne adresse, query conservée avant le
 * fragment : `/comment-ca-marche?utm=x` → `/?utm=x#how`.
 */
export function legacyRedirectLocation(target: string, query: string): string {
  const hashAt = target.indexOf('#')
  const base = hashAt === -1 ? target : target.slice(0, hashAt)
  const hash = hashAt === -1 ? '' : target.slice(hashAt)
  return `${base}${query}${hash}`
}
