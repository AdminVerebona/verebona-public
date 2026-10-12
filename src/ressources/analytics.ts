/**
 * Instrumentation de la rubrique — CDC Ressources V6 §14, CONV-03 à CONV-05,
 * SEC-05, NFR-01.
 *
 * Le site public n'embarque aujourd'hui AUCUN outil de mesure ni de gestion du
 * consentement. Les événements du §14 sont donc définis ici, avec des
 * propriétés sans donnée personnelle (identifiants d'article stables, jamais
 * de nom de bien ni de saisie), et ne partent nulle part tant qu'un outil
 * consenti n'est pas branché : ils sont seulement publiés sur
 * `window` (`verebona:analytics`) SI le consentement a été accordé par ce
 * futur outil (`window.__VB_ANALYTICS_CONSENT__ === true`).
 *
 * Refus ou absence d'outil : rien n'est émis (T16, T17). Une erreur ici ne
 * bloque jamais la lecture (T15).
 */
export type RessourceEvent =
  | { name: 'resource_view'; article_id: string; category: string; slug: string }
  | { name: 'resource_internal_link_click'; from_id: string; to_id: string }
  | { name: 'resource_cta_click'; article_id: string; cta_context: string }

declare global {
  interface Window { __VB_ANALYTICS_CONSENT__?: boolean }
}

export function trackRessource(event: RessourceEvent): void {
  try {
    if (typeof window === 'undefined' || window.__VB_ANALYTICS_CONSENT__ !== true) return
    window.dispatchEvent(new CustomEvent('verebona:analytics', { detail: event }))
  } catch {
    // La mesure ne doit jamais casser la page.
  }
}
