import { ref, computed, onMounted, onBeforeUnmount, getCurrentInstance, watch } from 'vue'
import { appUrl } from '../config/urls'
import { PRICING_SOURCE, useSiteMode } from '../config/site'

export { PRICING_SOURCE } from '../config/site'

/** Périodicité de facturation. */
export type BillingPeriod = 'monthly' | 'yearly'

/**
 * Une offre Verebona : code et quotas (référentiel d'offres).
 *
 * ══════════════════════════════════════════════════════════════════════════
 * PLUS AUCUN MONTANT ICI (CDC « Migration Stripe vers lookup_key » V4,
 * LK-31, LK-104, LK-116, EX-004, EX-037)
 *
 * Les montants affichés viennent du catalogue PUBLIC de l'application
 * (`GET <app>/api/billing/catalog`) : la révision tarifaire ACTIVE, celle-là
 * même que Stripe Checkout facture. La vitrine ne fige aucun prix au build ni
 * au prérendu (le HTML prérendu affiche un état de chargement) ; elle relit
 * le catalogue au chargement et au retour sur l'onglet. Si le catalogue est
 * indisponible, aucun prix de secours n'est inventé : « Tarif indisponible ».
 * Après un échec de publication, le serveur continue de servir l'ancienne
 * grille active — la vitrine aussi, automatiquement.
 *
 * Les quotas restent ceux du référentiel d'offres (inchangés par un prix).
 *
 * EXCEPTION TEMPORAIRE (lot 76P) : `PRELAUNCH_PRICE_GRID` ci-dessous, active
 * seulement avec `VITE_PRICING_SOURCE=prelaunch_fixed` ET le site en
 * PRELAUNCH (aucune souscription possible). À retirer après la bascule
 * (README › « Tarifs : grille temporaire du pré-lancement et bascule »).
 * ══════════════════════════════════════════════════════════════════════════
 */
export interface Plan {
  code: 'standard' | 'premium' | 'premium_duo'
  name: string
  biens: number
  documents: number
  utilisateurs: number
}

export const PLANS: Plan[] = [
  { code: 'standard',    name: 'Standard',    biens: 2,  documents: 30,  utilisateurs: 1 },
  { code: 'premium',     name: 'Premium',     biens: 10, documents: 150, utilisateurs: 1 },
  { code: 'premium_duo', name: 'Premium Duo', biens: 15, documents: 225, utilisateurs: 2 },
]

/** Offre du catalogue public (contrat `GET /api/billing/catalog`). */
export interface CatalogOffer {
  plan_code: Plan['code']
  billing_period: BillingPeriod
  unit_amount_cents: number
  currency: 'eur'
  price_revision: string
  available: boolean
  tax_included: boolean
}

export interface PublicCatalog {
  catalog_version: string | null
  status: 'ok' | 'stale' | 'unavailable' | 'updating'
  purchasable: boolean
  offers: CatalogOffer[]
  /** Code non sensible expliquant une grille incomplète (lot 36B), `null` sinon. */
  reason?: string | null
  /** Offres indisponibles et raison par offre (lot 36B). */
  unavailable?: Array<{ plan_code: Plan['code']; billing_period: BillingPeriod; reason: string }>
}

export type CatalogState = 'loading' | 'ready' | 'unavailable'

/**
 * ══════════════════════════════════════════════════════════════════════════
 * GRILLE TEMPORAIRE DU PRÉ-LANCEMENT (lot 76P) — SEULE copie des montants
 * dans le site public, en centimes entiers TTC, strictement identique au
 * référentiel PRICING_MANIFEST de verebona-app.
 *
 * Affichée uniquement quand `PRICING_SOURCE === 'prelaunch_fixed'` et que le
 * site est en PRELAUNCH : la vitrine présente les tarifs annoncés sans ouvrir
 * la souscription, sans dépendre d'une application pas encore déployée.
 * JAMAIS utilisée comme prix de secours du catalogue (mode `catalog`) : une
 * API indisponible reste « Tarif indisponible ».
 *
 * Bascule (README) : `VITE_PRICING_SOURCE=catalog`, puis supprimer ce bloc.
 * ══════════════════════════════════════════════════════════════════════════
 */
export const PRELAUNCH_PRICE_GRID: Readonly<Record<Plan['code'], Readonly<Record<BillingPeriod, number>>>> = Object.freeze({
  standard:    Object.freeze({ monthly: 390, yearly: 3900 }),
  premium:     Object.freeze({ monthly: 690, yearly: 6900 }),
  premium_duo: Object.freeze({ monthly: 990, yearly: 9900 }),
})

/** Mention affichée sous le sélecteur quand la grille temporaire est active. */
export const PRELAUNCH_PRICING_NOTICE = 'Tarifs prévus à l\u2019ouverture — TTC'

const { isPrelaunch } = useSiteMode()
/**
 * Grille temporaire active : source choisie au build ET site non souscriptible.
 * En production le mode est figé (pas de bascule possible à l'exécution) ;
 * en préprod / local, `?mode=full` repasse sur le catalogue.
 */
const fixedGridActive = computed(() => PRICING_SOURCE === 'prelaunch_fixed' && isPrelaunch.value)

function fixedOffer(code: Plan['code'], period: BillingPeriod): CatalogOffer {
  return {
    plan_code: code,
    billing_period: period,
    unit_amount_cents: PRELAUNCH_PRICE_GRID[code][period],
    currency: 'eur',
    price_revision: 'prelaunch_fixed',
    // Affichable. La souscription reste fermée : PRELAUNCH ne rend aucun lien
    // d'inscription ni de Checkout (CDC pré-lancement §6.5).
    available: true,
    tax_included: true,
  }
}

/** URL du catalogue public de l'application (même source que Checkout). */
export const CATALOG_URL = appUrl('/api/billing/catalog')

// État partagé du module : un seul chargement par page, quel que soit le
// nombre de composants (pas six appels par visiteur, LK-33).
const catalog = ref<PublicCatalog | null>(null)
const state = ref<CatalogState>('loading')
let inflight: Promise<void> | null = null
/** État exposé : toujours `ready` avec la grille temporaire (aucun chargement). */
const effectiveState = computed<CatalogState>(() => (fixedGridActive.value ? 'ready' : state.value))

/**
 * Diagnostic CONSOLE (lot 36B) : « Tarif indisponible » doit être
 * explicable depuis le navigateur, sans accès aux journaux de l'application.
 *   - requête bloquée (CORS) ou application injoignable : `fetch` rejette
 *     sans détail (le navigateur masque la cause CORS) → message qui nomme
 *     l'URL appelée, l'origine de la page et le réglage à vérifier ;
 *   - réponse illisible (page HTML, 404 d'une ancienne application) ;
 *   - catalogue servi mais incomplet : raison donnée par le serveur.
 * Jamais de prix de secours.
 */
function pageOrigin(): string {
  return typeof window !== 'undefined' ? window.location.origin : '?'
}

/** Charge (ou recharge) le catalogue. Jamais exécuté au prérendu. */
export function loadCatalog(fetchImpl: typeof fetch = fetch): Promise<void> {
  if (inflight) return inflight
  inflight = fetchImpl(CATALOG_URL, { cache: 'no-store', credentials: 'omit' })
    .then(async (res) => {
      let data: PublicCatalog
      try {
        data = (await res.json()) as PublicCatalog
      } catch {
        console.error(`[Verebona] Tarifs : réponse illisible de ${CATALOG_URL} (HTTP ${res.status}). Vérifier VITE_APP_URL (application déployée avec /api/billing/catalog).`)
        if (!catalog.value) state.value = 'unavailable'
        return
      }
      catalog.value = data
      state.value = res.ok && data.offers?.length ? 'ready' : 'unavailable'
      if (!res.ok || data.status !== 'ok' || data.reason) {
        console.warn(`[Verebona] Tarifs : catalogue ${data.status ?? `HTTP ${res.status}`}${data.reason ? ` (raison : ${data.reason})` : ''}.`, data.unavailable ?? [])
      }
    })
    .catch((error: unknown) => {
      console.error(
        `[Verebona] Tarifs : catalogue injoignable (${CATALOG_URL}) depuis ${pageOrigin()}. `
        + 'Cause la plus fréquente : origine refusée par CORS — l\'application doit autoriser cette origine '
        + '(NEXT_PUBLIC_PUBLIC_SITE_URL ou PUBLIC_SITE_EXTRA_ORIGINS, voir BO › Exploitation › Catalogue Stripe). '
        + 'Sinon : application arrêtée ou VITE_APP_URL erronée.',
        error,
      )
      // Échec réseau : on garde un catalogue déjà chargé, sinon indisponible.
      if (!catalog.value) state.value = 'unavailable'
    })
    .finally(() => { inflight = null })
  return inflight
}

/** Tests : remet l'état partagé à zéro. */
export function __resetCatalogForTests(): void {
  catalog.value = null
  state.value = 'loading'
  inflight = null
}

function offerOf(code: Plan['code'], period: BillingPeriod): CatalogOffer | null {
  if (fixedGridActive.value) return fixedOffer(code, period)
  return catalog.value?.offers.find((o) => o.plan_code === code && o.billing_period === period && o.available) ?? null
}

const EUR = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })

/** Montant en centimes → « 3,90 € » (Intl fr-FR, LK-32). */
export function formatCents(cents: number): string {
  return EUR.format(cents / 100)
}

/** Formate un montant en euros à la française (« 3,25 € », « 7,80 € ») — texte d’équivalence, inchangé. */
export function formatPrice(value: number): string {
  const hasCents = !Number.isInteger(value)
  return value.toLocaleString('fr-FR', {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  }) + ' €'
}

/**
 * État partagé du toggle mensuel/annuel + helpers d'affichage.
 * Utilisable dans le Hero (mini-cartes) comme dans la section Pricing.
 */
export function usePricing() {
  const period = ref<BillingPeriod>('monthly')

  const isYearly = computed(() => period.value === 'yearly')
  const setPeriod = (p: BillingPeriod) => { period.value = p }
  const toggle = () => { period.value = isYearly.value ? 'monthly' : 'yearly' }

  /** Suffixe affiché après le prix ("/mois" ou "/an"). */
  const pricePer = computed(() => (isYearly.value ? '/an' : '/mois'))

  /**
   * Texte d'équivalence affiché en mode annuel :
   * "soit 2,42 €/mois · économie de 5,80 €/an". Vide en mensuel.
   * Texte et calcul INCHANGÉS (hors périmètre, LK-115) : seuls les montants
   * d'entrée viennent désormais du catalogue.
   */
  const equivalentOf = (code: Plan['code']): string => {
    if (!isYearly.value) return ''
    const monthlyOffer = offerOf(code, 'monthly')
    const yearlyOffer = offerOf(code, 'yearly')
    if (!monthlyOffer || !yearlyOffer) return ''
    const plan = { monthly: monthlyOffer.unit_amount_cents / 100, yearly: yearlyOffer.unit_amount_cents / 100 }
    const perMonth = plan.yearly / 12
    const saving = plan.monthly * 12 - plan.yearly
    return `soit ${formatPrice(Math.round(perMonth * 100) / 100)}/mois · économie de ${formatPrice(Math.round(saving * 100) / 100)}/an`
  }

  /** Prix formaté d'une offre selon la périodicité courante (catalogue serveur). */
  const priceOf = (code: Plan['code']): string => {
    const offer = offerOf(code, period.value)
    if (offer) return formatCents(offer.unit_amount_cents)
    return effectiveState.value === 'loading' ? '…' : 'Tarif indisponible'
  }

  /** Mention de facturation : TTC ; l'annuel est facturé en une fois (LK-32). */
  const mentionOf = (code: Plan['code']): string => {
    const offer = offerOf(code, period.value)
    if (!offer) return ''
    return offer.tax_included ? 'TTC' : ''
  }

  const hasPrice = (code: Plan['code']): boolean => Boolean(offerOf(code, period.value))

  /** Mention « Tarifs prévus à l'ouverture — TTC » (grille temporaire seulement). */
  const pricingNotice = computed(() => (fixedGridActive.value ? PRELAUNCH_PRICING_NOTICE : ''))

  // Catalogue : chargement côté navigateur seulement (jamais au prérendu), et
  // relecture au retour sur l'onglet / navigation arrière (LK-33). Grille
  // temporaire active : AUCUN appel à l'API tarifaire.
  if (getCurrentInstance()) {
    const refresh = () => { if (!fixedGridActive.value) void loadCatalog() }
    const onVisible = () => { if (document.visibilityState === 'visible') refresh() }
    const onShow = (e: PageTransitionEvent) => { if (e.persisted) refresh() }
    // Préprod / local : `?mode=full` sur un build à grille temporaire → catalogue.
    const stop = watch(fixedGridActive, refresh)
    onMounted(() => {
      refresh()
      document.addEventListener('visibilitychange', onVisible)
      window.addEventListener('pageshow', onShow)
    })
    onBeforeUnmount(() => {
      stop()
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('pageshow', onShow)
    })
  }

  return { period, isYearly, setPeriod, toggle, pricePer, priceOf, mentionOf, hasPrice, equivalentOf, catalogState: effectiveState, pricingNotice, plans: PLANS }
}
