/**
 * Pages d'aide à pré-rendre au build — SEO-01, SEO-02.
 *
 * Accueil, thèmes et articles PUBLIÉS dans l'environnement du build : une
 * page non publiée n'existe pas en HTML statique, et le serveur répond 404.
 */
import { articles, categories } from 'virtual:help-center'
import { helpArticleHead, helpCategoryHead, helpHomeHead, type HelpHead } from './head'
import { categoryPath } from './outputs'

export interface HelpPage {
  /** Chemin servi. */
  path: string
  /** Fichier écrit dans dist/, relatif. */
  file: string
  head: HelpHead
}

export function helpPages(): HelpPage[] {
  const catBySlug = new Map(categories.map((c) => [c.slug, c]))
  const withArticles = new Set(articles.map((a) => a.category))
  return [
    { path: '/aide', file: 'aide/index.html', head: helpHomeHead() },
    ...categories.filter((c) => withArticles.has(c.slug)).map((c) => ({
      path: categoryPath(c),
      file: `${categoryPath(c).slice(1)}.html`,
      head: helpCategoryHead(c),
    })),
    ...articles.map((a) => ({
      path: a.canonical,
      file: `${a.canonical.slice(1)}.html`,
      head: helpArticleHead(a, catBySlug.get(a.category)),
    })),
  ]
}
