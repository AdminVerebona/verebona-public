/**
 * Levée de la garde `?mode=` une fois l'application montée (navigateur).
 * Règles et marqueurs : `mode-preview-guard.rules.ts` (CDC pré-lancement §5.3).
 */
import { MODE_REQUEST_ATTR, PRERENDER_MODE_ATTR } from './mode-preview-guard.rules'

/** Le HTML pré-rendu est remplacé : le DOM reflète désormais le bon mode. */
export function releaseModePreviewGuard(): void {
  if (typeof document === 'undefined') return
  document.documentElement.removeAttribute(MODE_REQUEST_ATTR)
  document.getElementById('app')?.removeAttribute(PRERENDER_MODE_ATTR)
}
