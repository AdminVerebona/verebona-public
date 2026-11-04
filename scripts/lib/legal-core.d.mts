/** Déclarations de `legal-core.mjs` pour `vite.config.ts` (TypeScript). */
export const LEGAL_CONTENT_DIR: string
export const CGUV_VERSIONS_DIR: string
export const CGUV_LOCK_FILE: string
export const LEGAL_TEXT_MARKER: string
export const CGUV_MANIFEST_PATH: string
export const CGUV_MANIFEST_SCHEMA: string

export interface LegalDocumentDef { key: string; path: string; tabLabel: string; title: string; source: string | null }
export const LEGAL_DOCUMENTS: readonly LegalDocumentDef[]

export interface LegalSourceVersion {
  code: string
  meta: Record<string, unknown>
  sha256: string | null
  bytes: Uint8Array | null
  text: string
  status: 'publiee' | 'texte-a-fournir' | 'decision-a-fournir' | 'a-figer' | 'archive-absente' | 'texte-absent' | 'invalide'
  locked: boolean
  jsonRel: string
  htmlRel: string
}
export interface LegalSources {
  documents: Array<LegalDocumentDef & { raw: string | null; html: string; pending: boolean; updatedAt: string | null }>
  versions: LegalSourceVersion[]
  lock: { schema: string; versions: Record<string, { sha256: string; meta: Record<string, unknown> }> }
  errors: string[]
  pending: string[]
  warnings: string[]
}
export function loadLegalSources(root: string): LegalSources
export function publishedVersions(sources: LegalSources): LegalSourceVersion[]
export function displayableVersions(sources: LegalSources): LegalSourceVersion[]
export function resolveSiteOrigin(environment: string, raw: string | undefined): string
export function cguvTextPath(code: string): string
export function cguvVersionPath(code: string): string
export function buildCguvManifest(versions: LegalSourceVersion[], siteOrigin: string, generatedAt?: string): Record<string, unknown>
export function serializeManifest(manifest: unknown): string
export function legalViewData(sources: LegalSources, opts?: { includePending?: boolean }): unknown
