/**
 * En-têtes des pages du Centre d'aide — SEO-01, SEO-03.
 *
 * Fonctions pures, partagées par le navigateur (`useHelpHead`) et le
 * pré-rendu (`scripts/prerender.mjs`) : le HTML servi aux moteurs et celui
 * que produit la navigation interne portent exactement les mêmes valeurs.
 */
import { canonicalUrl } from '../config/sitemap.rules'
import { ORGANIZATION_ID } from '../config/structured-data'
import { categoryPath } from './outputs'
import type { HelpArticle, HelpCategory } from './types'

export interface HelpHead {
  title: string
  description: string
  /** `null` : aucune URL canonique (page introuvable, résultats de recherche). */
  canonical: string | null
  /** Page à exclure de l'index (SEO-03 : recherche interne, états techniques). */
  noindex: boolean
  jsonLd: Record<string, unknown> | null
}

export const HELP_HOME_TITLE = 'Centre d’aide | Verebona'
export const HELP_HOME_DESCRIPTION =
  'Retrouvez les réponses pour utiliser Verebona, gérer vos biens, vos documents, vos échéances et votre compte.'

export function helpHomeHead(): HelpHead {
  return {
    title: HELP_HOME_TITLE,
    description: HELP_HOME_DESCRIPTION,
    canonical: canonicalUrl('/aide'),
    noindex: false,
    jsonLd: null,
  }
}

/** Résultats de recherche interne : jamais indexés (SEO-03). */
export function helpSearchHead(query: string): HelpHead {
  return {
    title: `Résultats pour « ${query} » | Centre d’aide Verebona`,
    description: HELP_HOME_DESCRIPTION,
    canonical: null,
    noindex: true,
    jsonLd: null,
  }
}

export function helpCategoryHead(c: HelpCategory): HelpHead {
  return {
    title: `${c.name} | Aide Verebona`,
    description: c.intro,
    canonical: canonicalUrl(categoryPath(c)),
    noindex: false,
    jsonLd: null,
  }
}

/** Article introuvable : état technique, non indexé (REDIR-02, SEO-03). */
export function helpNotFoundHead(): HelpHead {
  return {
    title: 'Article introuvable | Centre d’aide Verebona',
    description: HELP_HOME_DESCRIPTION,
    canonical: null,
    noindex: true,
    jsonLd: null,
  }
}

/**
 * Article — SEO-01 : title, meta description, canonical et TechArticle.
 *
 * `noindex` suit `indexable` de l'article. En préproduction, la meta robots
 * globale (`noindex, nofollow`, voir vite.config.ts) s'ajoute de toute façon.
 */
export function helpArticleHead(a: HelpArticle, c: HelpCategory | undefined): HelpHead {
  const url = canonicalUrl(a.canonical)
  return {
    title: a.seoTitle,
    description: a.metaDescription,
    canonical: url,
    noindex: !a.indexable,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      '@id': `${url}#article`,
      headline: a.title,
      description: a.metaDescription,
      url,
      inLanguage: a.lang,
      ...(a.updatedAt ? { dateModified: a.updatedAt } : {}),
      ...(c ? { articleSection: c.name } : {}),
      keywords: a.synonyms.join(', '),
      isPartOf: { '@type': 'WebPage', '@id': `${canonicalUrl('/aide')}#centre-aide`, name: 'Centre d’aide Verebona' },
      publisher: { '@id': ORGANIZATION_ID },
    },
  }
}
