/**
 * Garde de prévisualisation `?mode=` avant le montage de Vue — CDC pré-lancement §5.3.
 *
 * Injectée dans le `<head>` des builds où `?mode=` est permis (préproduction,
 * local), jamais en production (voir vite.config.ts).
 *
 * Le HTML pré-rendu porte `data-prerender-mode` sur `#app` (scripts/prerender.mjs).
 * Si l'URL demande l'autre mode, `html[data-mode-request]` est posé avant la
 * première peinture et la règle CSS masque ce HTML (ni visible ni cliquable)
 * jusqu'au montage, où `src/main.ts` retire les deux marqueurs
 * (`releaseModePreviewGuard`, src/config/mode-preview-guard.ts). Aucun lien
 * d'inscription du mode FULL n'est donc affiché ni actionnable sous
 * `?mode=prelaunch`.
 */
import { SITE_MODE_PARAM } from './site-mode.rules'

export const MODE_REQUEST_ATTR = 'data-mode-request'
export const PRERENDER_MODE_ATTR = 'data-prerender-mode'

export const MODE_PREVIEW_GUARD_CSS =
  `html[${MODE_REQUEST_ATTR}="prelaunch"] #app[${PRERENDER_MODE_ATTR}]:not([${PRERENDER_MODE_ATTR}="prelaunch"]),` +
  `html[${MODE_REQUEST_ATTR}="full"] #app[${PRERENDER_MODE_ATTR}]:not([${PRERENDER_MODE_ATTR}="full"])` +
  `{visibility:hidden}`

export const MODE_PREVIEW_GUARD_SCRIPT =
  `(function(){try{var m=new URLSearchParams(location.search).get(${JSON.stringify(SITE_MODE_PARAM)});` +
  `if(m==='full'||m==='prelaunch')document.documentElement.setAttribute(${JSON.stringify(MODE_REQUEST_ATTR)},m)}catch(e){}})()`
