/**
 * Point d'entrée du pré-rendu de l'accueil (exécuté au build, dans Node).
 *
 * Le site reste une SPA : le navigateur monte toujours l'application avec
 * `createApp` (src/main.ts). Ce module sert uniquement à produire, au build,
 * le HTML de `/` pour que le H1, le paragraphe, les bénéfices et la
 * signature figurent dans le HTML initial servi aux moteurs — sans
 * dépendre de l'exécution du JavaScript, d'une interaction ni des cookies.
 *
 * Voir scripts/prerender.mjs.
 */
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import App from './App.vue'
import router from './router'
import { vHover } from './directives/hover'

export async function render(url: string): Promise<string> {
  const app = createSSRApp(App)
  app.use(router)
  // Directive purement visuelle (survol) : sans effet sur le HTML rendu.
  app.directive('hover', vHover)
  await router.push(url)
  await router.isReady()
  return renderToString(app)
}

// Valeurs du head réutilisées par scripts/prerender.mjs pour la coquille SPA.
export { DEFAULT_DESCRIPTION, SHELL_TITLE, escapeHtmlAttr } from './config/head.rules'
