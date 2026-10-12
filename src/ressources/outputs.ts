/**
 * Sorties dérivées du corpus Ressources — CDC Ressources V6 §8, §11, §12.
 *
 * Fonctions pures : visibilité par environnement, redirections 301, réponses
 * 410, sitemap, registre des URLs. Le build (vite.config.ts), le pré-rendu et
 * le serveur lisent tous ces mêmes résultats : une page publiée est donc à la
 * fois pré-rendue, listée dans l'index et dans le sitemap, ou ne l'est nulle
 * part (ADM-06).
 */
import type { HelpEnvironment } from '../help/outputs'
import { RESSOURCES_PREFIX, type RessourceCorpus } from './corpus'
import type { RessourceArticle } from './types'

export type RessourceEnvironment = HelpEnvironment

/**
 * Article visible dans un environnement.
 *
 * Production : `published` seulement. Préproduction et local (protégés et
 * `noindex`) : aussi `review` et `approved`, prévisualisés avec un bandeau de
 * statut — la « preview de la version exacte » (ADM-02, SEC-04). Un brouillon
 * ou un article archivé n'est jamais rendu.
 */
export function isVisibleIn(a: RessourceArticle, env: RessourceEnvironment): boolean {
  if (a.status === 'published') return true
  if (env === 'production') return false
  return a.status === 'review' || a.status === 'approved'
}

export function visibleArticles(c: RessourceCorpus, env: RessourceEnvironment): RessourceArticle[] {
  return c.articles.filter((a) => isVisibleIn(a, env))
}

export interface RessourceRoutes {
  /** Ancienne URL → URL de destination (une seule 301, jamais de chaîne). */
  redirects: Record<string, string>
  /** URLs retirées sans alternative : réponse 410 (ADM-07, NFR-05). */
  gone: string[]
}

export function buildRessourceRoutes(c: RessourceCorpus, env: RessourceEnvironment): RessourceRoutes {
  const visible = new Map(visibleArticles(c, env).map((a) => [a.id, a]))
  const redirects: Record<string, string> = {}
  const gone: string[] = []
  for (const a of visible.values()) for (const r of a.redirectFrom) redirects[r] = a.path
  for (const a of c.articles) {
    if (a.status !== 'archived' || !a.archive) continue
    if (a.archive.kind === 'gone') { gone.push(a.path, ...a.redirectFrom); continue }
    const target = visible.get(a.archive.to)
    if (target) for (const p of [a.path, ...a.redirectFrom]) redirects[p] = target.path
    else gone.push(a.path, ...a.redirectFrom)
  }
  return { redirects, gone: [...new Set(gone)].sort() }
}

/** Chemins du sitemap : l'index et les articles publiés (SEO-03). Production seulement. */
export function ressourcesSitemapPaths(c: RessourceCorpus): string[] {
  const published = c.articles.filter((a) => a.status === 'published')
  return published.length ? [RESSOURCES_PREFIX, ...published.map((a) => a.path)] : []
}

export type RessourceSlugRegistry = Record<string, string[]>

/**
 * Registre des URLs publiées — NAV-03, SEO-05, ADM-07, T09, T10.
 *
 * Une URL de Ressources, une fois enregistrée, mène toujours quelque part :
 * l'article publié lui-même, une 301 (`redirectFrom` ou archivage 301), ou un
 * 410 décidé (archivage 410). Toute URL publiée est enregistrée.
 */
export function checkRessourceRegistry(c: RessourceCorpus, registry: RessourceSlugRegistry): string[] {
  const errors: string[] = []
  const routes = buildRessourceRoutes(c, 'production')
  const live = new Set(c.articles.filter((a) => a.status === 'published').map((a) => a.path))
  const gone = new Set(routes.gone)
  for (const [id, paths] of Object.entries(registry)) {
    for (const p of paths) {
      if (live.has(p) || routes.redirects[p] || gone.has(p)) continue
      errors.push(`${id} : l’URL publiée ${p} ne mène plus à rien — ajouter « redirectFrom » ou archiver avec 410 / 301.`)
    }
  }
  for (const a of c.articles.filter((x) => x.status === 'published')) {
    const known = new Set(registry[a.id] ?? [])
    for (const p of [a.path, ...a.redirectFrom]) {
      if (!known.has(p)) errors.push(`${a.id} : ${p} absent de slug-registry.json — l’enregistrer sans retirer les anciennes URLs.`)
    }
  }
  return errors
}

/** Articles dont la revue des sources date de plus de `days` jours (ADM-10). */
export function articlesToReview(c: RessourceCorpus, today: string, days = 365): RessourceArticle[] {
  const limit = new Date(`${today}T00:00:00Z`).getTime() - days * 86_400_000
  return c.articles.filter((a) => a.status === 'published' && (!a.reviewedAt || new Date(`${a.reviewedAt}T00:00:00Z`).getTime() < limit))
}
