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
import { resetSiteModePreview, SITE_MODE_PARAM, type SiteMode } from './config/site'

export async function render(url: string): Promise<string> {
  const app = createSSRApp(App)
  app.use(router)
  // Directive purement visuelle (survol) : sans effet sur le HTML rendu.
  app.directive('hover', vHover)
  await router.push(url)
  await router.isReady()
  return renderToString(app)
}

/**
 * Rendu d'une page dans un mode de prévisualisation (préprod : `?mode=`).
 * Le mode demandé vit dans un état de module : il est remis à zéro ensuite,
 * pour que les rendus suivants retrouvent le mode par défaut du build.
 */
export async function renderInMode(url: string, mode: SiteMode): Promise<string> {
  try {
    return await render(`${url}?${SITE_MODE_PARAM}=${mode}`)
  } finally {
    resetSiteModePreview()
  }
}

// Mode du build et possibilité de prévisualisation (CDC pré-lancement §5.3).
export { DEFAULT_SITE_MODE, CAN_PREVIEW_SITE_MODE } from './config/site'

// Balises Open Graph / Twitter par page (CDC Données structurées §6).
export { socialMetaHtml, stripSocialMeta } from './config/social.rules'

// Valeurs du head réutilisées par scripts/prerender.mjs pour la coquille SPA.
export { DEFAULT_DESCRIPTION, SHELL_TITLE, escapeHtmlAttr } from './config/head.rules'

// Pages du Centre d'aide et leur en-tête (voir scripts/prerender.mjs).
export { helpPages } from './help/pages'
