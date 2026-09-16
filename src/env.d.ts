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

interface ImportMeta {
  readonly env: ImportMetaEnv
}
