/**
 * Modèle d'un article du Centre d'aide — CDC Centre d'aide V1 §3 et §16.
 *
 * Un article est un fichier Markdown de `src/content/aide/articles/`, nommé
 * d'après son ID stable. Tout ce qui suit est dérivé de ces fichiers au build :
 * pages publiques, recherche, catalogue lu par l'application, corpus de
 * l'assistant. Aucune seconde rédaction n'existe ailleurs.
 */
import type { ArticleStatus, AuthState, Offer, Platform, Role } from './referentials'

/** Segment de texte en ligne : le rendu n'utilise jamais `v-html`. */
export type Inline =
  | { kind: 'text'; text: string }
  | { kind: 'strong'; text: string }
  | { kind: 'link'; text: string; href: string }

export type Block =
  | { kind: 'paragraph'; inlines: Inline[] }
  | { kind: 'heading'; text: string; anchor: string }
  | { kind: 'steps'; items: Array<{ title: string; body: Inline[] }> }
  | { kind: 'callout'; label: string; tone: 'info' | 'warning' | 'prerequisite' | 'result'; inlines: Inline[] }
  | { kind: 'definition'; term: string; inlines: Inline[] }

export interface HelpCategory {
  slug: string
  name: string
  intro: string
  order: number
}

export interface HelpArticleMeta {
  id: string
  title: string
  slug: string
  category: string
  summary: string
  tags: string[]
  offers: Offer[]
  /** Précision éditoriale sur l'offre, lorsqu'une liste ne suffit pas. */
  offersNote: string | null
  roles: Role[]
  rolesLabel: string
  platforms: Platform[]
  authState: AuthState[]
  screens: string[]
  objectTypes: string[]
  permissions: string
  relatedArticles: string[]
  seoTitle: string
  metaDescription: string
  canonical: string
  indexable: boolean
  lang: string
  synonyms: string[]
  status: ArticleStatus
  /** Écart à clore avant publication en production (§14). */
  blocker: string | null
  /** Anciennes URLs redirigées de façon permanente vers cet article (§13.1). */
  redirectFrom: string[]
}

export interface HelpArticle extends HelpArticleMeta {
  blocks: Block[]
  /** Fichier source, relatif à la racine du dépôt — pour les messages de build. */
  source: string
  /** Date technique de dernière modification (ISO), issue de Git (EDITOR-02). */
  updatedAt: string | null
}

/** Section citable d'un article, pour la recherche et l'assistant (§3, T2). */
export interface HelpSection {
  anchor: string
  heading: string
  text: string
}

export interface BuildIssue {
  source: string
  articleId: string | null
  field: string
  message: string
}
