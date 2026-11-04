/**
 * Pages simples du site à pré-rendre au build — chantier 105Q (audit Bing :
 * « H1 manquant » sur /contact, servie jusqu'ici par la coquille SPA vide).
 *
 * Écrites dans `dist/.pages/` (dossier « point », jamais servi tel quel par
 * express.static) et servies par `server.cjs` sous leur URL stable, comme les
 * pages légales. Même en-tête que la navigation interne (`head.rules.ts`).
 *
 * /contact reste HORS du sitemap (liste explicite, `sitemap.rules.ts`) : la page
 * est indexable et canonique, mais le sitemap n'est pas élargi sans décision.
 */
import { canonicalUrl } from './sitemap.rules'
import { headForRoute } from './head.rules'
import { DEFAULT_SITE_MODE } from './site'

export interface SitePage {
  path: string
  /** Fichier écrit dans dist/, relatif. */
  file: string
  head: { title: string; description: string; canonical: string | null; noindex: boolean; jsonLd: null }
}

export const PRERENDERED_SITE_ROUTES = [{ name: 'contact', path: '/contact' }] as const

export function sitePages(): SitePage[] {
  return PRERENDERED_SITE_ROUTES.map(({ name, path }) => {
    const h = headForRoute(name, DEFAULT_SITE_MODE)
    return {
      path,
      file: `.pages${path}.html`,
      head: { title: h.title, description: h.description, canonical: canonicalUrl(path), noindex: false, jsonLd: null },
    }
  })
}
