/**
 * Balises Open Graph et Twitter par page — CDC Données structurées §6.
 *
 * Fonctions pures (même contrat que `head.rules.ts`). Partagées par :
 *   - `vite.config.ts`          (accueil : `index.html`) ;
 *   - `scripts/prerender.mjs`   (coquille SPA et pages d'aide) ;
 *   - `src/help/useHelpHead.ts` (navigation interne dans l'aide) ;
 *   - les tests.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * VALEURS CENTRALISÉES, UNE PAGE = SES PROPRES BALISES
 *
 * `index.html` portait en dur l'URL, le titre et la description de l'accueil
 * dans `og:*` et `twitter:*`, et les ~100 pages d'aide en héritaient : un
 * article partagé s'affichait avec le titre de l'accueil. Les valeurs
 * viennent désormais des mêmes constantes que le canonical et le JSON-LD
 * (`SITE_ORIGIN`, `SITE_NAME`), et chaque page reçoit son titre, sa
 * description et son URL.
 * ══════════════════════════════════════════════════════════════════════════
 */
import { escapeHtmlAttr } from './head.rules'
import { SITE_ORIGIN } from './sitemap.rules'
import { SITE_NAME } from './structured-data'

/** Image de partage (1200 × 630), servie depuis `public/assets/`. */
export const OG_IMAGE_URL = `${SITE_ORIGIN}/assets/og-image.png`
export const OG_IMAGE_ALT = 'Verebona — documents et suivi de vos biens'

/** Attribut posé sur chaque balise générée, pour la retrouver et la remplacer. */
export const SOCIAL_ATTR = 'data-social'

export interface SocialHead {
  title: string
  description: string
  /** URL canonique de la page ; `null` : pas d'`og:url` (page non canonique). */
  url: string | null
  type?: 'website' | 'article'
}

export interface SocialTag {
  /** `property` pour Open Graph, `name` pour Twitter. */
  attr: 'property' | 'name'
  key: string
  content: string
}

export function socialTags(h: SocialHead): SocialTag[] {
  const og = (key: string, content: string): SocialTag => ({ attr: 'property', key, content })
  const tw = (key: string, content: string): SocialTag => ({ attr: 'name', key, content })
  return [
    og('og:type', h.type ?? 'website'),
    og('og:site_name', SITE_NAME),
    og('og:locale', 'fr_FR'),
    ...(h.url ? [og('og:url', h.url)] : []),
    og('og:title', h.title),
    og('og:description', h.description),
    og('og:image', OG_IMAGE_URL),
    og('og:image:width', '1200'),
    og('og:image:height', '630'),
    og('og:image:alt', OG_IMAGE_ALT),
    tw('twitter:card', 'summary_large_image'),
    tw('twitter:title', h.title),
    tw('twitter:description', h.description),
    tw('twitter:image', OG_IMAGE_URL),
  ]
}

/** HTML des balises, une par ligne, marquées `data-social`. */
export function socialMetaHtml(h: SocialHead, indent = '    '): string {
  return socialTags(h)
    .map((t) => `<meta ${t.attr}="${t.key}" content="${escapeHtmlAttr(t.content)}" ${SOCIAL_ATTR} />`)
    .join(`\n${indent}`)
}

/** Retire toutes les balises générées d'un document HTML. */
export function stripSocialMeta(html: string): string {
  return html.replace(new RegExp(`\\s*<meta [^>]*\\b${SOCIAL_ATTR}\\b[^>]*>`, 'g'), '')
}
