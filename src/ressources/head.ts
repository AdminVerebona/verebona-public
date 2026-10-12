/**
 * En-têtes des pages Ressources — CDC Ressources V6 §12, SEO-02, SEO-06.
 *
 * Fonctions pures, partagées par le navigateur et le pré-rendu : le HTML servi
 * aux moteurs et la navigation interne portent exactement les mêmes valeurs.
 * Même forme que l'en-tête du Centre d'aide (`HelpHead`), appliqué par le même
 * code (`applyHelpHead`).
 *
 * JSON-LD : `Article` et `BreadcrumbList`, avec des propriétés VRAIES
 * seulement (§12) — dates du fichier, auteur et éditeur = l'organisation
 * Verebona (pas de fausse signature d'expert), aucune image tant qu'il n'y en
 * a pas. Pas de `FAQPage` : les FAQ restent en HTML (§12).
 */
import type { HelpHead } from '../help/head'
import { SITE_ORIGIN, canonicalUrl } from '../config/sitemap.rules'
import { ORGANIZATION_ID, SITE_NAME } from '../config/structured-data'
import { RESSOURCES_PREFIX } from './corpus'
import type { RessourceArticle, RessourceCategory } from './types'

export type RessourceHead = HelpHead

export const RESSOURCES_TITLE = 'Ressources pratiques : factures, garanties, échéances et assurances | Verebona'
export const RESSOURCES_DESCRIPTION =
  'Guides pratiques pour retrouver une facture, vérifier une garantie, suivre les échéances d’une voiture ou d’un logement et préparer un dossier d’assurance.'
export const RESSOURCES_H1 = 'Ressources'
export const RESSOURCES_PROMISE = 'Être prêt avant d’en avoir besoin.'

const breadcrumb = (items: Array<{ name: string; url: string }>) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
})

export function ressourcesIndexHead(): RessourceHead {
  const url = canonicalUrl(RESSOURCES_PREFIX)
  return {
    title: RESSOURCES_TITLE,
    description: RESSOURCES_DESCRIPTION,
    canonical: url,
    noindex: false,
    jsonLd: {
      '@context': 'https://schema.org',
      ...breadcrumb([{ name: 'Accueil', url: canonicalUrl('/') }, { name: RESSOURCES_H1, url }]),
    },
  }
}

/**
 * Article. `noindex` pour une prévisualisation (statut autre que publié,
 * préproduction seulement — SEC-04) : la préproduction est de toute façon
 * `noindex, nofollow` et protégée.
 */
export function ressourceArticleHead(a: RessourceArticle, c: RessourceCategory | undefined): RessourceHead {
  const url = canonicalUrl(a.path)
  const published = a.status === 'published'
  const organization = { '@type': 'Organization', '@id': ORGANIZATION_ID, name: SITE_NAME, url: `${SITE_ORIGIN}/` }
  return {
    title: a.seoTitle,
    description: a.metaDescription,
    canonical: url,
    noindex: !published,
    jsonLd: published
      ? {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Article',
              '@id': `${url}#article`,
              headline: a.h1,
              description: a.metaDescription,
              inLanguage: 'fr-FR',
              mainEntityOfPage: url,
              ...(a.publishedAt ? { datePublished: a.publishedAt } : {}),
              ...((a.updatedAt ?? a.publishedAt) ? { dateModified: a.updatedAt ?? a.publishedAt } : {}),
              ...(c ? { articleSection: c.name } : {}),
              author: organization,
              publisher: { '@id': ORGANIZATION_ID },
            },
            breadcrumb([
              { name: 'Accueil', url: canonicalUrl('/') },
              { name: RESSOURCES_H1, url: canonicalUrl(RESSOURCES_PREFIX) },
              { name: a.h1, url },
            ]),
          ],
        }
      : null,
  }
}

/** Adresse inconnue : état technique, non indexé (NFR-05). */
export function ressourceNotFoundHead(gone: boolean): RessourceHead {
  return {
    title: gone ? 'Ressource retirée | Verebona' : 'Ressource introuvable | Verebona',
    description: RESSOURCES_DESCRIPTION,
    canonical: null,
    noindex: true,
    jsonLd: null,
  }
}
