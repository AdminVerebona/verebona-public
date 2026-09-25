/**
 * Ce que chaque build produit à partir du corpus — CDC Centre d'aide V1 §2.
 *
 * « Chaque déploiement produit à partir de cette source : les pages publiques,
 * l'index de recherche, les métadonnées utilisées par les filtres, le corpus
 * consommable par T2 et un catalogue machine-readable des articles. »
 *
 * Toutes ces sorties portent le même `version` (§16.1, dernière règle) : un
 * écart entre le catalogue lu par l'application et les pages servies se voit
 * donc au premier coup d'œil.
 */
import { CATEGORY_PATH_PREFIX, OFFER_LABELS } from './referentials'
import { toSections } from './markdown'
import type { Corpus } from './corpus'
import type { HelpArticle, HelpCategory, HelpSection } from './types'

export type HelpEnvironment = 'production' | 'preprod' | 'development'

/**
 * Articles publiés dans un environnement.
 *
 * Production : seuls les articles `published`. Un article `blocked` décrit un
 * comportement que le produit n'a pas encore (§14) — le publier, ce serait
 * documenter une promesse.
 *
 * Préproduction et local : tous, pour que la recette puisse relire un article
 * bloqué avant la levée de son blocage. La préproduction est `noindex` et hors
 * sitemap (ENV-01) : rien de ce qui y est visible n'atteint un moteur.
 */
export function isPublishedIn(article: HelpArticle, env: HelpEnvironment): boolean {
  return env === 'production' ? article.status === 'published' : true
}

export function publishedArticles(corpus: Corpus, env: HelpEnvironment): HelpArticle[] {
  return corpus.articles.filter((a) => isPublishedIn(a, env))
}

export function categoryPath(c: HelpCategory): string {
  return `${CATEGORY_PATH_PREFIX}${c.slug}`
}

/** Identifiant de version du contenu : empreinte déterministe des sources. */
export function contentVersion(corpus: Corpus, commit: string | null): string {
  const text = JSON.stringify(corpus.categories) + corpus.articles.map((a) => a.source + JSON.stringify(a)).join('')
  let h1 = 0x811c9dc5
  let h2 = 0
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i)
    h1 = Math.imul(h1 ^ c, 16777619) >>> 0
    h2 = (Math.imul(h2, 31) + c) >>> 0
  }
  const hash = h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0')
  return commit ? `${commit.slice(0, 12)}-${hash.slice(0, 8)}` : `contenu-${hash}`
}

// ── Catalogue lu par l'application (§2.1, §13) ────────────────────────────

export interface CatalogEntry {
  id: string
  title: string
  slug: string
  /** Chemin, à résoudre sur l'origine du site de l'environnement lecteur. */
  path: string
  /** URL canonique de production, pour information. */
  canonicalUrl: string
  category: string
  categoryName: string
  status: HelpArticle['status']
  /** Publié DANS CET environnement : seul critère d'affichage d'un raccourci. */
  published: boolean
  offers: HelpArticle['offers']
  updatedAt: string | null
}

export interface HelpCatalog {
  schema: 'verebona-help-catalog-v1'
  version: string
  environment: HelpEnvironment
  generatedAt: string
  articles: CatalogEntry[]
  /** Anciennes URLs → ID canonique (§13.1). */
  redirects: Record<string, string>
}

export function buildCatalog(
  corpus: Corpus, env: HelpEnvironment, version: string, siteOrigin: string, generatedAt: string,
): HelpCatalog {
  const catName = new Map(corpus.categories.map((c) => [c.slug, c.name]))
  return {
    schema: 'verebona-help-catalog-v1',
    version,
    environment: env,
    generatedAt,
    // Tous les articles, publiés ou non : l'application doit pouvoir
    // distinguer « inconnu » de « pas encore publié ici ».
    articles: corpus.articles.map((a) => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      path: a.canonical,
      canonicalUrl: `${siteOrigin}${a.canonical}`,
      category: a.category,
      categoryName: catName.get(a.category) ?? a.category,
      status: a.status,
      published: isPublishedIn(a, env),
      offers: a.offers,
      updatedAt: a.updatedAt,
    })),
    redirects: Object.fromEntries(
      corpus.articles.flatMap((a) => a.redirectFrom.map((r) => [r, a.id] as const)).sort(),
    ),
  }
}

// ── Corpus de l'assistant (§5) ────────────────────────────────────────────

export interface T2Article {
  id: string
  title: string
  path: string
  category: string
  categoryName: string
  summary: string
  offers: HelpArticle['offers']
  offersLabel: string
  offersNote: string | null
  roles: HelpArticle['roles']
  authState: HelpArticle['authState']
  screens: string[]
  objectTypes: string[]
  synonyms: string[]
  sections: HelpSection[]
}

export interface T2Corpus {
  schema: 'verebona-help-t2-v1'
  version: string
  environment: HelpEnvironment
  generatedAt: string
  articles: T2Article[]
}

export function offersLabel(offers: HelpArticle['offers']): string {
  return offers.length === 3 ? 'Toutes les offres' : offers.map((o) => OFFER_LABELS[o]).join(', ')
}

/**
 * Corpus de l'assistant : articles PUBLIÉS dans l'environnement, par sections.
 *
 * ENV-02 : la préproduction de l'assistant lit ce fichier sur le site de
 * préproduction, la production sur celui de production. Chacun ne contient
 * que ce que son environnement publie.
 */
export function buildT2Corpus(corpus: Corpus, env: HelpEnvironment, version: string, generatedAt: string): T2Corpus {
  const catName = new Map(corpus.categories.map((c) => [c.slug, c.name]))
  return {
    schema: 'verebona-help-t2-v1',
    version,
    environment: env,
    generatedAt,
    articles: publishedArticles(corpus, env).map((a) => ({
      id: a.id,
      title: a.title,
      path: a.canonical,
      category: a.category,
      categoryName: catName.get(a.category) ?? a.category,
      summary: a.summary,
      offers: a.offers,
      offersLabel: offersLabel(a.offers),
      offersNote: a.offersNote,
      roles: a.roles,
      authState: a.authState,
      screens: a.screens,
      objectTypes: a.objectTypes,
      synonyms: a.synonyms,
      sections: toSections(a.blocks),
    })),
  }
}

// ── Redirections et sitemap ───────────────────────────────────────────────

/**
 * Anciennes URLs → URL canonique, en un seul saut (§13.1, REDIR-03).
 *
 * En production, une redirection vers un article non publié mènerait à une
 * page introuvable : elle est alors dirigée vers l'accueil du Centre d'aide,
 * la « meilleure destination » du REDIR-01, plutôt que vers un 404.
 */
export function buildRedirects(corpus: Corpus, env: HelpEnvironment): Record<string, string> {
  const out: Record<string, string> = {}
  for (const a of corpus.articles) {
    for (const r of a.redirectFrom) out[r] = isPublishedIn(a, env) ? a.canonical : '/aide'
  }
  return out
}

/** Pages d'aide à déclarer au sitemap de production (SEO-02). */
export function helpSitemapPaths(corpus: Corpus, env: HelpEnvironment): string[] {
  const articles = publishedArticles(corpus, env).filter((a) => a.indexable)
  const withContent = new Set(articles.map((a) => a.category))
  return [
    ...corpus.categories.filter((c) => withContent.has(c.slug)).map(categoryPath),
    ...articles.map((a) => a.canonical),
  ]
}
