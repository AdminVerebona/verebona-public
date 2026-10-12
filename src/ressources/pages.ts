/**
 * Pages Ressources à pré-rendre au build — SEO-01, T12 : H1, contenu principal
 * et liens présents dans le HTML initial, sans exécuter le JavaScript.
 */
import { articles, categories } from 'virtual:ressources'
import { RESSOURCES_PREFIX } from './corpus'
import { ressourceArticleHead, ressourcesIndexHead, type RessourceHead } from './head'

export interface RessourcePage {
  path: string
  /** Fichier écrit dans dist/, relatif. */
  file: string
  head: RessourceHead
}

export function ressourcePages(): RessourcePage[] {
  if (articles.length === 0) return []
  const cat = new Map(categories.map((c) => [c.slug, c]))
  return [
    { path: RESSOURCES_PREFIX, file: 'ressources/index.html', head: ressourcesIndexHead() },
    ...articles.map((a) => ({ path: a.path, file: `${a.path.slice(1)}.html`, head: ressourceArticleHead(a, cat.get(a.category)) })),
  ]
}
