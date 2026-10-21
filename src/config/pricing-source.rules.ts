/**
 * Source des montants affichés dans la section Tarifs — lot 76P (ticket P1
 * « tarifs fixes temporaires en pré-lancement »).
 *
 *   catalog          mode NORMAL : catalogue public de l'application
 *                    (`GET <VITE_APP_URL>/api/billing/catalog`), même source
 *                    que Stripe Checkout. Aucun prix de secours.
 *   prelaunch_fixed  mode TEMPORAIRE : grille fixe du pré-lancement
 *                    (`PRELAUNCH_PRICE_GRID`, src/composables/usePricing.ts),
 *                    sans aucun appel à l'API tarifaire. Autorisé UNIQUEMENT
 *                    quand le site est en PRELAUNCH (aucune souscription
 *                    possible) : un prix affiché par un site commercialement
 *                    ouvert doit être un prix réellement souscriptible.
 *
 * Sélection EXPLICITE par `VITE_PRICING_SOURCE` (figée au build). Absente ou
 * invalide : `catalog` — la grille fixe n'est jamais activée par défaut ni
 * comme solution de secours.
 *
 * Préproduction et local : TOUJOURS `catalog` (tests d'intégration). La valeur
 * est ignorée, sans erreur : la préproduction Scalingo est construite par
 * `npm run build` (mode Vite `production`) et lit donc `.env.production`,
 * seule la variable VITE_ENVIRONMENT=preprod de l'hébergeur la distingue.
 *
 * Fonctions pures : partagées par `src/config/site.ts` (navigateur et
 * prérendu), `vite.config.ts` (le build ÉCHOUE sur une combinaison interdite)
 * et les tests.
 */
import type { SiteEnvironment, SiteMode } from './site-mode.rules'

export const PRICING_SOURCES = ['catalog', 'prelaunch_fixed'] as const
export type PricingSource = (typeof PRICING_SOURCES)[number]

/** Valeur reconnue, sinon `null`. */
export function parsePricingSource(raw: unknown): PricingSource | null {
  const value = typeof raw === 'string' ? raw.trim().toLowerCase() : ''
  return (PRICING_SOURCES as readonly string[]).includes(value) ? (value as PricingSource) : null
}

export interface PricingSourceResolution {
  source: PricingSource
  /** Configuration refusée (le build échoue ; à l'exécution : catalogue). */
  error: string | null
}

/**
 * Source effective d'un build.
 *
 * - production + PRELAUNCH + `prelaunch_fixed` → grille fixe ;
 * - production + FULL + `prelaunch_fixed`      → REFUSÉ : catalogue, `error`
 *   renseignée (le build échoue, vite.config.ts) ;
 * - préproduction / local                      → catalogue, quelle que soit la valeur ;
 * - `catalog`, absente, invalide               → catalogue.
 */
export function resolvePricingSource(environment: SiteEnvironment, defaultMode: SiteMode, raw: unknown): PricingSourceResolution {
  const parsed = parsePricingSource(raw)
  if (parsed !== 'prelaunch_fixed') return { source: 'catalog', error: null }
  if (environment !== 'production') return { source: 'catalog', error: null }
  if (defaultMode !== 'prelaunch') {
    return {
      source: 'catalog',
      error:
        'VITE_PRICING_SOURCE=prelaunch_fixed est interdit quand VITE_DEFAULT_SITE_MODE=full : '
        + 'un site ouvert à la souscription n’affiche que le catalogue de l’application. '
        + 'Passer VITE_PRICING_SOURCE=catalog (voir README › « Tarifs : grille temporaire du pré-lancement et bascule »).',
    }
  }
  return { source: 'prelaunch_fixed', error: null }
}
