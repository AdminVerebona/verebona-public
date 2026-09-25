/**
 * Données du Centre d'aide côté navigateur (et pré-rendu).
 *
 * Tout vient de `virtual:help-center`, généré au build depuis le corpus : les
 * pages n'ont aucune autre source d'articles. Ce module est importé par les
 * seules vues d'aide, chargées à la demande — le reste du site ne télécharge
 * pas le corpus.
 */
import {
  articles, categories, environment, redirects, version,
} from 'virtual:help-center'
import { FREQUENT_ARTICLE_IDS } from './config'
import { toSections } from './markdown'
import { categoryPath, offersLabel } from './outputs'
import { buildSearchIndex, type SearchIndex } from './search'
import type { HelpArticle, HelpCategory } from './types'

const byId = new Map(articles.map((a) => [a.id, a]))
const bySlug = new Map(articles.map((a) => [a.slug, a]))
const catBySlug = new Map(categories.map((c) => [c.slug, c]))

let index: SearchIndex | null = null

export function useHelpCenter() {
  const articlesOf = (slug: string): HelpArticle[] => articles.filter((a) => a.category === slug)

  return {
    environment,
    version,
    /** Thèmes qui ont au moins un article publié ici. */
    categories: categories.filter((c) => articles.some((a) => a.category === c.slug)),
    articlesOf,
    article: (slug: string) => bySlug.get(slug) ?? null,
    articleById: (id: string) => byId.get(id) ?? null,
    category: (slug: string): HelpCategory | null => catBySlug.get(slug) ?? null,
    categoryPath,
    /** Destination d'une ancienne URL (§13.1), s'il y en a une. */
    redirectFor: (path: string): string | null => redirects[path] ?? null,
    frequent: FREQUENT_ARTICLE_IDS.map((id) => byId.get(id)).filter((a): a is HelpArticle => Boolean(a)),
    related: (a: HelpArticle) =>
      a.relatedArticles.map((id) => byId.get(id)).filter((x): x is HelpArticle => Boolean(x)),
    offersLabel,
    /** Offre restreinte : à signaler au lecteur (SEARCH-05, T2-07). */
    isRestricted: (a: HelpArticle) => a.offers.length < 3,
    searchIndex(): SearchIndex {
      index ??= buildSearchIndex(articles.map((a) => ({
        id: a.id,
        title: a.title,
        path: a.canonical,
        category: a.category,
        categoryName: catBySlug.get(a.category)?.name ?? a.category,
        summary: a.summary,
        offersLabel: offersLabel(a.offers),
        restricted: a.offers.length < 3,
        synonyms: a.synonyms,
        tags: a.tags,
        headings: a.blocks.flatMap((b) => (b.kind === 'heading' ? [b.text] : b.kind === 'steps' ? b.items.map((s) => s.title) : [])),
        sections: toSections(a.blocks),
      })))
      return index
    },
  }
}
