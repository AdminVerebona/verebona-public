/**
 * Données structurées JSON-LD du site public — CDC Données structurées §4 à §6.
 *
 * Fonctions pures, même contrat que `site-mode.rules.ts` et `sitemap.rules.ts` :
 * aucune lecture de `import.meta.env`, aucun état, aucune dépendance à Vue.
 * Partagé par `vite.config.ts` (injection au build) et les tests.
 *
 * Le domaine et l'URL de l'accueil viennent de `sitemap.rules.ts` : le §6
 * demande que les valeurs soient centralisées pour éviter une divergence
 * entre canonical, Open Graph et JSON-LD. Une seule constante porte donc le
 * domaine pour le sitemap, le canonical et le balisage.
 */
import { SITE_ORIGIN, canonicalUrl } from './sitemap.rules'

/* ── Identité ──────────────────────────────────────────────────────────── */

/** Nom de marque et nom de site préféré (§4). Doit rester identique au `og:site_name`. */
export const SITE_NAME = 'Verebona'

/** URL canonique de l'accueil — la même que celle déclarée au sitemap. */
export const HOME_URL = canonicalUrl('/')

/** Identifiants stables du graphe (§4). Ne jamais les modifier : ils sont référencés. */
export const ORGANIZATION_ID = `${SITE_ORIGIN}/#organization`
export const WEBSITE_ID = `${SITE_ORIGIN}/#website`

/**
 * Logo officiel — `public/assets/app-icon.png`, 180 x 180 (§4, AC-04).
 *
 * C'est la seule marque déposée comme fichier dans ce dépôt, et c'est la
 * déclinaison exacte du sigle rendu en SVG inline dans `AppHeader.vue` :
 * l'identité visuelle déclarée à Google est donc celle réellement affichée.
 * Servie en HTTPS depuis `public/`, sans authentification, et au-delà du
 * minimum de 112 x 112 exigé.
 */
export const ORGANIZATION_LOGO_PATH = '/assets/app-icon.png'

/**
 * Description de l'organisation — formulation du §4, reprise telle quelle.
 *
 * Volontairement courte : le §10 classe en risque haut le fait de
 * transformer `Organization` en catalogue de fonctionnalités. Le référentiel
 * fonctionnel du §3 sert à l'équipe éditoriale, pas à cette propriété.
 *
 * Elle décrit ce que fait le service, sans affirmer la disponibilité d'une
 * fonction précise — contrainte du §3 et du §10, d'autant que la production
 * tourne aujourd'hui en mode PRELAUNCH.
 */
export const ORGANIZATION_DESCRIPTION =
  'Verebona est un service de gestion de biens qui centralise leurs informations et ' +
  'documents, organise leur suivi et leurs échéances, et facilite la constitution de ' +
  'dossiers, les exports et la transmission.'

/**
 * Profils officiels publics (§4, propriété `sameAs`).
 *
 * Vide à dessein : le site ne publie aujourd'hui aucun lien vers un profil
 * social, ni dans le footer ni ailleurs. Le CDC interdit de déclarer un
 * profil non officiel ou non vérifié, et une liste vide n'est pas émise du
 * tout — mieux vaut l'absence de signal qu'un signal faux.
 *
 * Pour en ajouter : renseigner ici les URLs des profils réellement détenus
 * par Verebona, après vérification. Le reste du balisage suit.
 */
export const SAME_AS: readonly string[] = []

/* ── Construction du graphe ────────────────────────────────────────────── */

export interface StructuredDataGraph {
  '@context': string
  '@graph': Record<string, unknown>[]
}

/**
 * Graphe unique regroupant `Organization` et `WebSite`, reliés par leurs
 * `@id` (§5). Un seul objet de chaque type, comme l'exige la recette §8.1.
 */
export function buildStructuredData(): StructuredDataGraph {
  const organization: Record<string, unknown> = {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: SITE_NAME,
    url: HOME_URL,
    logo: `${SITE_ORIGIN}${ORGANIZATION_LOGO_PATH}`,
    description: ORGANIZATION_DESCRIPTION,
  }

  // Propriété omise plutôt que vide : `"sameAs": []` est un signal inutile.
  if (SAME_AS.length > 0) organization.sameAs = [...SAME_AS]

  return {
    '@context': 'https://schema.org',
    '@graph': [
      organization,
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        url: HOME_URL,
        name: SITE_NAME,
        publisher: { '@id': ORGANIZATION_ID },
      },
    ],
  }
}

/**
 * Contenu sérialisé du `<script type="application/ld+json">`.
 *
 * `<` est échappé en `\u003c` : sans cela, une valeur contenant `</script>`
 * fermerait la balise et injecterait du HTML dans la page. Aucune valeur
 * actuelle n'en contient, mais la protection ne coûte rien et survit aux
 * modifications futures du texte.
 */
export function buildJsonLd(): string {
  return JSON.stringify(buildStructuredData()).replace(/</g, '\\u003c')
}

/**
 * Balisage à injecter, ou `null` s'il ne doit pas l'être.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * RIEN HORS PRODUCTION — §6 et AC-08
 *
 * Le balisage désigne le site officiel par des URLs de production. Le servir
 * depuis la préproduction reviendrait à faire décrire `www.verebona.fr` par
 * un environnement qui n'est pas lui. Même règle que pour le sitemap : c'est
 * l'émission qui dépend de l'environnement, jamais le contenu.
 * ══════════════════════════════════════════════════════════════════════════
 */
export function structuredDataScript(indexable: boolean): string | null {
  return indexable ? buildJsonLd() : null
}
