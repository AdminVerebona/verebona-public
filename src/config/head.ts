/**
 * Titre et meta description par route (navigateur).
 *
 * Les valeurs viennent de `head.rules.ts`. Le HTML initial de l'accueil les
 * porte déjà (injectées au build) : ce garde ne fait que les maintenir
 * cohérentes lors des navigations internes, et appliquer celles des autres
 * pages. Une seule balise de chaque est tenue à jour — jamais ajoutée en double.
 */
import { watch } from 'vue'
import type { Router } from 'vue-router'
import { headForRoute } from './head.rules'
import { useSiteMode } from './site'

function setDescription(content: string): void {
  let meta = document.head.querySelector<HTMLMetaElement>('meta[name="description"]')
  if (!meta) {
    meta = document.createElement('meta')
    meta.name = 'description'
    document.head.appendChild(meta)
  }
  meta.content = content
}

export function applyHead(routeName: string | undefined): void {
  if (typeof document === 'undefined') return
  // Les pages du Centre d'aide portent leur propre en-tête, calculé depuis
  // l'article affiché (src/help/head.ts) : ne pas l'écraser ici.
  if (routeName?.startsWith('help')) return
  const { siteMode } = useSiteMode()
  const head = headForRoute(routeName, siteMode.value)
  if (document.title !== head.title) document.title = head.title
  setDescription(head.description)
}

export function installHeadGuard(router: Router): void {
  const nameOf = () => {
    const name = router.currentRoute.value.name
    return typeof name === 'string' ? name : undefined
  }
  router.afterEach(() => applyHead(nameOf()))
  // Prévisualisation FULL / PRELAUNCH (préprod) : la description de l'accueil suit le mode.
  watch(useSiteMode().siteMode, () => applyHead(nameOf()))
}
