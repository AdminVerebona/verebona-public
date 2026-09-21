/**
 * Balise canonical par route — CDC Sitemap §7 « Canonical ».
 *
 * ══════════════════════════════════════════════════════════════════════════
 * LE CANONICAL ÉTAIT FIGÉ SUR L'ACCUEIL
 *
 * `index.html` porte un unique `<link rel="canonical">`. Le site étant une
 * SPA servie par un seul document, TOUTES les routes héritaient de cette
 * valeur : `/aide` déclarait l'accueil comme version canonique d'elle-même.
 *
 * Conséquence directe sur le chantier sitemap : déclarer `/aide` dans le
 * sitemap pendant que la page renvoie vers l'accueil revient à demander à
 * Google d'indexer une URL qu'elle lui dit d'ignorer. Le sitemap serait
 * accepté par Search Console, mais la page resterait hors de l'index — soit
 * l'échec de l'objectif §2.
 *
 * La règle §7 « chaque URL du sitemap doit être cohérente avec la balise
 * canonical de la page concernée » est donc traitée ici.
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Le site est rendu côté client : Googlebot exécute le JavaScript et lit la
 * balise après hydratation. C'est suffisant pour deux pages. Un rendu
 * serveur resterait préférable si le périmètre indexable s'élargit.
 */
import type { Router } from 'vue-router'
import { canonicalUrl } from './sitemap.rules'

/** Routes sans version canonique : le catch-all 404 ne doit pas s'auto-déclarer. */
const NON_CANONICAL_ROUTES = new Set(['not-found'])

function upsertCanonicalLink(href: string): void {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'canonical'
    document.head.appendChild(link)
  }
  link.href = href
}

function removeCanonicalLink(): void {
  document.head.querySelector('link[rel="canonical"]')?.remove()
}

/** `og:url` suit le canonical : les deux désignent la même page de référence. */
function setOpenGraphUrl(href: string): void {
  document.head
    .querySelector<HTMLMetaElement>('meta[property="og:url"]')
    ?.setAttribute('content', href)
}

/**
 * Applique le canonical du chemin donné.
 *
 * `routeName` permet d'exclure les routes techniques ; une valeur inconnue
 * est traitée comme une page normale.
 */
export function applyCanonical(path: string, routeName?: string): void {
  if (typeof document === 'undefined') return

  if (routeName && NON_CANONICAL_ROUTES.has(routeName)) {
    removeCanonicalLink()
    return
  }

  const href = canonicalUrl(path)
  upsertCanonicalLink(href)
  setOpenGraphUrl(href)
}

/**
 * Garde de navigation : met à jour le canonical à chaque changement de route.
 *
 * `afterEach` et non `beforeEach` — la balise décrit la page effectivement
 * affichée, pas celle qui était demandée avant une éventuelle redirection
 * (`/inscription`, garde de mode de prévisualisation).
 */
export function installCanonicalGuard(router: Router): void {
  router.afterEach((to) => {
    applyCanonical(to.path, typeof to.name === 'string' ? to.name : undefined)
  })
}
