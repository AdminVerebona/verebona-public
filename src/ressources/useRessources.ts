/**
 * Données Ressources côté navigateur (et pré-rendu).
 *
 * Tout vient de `virtual:ressources`, généré au build depuis le corpus : les
 * pages n'ont aucune autre source. Importé par les seules vues Ressources,
 * chargées à la demande — le reste du site ne télécharge pas les articles.
 */
import { articles, categories, environment, routes } from 'virtual:ressources'
import type { RessourceArticle, RessourceCategory } from './types'

const bySlug = new Map(articles.map((a) => [a.slug, a]))
const byId = new Map(articles.map((a) => [a.id, a]))
const catBySlug = new Map(categories.map((c) => [c.slug, c]))
const gone = new Set(routes.gone)

export function useRessources() {
  return {
    environment,
    /** Catégories qui ont au moins un article visible : jamais de catégorie vide (§8). */
    categories: categories.filter((c) => articles.some((a) => a.category === c.slug)),
    articlesOf: (slug: string): RessourceArticle[] => articles.filter((a) => a.category === slug),
    article: (slug: string): RessourceArticle | null => bySlug.get(slug) ?? null,
    category: (slug: string): RessourceCategory | null => catBySlug.get(slug) ?? null,
    /** Articles liés VISIBLES (un lié non publié n'apparaît jamais). */
    related: (a: RessourceArticle): RessourceArticle[] =>
      a.related.map((id) => byId.get(id)).filter((x): x is RessourceArticle => Boolean(x)),
    redirectFor: (path: string): string | null => routes.redirects[path] ?? null,
    isGone: (path: string): boolean => gone.has(path),
    count: articles.length,
  }
}
