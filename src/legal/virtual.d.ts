/** Module généré au build par `legalPlugin` (vite.config.ts) depuis `src/content/legal/`. */
declare module 'virtual:legal' {
  /** Les cinq contenus, dans l'ordre des onglets. */
  export const documents: import('./types').LegalDocumentView[]
  /** Versions publiées des CGUV, de la plus récente à la plus ancienne. */
  export const cguvVersions: import('./types').CguvVersionView[]
  /** Code de la version en vigueur (la plus récente), ou null. */
  export const cguvCurrent: string | null
}
