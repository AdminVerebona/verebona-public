/**
 * Lot 113 (#709) — règle d'apparition du bouton « Revenir en haut »
 * (`BackToTop.vue`), isolée pour être testée sans navigateur.
 *
 * Le bouton apparaît une fois le haut de page hors de vue : plus d'une
 * hauteur d'écran défilée, et au moins `BACK_TO_TOP_MIN_SCROLL` px (sur un
 * écran très bas, quelques lignes de défilement ne suffisent pas).
 */
export const BACK_TO_TOP_MIN_SCROLL = 600

export function backToTopVisible(scrollY: number, viewportHeight: number): boolean {
  return scrollY > Math.max(BACK_TO_TOP_MIN_SCROLL, viewportHeight)
}

/** Défilement doux, sauf si le visiteur a demandé moins d'animations. */
export function backToTopBehavior(reducedMotion: boolean): ScrollBehavior {
  return reducedMotion ? 'auto' : 'smooth'
}
