/** Module généré au build par `ressourcesPlugin` (vite.config.ts). */
declare module 'virtual:ressources' {
  export const environment: import('./outputs').RessourceEnvironment
  export const categories: import('./types').RessourceCategory[]
  /** Articles visibles dans l'environnement du build (production : publiés). */
  export const articles: import('./types').RessourceArticle[]
  /** Anciennes URLs → destination (301) et URLs retirées (410). */
  export const routes: import('./outputs').RessourceRoutes
}
