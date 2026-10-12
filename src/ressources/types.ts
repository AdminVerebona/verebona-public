/**
 * Modèle éditorial de la rubrique « Ressources » — CDC Ressources V6 §10.
 *
 * Un article est un fichier Markdown de `src/content/ressources/articles/`,
 * nommé d'après son identifiant immuable (A01, G01…). Tout le reste est dérivé
 * de ces fichiers au build : index, pages pré-rendues, sitemap, redirections,
 * réponses 410. Aucune seconde rédaction n'existe ailleurs (§10 : « magasin de
 * contenus versionné intégré au code »).
 *
 * Le rendu n'utilise jamais `v-html` : le texte est découpé en blocs typés,
 * rendus par des composants Vue (ADM-09, SEC-03).
 */
import type { Inline } from '../help/types'

export type { Inline }

/** Workflow éditorial (§11) : brouillon → en relecture → approuvé → publié → archivé. */
export const RESSOURCE_STATUSES = ['draft', 'review', 'approved', 'published', 'archived'] as const
export type RessourceStatus = (typeof RESSOURCE_STATUSES)[number]

export const STATUS_LABELS: Record<RessourceStatus, string> = {
  draft: 'Brouillon',
  review: 'En relecture',
  approved: 'Approuvé',
  published: 'Publié',
  archived: 'Archivé',
}

/** Bloc de contenu. Aucun HTML : texte, gras et liens seulement. */
export type RessourceBlock =
  | { kind: 'paragraph'; inlines: Inline[] }
  | { kind: 'list'; items: Inline[][] }
  | { kind: 'table'; head: string[]; rows: string[][] }

export interface RessourceSection {
  heading: string
  /** Identifiant stable de la section (sommaire, UX-03). */
  anchor: string
  blocks: RessourceBlock[]
}

export interface RessourceFaq {
  question: string
  answer: RessourceBlock[]
}

export interface RessourceSource {
  title: string
  url: string
  /** Domaine affiché à côté du lien (UX-05). */
  domain: string
}

export interface RessourceCategory {
  slug: string
  name: string
  intro: string
  order: number
}

/**
 * Archivage (ADM-07) : `410` (aucune alternative) ou `301:<ID>` (redirection
 * permanente vers un article publié qui reprend l'intention).
 */
export type ArchiveDecision = { kind: 'gone' } | { kind: 'redirect'; to: string }

export interface RessourceArticle {
  /** Identifiant immuable (A01, G01…), jamais réutilisé. */
  id: string
  slug: string
  /** Chemin servi : `/ressources/<slug>`. */
  path: string
  category: string
  status: RessourceStatus
  /** Priorité éditoriale qualitative (P1/P2), sans volume SEO inventé (§6). */
  priority: string
  h1: string
  seoTitle: string
  metaDescription: string
  /** Intention principale, propriétaire (§5, SEO-10). */
  intent: string
  /** Frontière anti-doublon décidée avec les pages voisines (§5). */
  boundary: string
  /** Réponse immédiate (ED-01) : blocs avant le premier intertitre. */
  intro: RessourceBlock[]
  sections: RessourceSection[]
  checklist: Inline[][]
  /** Cas pratique, toujours présenté comme illustratif (ED-04). */
  example: RessourceBlock[]
  faq: RessourceFaq[]
  /** Transition vers Verebona (§14), une seule par page. */
  cta: RessourceBlock[]
  sources: RessourceSource[]
  /** Articles liés (2 ou 3, §7). */
  related: string[]
  /** Date de vérification de fond (AAAA-MM-JJ). */
  reviewedAt: string | null
  /** Date de première publication, préservée (AAAA-MM-JJ). */
  publishedAt: string | null
  /** Dernière mise à jour significative (AAAA-MM-JJ), distincte de la publication. */
  updatedAt: string | null
  /** Rôle ou personne réelle responsable (§10 : pas de fausse signature d'expert). */
  reviewOwner: string
  revision: number
  revisionNote: string
  /** Anciennes URLs redirigées en 301 vers cette page (NAV-03, SEO-05). */
  redirectFrom: string[]
  archive: ArchiveDecision | null
  /** Fichier source, relatif à la racine du dépôt — messages de build. */
  source: string
}

export interface RessourceIssue {
  source: string
  articleId: string | null
  field: string
  message: string
}
