import { ref, computed } from 'vue'

/** Périodicité de facturation. */
export type BillingPeriod = 'monthly' | 'yearly'

/** Une offre Verebona avec ses prix mensuel et annuel (TTC, en euros). */
export interface Plan {
  code: 'standard' | 'premium' | 'premium_duo'
  name: string
  monthly: number
  yearly: number
  biens: number
  documents: number
  utilisateurs: number
}

/**
 * Grille tarifaire Verebona (CDC tarification).
 * Source de vérité unique pour la vitrine — prix TTC en euros.
 */
export const PLANS: Plan[] = [
  { code: 'standard',    name: 'Standard',    monthly: 2.9, yearly: 29, biens: 2,  documents: 30,  utilisateurs: 1 },
  { code: 'premium',     name: 'Premium',     monthly: 5.9, yearly: 59, biens: 10, documents: 150, utilisateurs: 1 },
  { code: 'premium_duo', name: 'Premium Duo', monthly: 8.9, yearly: 89, biens: 15, documents: 225, utilisateurs: 2 },
]

/** Formate un montant en euros à la française (2,90 € ou 29 €). */
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
   */
  const equivalentOf = (code: Plan['code']): string => {
    if (!isYearly.value) return ''
    const plan = PLANS.find(p => p.code === code)!
    const perMonth = plan.yearly / 12
    const saving = plan.monthly * 12 - plan.yearly
    return `soit ${formatPrice(Math.round(perMonth * 100) / 100)}/mois · économie de ${formatPrice(Math.round(saving * 100) / 100)}/an`
  }

  /** Prix formaté d'une offre selon la périodicité courante. */
  const priceOf = (code: Plan['code']): string => {
    const plan = PLANS.find(p => p.code === code)!
    return formatPrice(isYearly.value ? plan.yearly : plan.monthly)
  }

  return { period, isYearly, setPeriod, toggle, pricePer, priceOf, equivalentOf, plans: PLANS }
}
