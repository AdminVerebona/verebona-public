/** Module généré au build par `helpCenterPlugin` (vite.config.ts). */
declare module 'virtual:help-center' {
  export const environment: import('./outputs').HelpEnvironment
  export const version: string
  export const categories: import('./types').HelpCategory[]
  /** Articles publiés dans l'environnement du build. */
  export const articles: import('./types').HelpArticle[]
  /** Anciennes URLs → URL de destination (§13.1). */
  export const redirects: Record<string, string>
}
