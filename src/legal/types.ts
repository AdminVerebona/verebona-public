/** Rubrique « Légal » — types des données produites au build (`virtual:legal`). */

export type LegalDocKey = 'mentions-legales' | 'cguv' | 'confidentialite' | 'sous-traitants' | 'parrainage'

export interface LegalDocumentView {
  key: LegalDocKey
  path: string
  tabLabel: string
  title: string
  /** Contenu lisible (fragment HTML fourni par le PO). Vide pour l'onglet CGUV (voir versions). */
  html: string
  /** Texte encore marqué « à fournir » (jamais publié : le build échoue). */
  pending: boolean
  /** Date de mise à jour facultative (AAAA-MM-JJ), `src/content/legal/documents.json`. */
  updatedAt: string | null
}

export interface CguvVersionView {
  code: string
  origin: 'site' | 'archive-application'
  title: string
  publishedAt: string | null
  effectiveAt: string | null
  requiresReacceptance: boolean | null
  changeSummary: string | null
  sha256: string | null
  pending: boolean
  /** Contenu lisible : intérieur de `<article>` du texte figé. */
  html: string
  permalinkPath: string
  textPath: string
}
