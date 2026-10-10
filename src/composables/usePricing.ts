import { ref, computed, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue'
import { appUrl } from '../config/urls'

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
}

export type CatalogState = 'loading' | 'ready' | 'unavailable'

/** URL du catalogue public de l'application (même source que Checkout). */
export const CATALOG_URL = appUrl('/api/billing/catalog')

// État partagé du module : un seul chargement par page, quel que soit le
// nombre de composants (pas six appels par visiteur, LK-33).
const catalog = ref<PublicCatalog | null>(null)
const state = ref<CatalogState>('loading')
let inflight: Promise<void> | null = null

/** Charge (ou recharge) le catalogue. Jamais exécuté au prérendu. */
export function loadCatalog(fetchImpl: typeof fetch = fetch): Promise<void> {
  if (inflight) return inflight
  inflight = fetchImpl(CATALOG_URL, { cache: 'no-store', credentials: 'omit' })
    .then(async (res) => {
      const data = (await res.json()) as PublicCatalog
      catalog.value = data
      state.value = res.ok && data.offers?.length ? 'ready' : 'unavailable'
    })
    .catch(() => {
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
    return state.value === 'loading' ? '…' : 'Tarif indisponible'
  }

  /** Mention de facturation : TTC ; l'annuel est facturé en une fois (LK-32). */
  const mentionOf = (code: Plan['code']): string => {
    const offer = offerOf(code, period.value)
    if (!offer) return ''
    return offer.tax_included ? 'TTC' : ''
  }

  const hasPrice = (code: Plan['code']): boolean => Boolean(offerOf(code, period.value))

  // Chargement côté navigateur seulement (jamais au prérendu), et relecture
  // au retour sur l'onglet / navigation arrière (LK-33).
  if (getCurrentInstance()) {
    const onVisible = () => { if (document.visibilityState === 'visible') void loadCatalog() }
    const onShow = (e: PageTransitionEvent) => { if (e.persisted) void loadCatalog() }
    onMounted(() => {
      void loadCatalog()
      document.addEventListener('visibilitychange', onVisible)
      window.addEventListener('pageshow', onShow)
    })
    onBeforeUnmount(() => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('pageshow', onShow)
    })
  }

  return { period, isYearly, setPeriod, toggle, pricePer, priceOf, mentionOf, hasPrice, equivalentOf, catalogState: state, plans: PLANS }
}
