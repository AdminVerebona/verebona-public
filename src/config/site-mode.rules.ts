/**
 * Règles de résolution du mode d'affichage du site — CDC pré-lancement §4 à §5.
 *
 * Ce fichier ne contient que des fonctions pures : aucune lecture de
 * `import.meta.env`, aucun état, aucune dépendance à Vue. Il est partagé par :
 *   - `src/config/site.ts`  (exécution dans le navigateur) ;
 *   - `vite.config.ts`      (build : noindex, robots.txt, marqueur serveur) ;
 *   - les tests unitaires.
 *
 * Les composants ne l'importent pas directement : ils passent par
 * `src/config/site.ts`, seul point d'entrée applicatif.
 */

/* ── Modes d'affichage ─────────────────────────────────────────────────── */

/** Modes autorisés (CDC §10). Toute autre valeur est rejetée. */
export const SITE_MODES = ['full', 'prelaunch'] as const
export type SiteMode = (typeof SITE_MODES)[number]

/* ── Environnements de déploiement ─────────────────────────────────────── */

/**
 * `development` correspond au serveur local (`npm run dev`). Il suit les
 * mêmes règles que la préproduction pour permettre la prévisualisation.
 */
export const SITE_ENVIRONMENTS = ['development', 'preprod', 'production'] as const
export type SiteEnvironment = (typeof SITE_ENVIRONMENTS)[number]

/** Nom du paramètre d'URL de prévisualisation (CDC §5.2). */
export const SITE_MODE_PARAM = 'mode'

/** Mode appliqué quand la configuration est absente ou invalide (CDC §5.1, §10). */
const SAFE_DEFAULT_MODE: Record<SiteEnvironment, SiteMode> = {
  production: 'prelaunch',
  preprod: 'full',
  development: 'full',
}

function normalize(raw: unknown): string {
  return typeof raw === 'string' ? raw.trim().toLowerCase() : ''
}

/** Retourne le mode si la valeur est autorisée, sinon `null`. */
export function parseSiteMode(raw: unknown): SiteMode | null {
  const value = normalize(raw)
  return (SITE_MODES as readonly string[]).includes(value) ? (value as SiteMode) : null
}

/**
 * Environnement de déploiement.
 *
 * Fallback sûr : une valeur absente ou inconnue est traitée comme la
 * production. Un build mal configuré ne peut donc jamais ouvrir la
 * prévisualisation par URL.
 */
export function parseEnvironment(raw: unknown): SiteEnvironment {
  const value = normalize(raw)
  return (SITE_ENVIRONMENTS as readonly string[]).includes(value)
    ? (value as SiteEnvironment)
    : 'production'
}

/** Mode par défaut de l'environnement, avec fallback sûr si la valeur est invalide. */
export function resolveDefaultMode(environment: SiteEnvironment, raw: unknown): SiteMode {
  return parseSiteMode(raw) ?? SAFE_DEFAULT_MODE[environment]
}

/**
 * La production n'accepte jamais de changement de mode par l'URL (CDC §5.1).
 * Liste blanche explicite : un nouvel environnement serait fermé par défaut.
 */
export function allowsModeOverride(environment: SiteEnvironment): boolean {
  return environment === 'preprod' || environment === 'development'
}

/** La préproduction et le local ne doivent pas être indexés (CDC §8.2). */
export function isIndexable(environment: SiteEnvironment): boolean {
  return environment === 'production'
}

export interface SiteModeInput {
  environment: SiteEnvironment
  defaultMode: SiteMode
  /** Valeur brute du paramètre `?mode=`, telle que lue dans l'URL. */
  requested?: unknown
}

/**
 * Pseudo-logique de référence du CDC (§10.1) :
 *
 *   production -> mode configuré, paramètre d'URL ignoré
 *   preprod    -> mode configuré, remplacé par ?mode=full|prelaunch
 */
export function resolveSiteMode({ environment, defaultMode, requested }: SiteModeInput): SiteMode {
  if (!allowsModeOverride(environment)) return defaultMode
  return parseSiteMode(requested) ?? defaultMode
}
