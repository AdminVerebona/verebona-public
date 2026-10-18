<template>
<section id="pricing" class="vb-section vb-section--brume pr">
  <div class="vb-container">

    <!-- Titre — à l'impératif en FULL seulement ; au futur en PRELAUNCH (CDC pré-lancement §6.5, §8.1) -->
    <div class="pr__intro">
      <span class="vb-eyebrow">Tarifs</span>
      <h2 class="vb-h2 pr__title" data-testid="pricing-title">{{ isPrelaunch ? labels.pricingTitle : 'Essayez Verebona gratuitement pendant 7 jours.' }}</h2>
      <p class="vb-text">{{ isPrelaunch ? labels.pricingText : "Commencez par 7 jours d'essai Premium, sans carte bancaire. L'essai est limité à 2 biens et 30 documents. À son terme, vous choisissez librement une offre ; sans action de votre part, aucun abonnement ne démarre." }}</p>
    </div>

    <!-- Toggle mensuel / annuel + CTA -->
    <div class="pr__controls">
      <div class="pr__period">
        <div role="group" aria-label="Périodicité de facturation" class="vb-seg">
          <button type="button" :aria-pressed="!isYearly" @click="setPeriod('monthly')">Mensuel</button>
          <button type="button" :aria-pressed="isYearly" @click="setPeriod('yearly')">Annuel</button>
        </div>
        <span class="pr__save">En annuel, économisez l'équivalent de 2 mois.</span>
      </div>
      <div v-if="isYearly" class="vb-meta">Paiement annuel en une fois.</div>
      <!-- PRELAUNCH : offres visibles, souscription indisponible (CDC pré-lancement §6.5) -->
      <span v-if="isPrelaunch" data-testid="prelaunch-pricing" class="vb-pill vb-pill--dashed pr__cta"><span class="vb-pill__dot" aria-hidden="true"></span>{{ labels.pricing }}</span>
      <a v-else :href="signupUrl()" class="vb-btn vb-btn--primary vb-btn--lg pr__cta">Essayer gratuitement</a>
      <div v-if="!isPrelaunch" class="vb-meta pr__quote">« Vous choisirez votre offre après l'essai »</div>
    </div>

    <!-- Cartes -->
    <div class="pr__grid">

      <!-- Les 3 offres -->
      <div v-for="card in cards" :key="card.code" :class="['pr__card', `pr__card--${card.tone}`]">
        <span v-if="card.badge" :class="['vb-badge', 'pr__badge', card.badge === 'Recommandé' ? 'vb-badge--recommended' : '']">{{ card.badge }}</span>
        <h3 class="pr__name">{{ card.name }}</h3>
        <p class="pr__tagline">{{ card.tagline }}</p>

        <!-- Montant : catalogue de l'application (source unique, CDC lookup_key LK-31) ;
             jamais figé au prérendu, aucun prix de secours. -->
        <div :data-testid="`price-${card.code}`" :aria-busy="catalogState === 'loading'" class="pr__price">
          {{ priceOf(card.code) }}<span v-if="hasPrice(card.code)" class="pr__per">{{ perLabel(card.code) }}</span>
        </div>
        <div class="pr__eq">{{ equivalentOf(card.code) }}</div>

        <ul class="pr__features">
          <li v-for="f in card.features" :key="f.label" :class="{ 'pr__feature--note': f.note }">
            <VbIcon name="check" :size="16" class="pr__check" />

            <!-- feature avec sous-titre + mascotte -->
            <div v-if="f.note" class="pr__note-row">
              <div>
                <div>{{ f.label }}</div>
                <div class="pr__note">{{ f.note }}</div>
              </div>
              <img src="/assets/mascot/dialogue-bubble.webp" alt="" class="vb-mascot pr__note-mascot">
            </div>

            <!-- feature mise en avant -->
            <strong v-else-if="f.strong">{{ f.label }}</strong>

            <!-- feature simple -->
            <span v-else>{{ f.label }}</span>
          </li>
        </ul>
      </div>

      <!-- Offre Pro (à venir) -->
      <div class="pr__card pr__card--soon">
        <span class="vb-badge vb-badge--outline pr__soon-badge">Bientôt</span>
        <h3 class="pr__name">Pro</h3>
        <p class="pr__tagline">Pour la gestion du matériel, des véhicules ou de l'immobilier professionnel.</p>
        <div class="pr__price pr__price--soon">Bientôt</div>
        <ul class="pr__features">
          <li v-for="f in proFeatures" :key="f"><VbIcon name="check" :size="16" class="pr__check" /><span>{{ f }}</span></li>
        </ul>
      </div>
    </div>

    <!-- Parrainage -->
    <div class="vb-card pr__ref">
      <!-- Une seule mascotte : deux figures côte à côte suggéraient un
           avantage partagé. Le pouce levé dit le remerciement, non le
           cadeau reçu. -->
      <img src="/assets/mascot/thumbs-up.webp" alt="" aria-hidden="true" width="96" height="96" class="vb-mascot pr__ref-mascot">
      <div class="pr__ref-body">
        <span class="vb-eyebrow pr__ref-eyebrow">Parrainage</span>
        <h3 class="vb-h3 pr__ref-title">Parrainez un proche, gagnez un mois d'abonnement</h3>
        <p class="pr__ref-text">Votre filleul crée un <strong>nouveau compte</strong> avec votre lien et souscrit une offre <strong>annuelle</strong>. Après le délai de rétractation, <strong>un mois d'abonnement vous est offert</strong>. Sans limite de filleuls.</p>
      </div>
      <!-- `loginUrl` et non `signupUrl` : parrainer suppose un compte, et le
           libellé le disait déjà. Un visiteur sans compte arrive sur la
           connexion, d'où il peut s'inscrire. -->
      <span v-if="isPrelaunch" data-testid="prelaunch-referral" class="vb-pill vb-pill--dashed pr__ref-cta"><span class="vb-pill__dot" aria-hidden="true"></span>{{ labels.pricing }}</span>
      <a v-else :href="loginUrl()" class="vb-btn vb-btn--secondary pr__ref-cta">Obtenir mon lien de parrainage</a>
    </div>
  </div>
</section>
</template>

<script setup lang="ts">
import { usePricing } from '../composables/usePricing'
import { signupUrl, loginUrl } from '../config/urls'
import { useSiteMode } from '../config/site'
import VbIcon from '../components/VbIcon.vue'

const { isPrelaunch, labels } = useSiteMode()

const { isYearly, setPeriod, pricePer, priceOf, mentionOf, hasPrice, equivalentOf, catalogState } = usePricing()

/** « /mois TTC » précédé d'une espace insécable (les espaces du gabarit étaient écrasés : « /moisTTC »). */
const perLabel = (code: Parameters<typeof mentionOf>[0]) => {
  const mention = mentionOf(code)
  return `\u00a0${pricePer.value}${mention ? ` ${mention}` : ''}`
}

/** Une ligne de fonctionnalité d'une carte tarifaire. */
interface Feature {
  label: string
  /** Affiché en gras (ex. « Tout Standard + »). */
  strong?: boolean
  /** Sous-titre + mascotte (feature mise en avant). */
  note?: string
}

interface PlanCard {
  code: 'standard' | 'premium' | 'premium_duo'
  name: string
  tagline: string
  badge: string
  /** Habillage de la carte : blanche, pétrole (mise en avant) ou bordée pétrole. */
  tone: 'plain' | 'featured' | 'outlined'
  features: Feature[]
}

const cards: PlanCard[] = [
  {
    code: 'standard', name: 'Standard',
    tagline: "L'essentiel pour organiser vos biens et vos documents.",
    badge: '', tone: 'plain',
    // ⚠️ Ces listes doivent rester identiques à celles de `verebona-app`,
    // dans `src/app/(dashboard)/mon-compte/offres/page.tsx`. Les deux dépôts
    // étant séparés, rien ne le garantit automatiquement : une modification
    // ici sans l'autre fait mentir l'une des deux pages.
    features: [
      { label: "Jusqu'à 2 biens" },
      { label: "Jusqu'à 30 documents" },
      { label: '1 utilisateur' },
      { label: 'Analyse et organisation automatiques de vos documents' },
      { label: 'Agenda et rappels de vos échéances' },
      { label: 'Export complet et transmission de vos biens' },
    ],
  },
  {
    code: 'premium', name: 'Premium',
    tagline: 'Toute la puissance de Verebona.',
    badge: 'Recommandé', tone: 'featured',
    features: [
      { label: 'Tout Standard +', strong: true },
      { label: "Jusqu'à 10 biens" },
      { label: "Jusqu'à 150 documents" },
      { label: '1 utilisateur' },
      { label: 'Interrogez Verebona sur vos biens, documents et échéances' },
      { label: 'Gestion des pièces et équipements pour les biens immobiliers' },
      { label: 'Synchronisation de vos échéances avec votre agenda personnel' },
      { label: "Dossiers prêts à l'emploi" },
    ],
  },
  {
    code: 'premium_duo', name: 'Premium Duo',
    tagline: 'Toute la puissance de Verebona, à deux.',
    badge: 'Nouveau', tone: 'outlined',
    features: [
      { label: 'Tout Premium +', strong: true },
      { label: "Jusqu'à 15 biens" },
      { label: "Jusqu'à 225 documents" },
      { label: '2 utilisateurs' },
      { label: 'Gestion partagée de vos biens, documents et échéances' },
    ],
  },
]

const proFeatures: string[] = [
  'Tout Premium +',
  'Gestion matériel professionnel',
  'Plusieurs utilisateurs avec rôles',
  'API & intégrations avancées',
]
</script>

<style>
.pr__intro { max-width: 760px; margin-bottom: 28px; }
.pr__title { margin-bottom: 14px; }
.pr__controls { display: flex; flex-direction: column; align-items: center; gap: 12px; margin-bottom: 36px; text-align: center; }
.pr__period { display: inline-flex; align-items: center; gap: 16px; flex-wrap: wrap; justify-content: center; }
.pr__save { font-size: 14px; font-weight: 600; color: var(--attention-on-subtle); }
.pr__cta { margin-top: 6px; }
.pr__quote { font-style: italic; }
.pr__grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; align-items: stretch; }
.pr__card { position: relative; display: flex; flex-direction: column; padding: 26px; border-radius: var(--radius-lg); background: var(--bg-card); border: 1px solid var(--border); color: var(--text-primary); }
.pr__card--featured { background: var(--vb-petrole); border-color: var(--vb-petrole); color: var(--vb-blanc); --focus-color: #E2896F; }
.pr__card--outlined { border-color: var(--accent); }
.pr__card--soon { background: var(--bg-sidebar); }
.pr__badge { position: absolute; top: 18px; right: 18px; }
.pr__soon-badge { align-self: flex-start; margin-bottom: 8px; }
.pr__name { font-size: 20px; font-weight: 700; color: var(--text-heading); margin-bottom: 6px; padding-right: 96px; }
.pr__card--soon .pr__name { padding-right: 0; color: var(--text-muted); }
.pr__card--featured .pr__name { color: var(--vb-blanc); }
.pr__tagline { font-size: 14px; line-height: 1.5; color: var(--text-muted); margin-bottom: 18px; min-height: 42px; }
.pr__card--featured .pr__tagline, .pr__card--featured .pr__per, .pr__card--featured .pr__eq { color: var(--vb-filet); }
.pr__price { font-size: 34px; font-weight: 700; letter-spacing: -.02em; color: var(--text-heading); margin-bottom: 2px; }
.pr__card--featured .pr__price { color: var(--vb-blanc); }
.pr__price--soon { font-size: 28px; color: var(--text-muted); margin-bottom: 18px; }
.pr__per { font-size: 15px; font-weight: 500; letter-spacing: 0; color: var(--text-muted); }
.pr__eq { font-size: 13px; color: var(--text-muted); min-height: 18px; margin-bottom: 18px; }
.pr__features { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; font-size: 14px; line-height: 1.45; }
.pr__features li { display: flex; gap: 9px; align-items: flex-start; }
.pr__card--soon .pr__features { color: var(--text-muted); }
.pr__check { color: var(--accent); margin-top: 1px; }
.pr__card--featured .pr__check { color: #9FD3CC; }
.pr__card--soon .pr__check { color: var(--text-muted); }
.pr__note-row { flex: 1; display: flex; gap: 10px; align-items: flex-start; justify-content: space-between; }
.pr__note { font-size: 12px; line-height: 1.4; margin-top: 2px; opacity: .85; }
.pr__note-mascot { width: 30px; height: 30px; margin-top: -2px; }

.pr__ref { margin-top: 20px; display: flex; align-items: center; gap: 30px; flex-wrap: wrap; padding: 28px 32px; }
.pr__ref-mascot { width: 96px; }
.pr__ref-body { flex: 1; min-width: 260px; }
.pr__ref-eyebrow { margin-bottom: 8px; }
.pr__ref-title { margin-bottom: 8px; font-size: 22px; }
.pr__ref-text { font-size: 15.5px; line-height: 1.6; color: var(--text-muted); max-width: 640px; }
.pr__ref-text strong { color: var(--text-primary); }
.pr__ref-cta { flex-shrink: 0; }
@media (max-width: 1100px) { .pr__grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px) {
  .pr__grid { grid-template-columns: 1fr; }
  .pr__ref { padding: 22px 20px; gap: 18px; }
  .pr__ref-cta { width: 100%; white-space: normal; justify-content: center; }
}
</style>
