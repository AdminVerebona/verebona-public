/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

/** Variables injectées au build (voir `.env.*` et README). */
interface ImportMetaEnv {
  /** URL de l'application (repo verebona-app). */
  readonly VITE_APP_URL?: string
  /** `development` | `preprod` | `production` — absent/inconnu = production. */
  readonly VITE_ENVIRONMENT?: string
  /** `full` | `prelaunch` — lu uniquement par `src/config/site.ts`. */
  readonly VITE_DEFAULT_SITE_MODE?: string
}

/**
 * Prévisualisation `?mode=` autorisée par ce build (préprod, local) —
 * littéral remplacé à la compilation par `vite.config.ts` (CDC 8, O2).
 * `null` sous Vitest : `src/config/site.ts` relit alors VITE_ENVIRONMENT.
 */
declare const __VB_CAN_PREVIEW_SITE_MODE__: boolean | null

interface ImportMeta {
  readonly env: ImportMetaEnv
}
