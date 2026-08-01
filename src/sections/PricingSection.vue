<template>
<section id="pricing" style="background:#E9F0FA;color:#0F1B33;padding:88px 24px">
  <div style="max-width:1280px;margin:0 auto">

    <!-- Titre -->
    <div class="vb-reveal" style="margin-bottom:14px">
      <div style="font-size:13.5px;letter-spacing:.15em;text-transform:uppercase;font-weight:800;color:#2563EB;margin-bottom:10px">Tarifs</div>
      <h2 style="font-size:44px;font-weight:600;letter-spacing:-.02em;color:#0F1B33;margin-bottom:10px;max-width:680px;line-height:1.12">Essayez Verebona gratuitement pendant 7 jours.</h2>
      <p style="font-size:15.5px;line-height:1.6;color:#5B6577;max-width:700px">Commencez par 7 jours d'essai Premium, sans carte bancaire. L'essai est limité à 2 biens et 30 documents. À son terme, vous choisissez librement une offre ; sans action de votre part, aucun abonnement ne démarre.</p>
    </div>

    <!-- Toggle mensuel / annuel + CTA -->
    <div class="vb-reveal" style="display:flex;flex-direction:column;align-items:center;gap:12px;margin-bottom:30px">
      <div style="display:inline-flex;align-items:center;gap:16px;flex-wrap:wrap;justify-content:center">
        <div role="group" aria-label="Périodicité de facturation" style="display:inline-flex;gap:4px;padding:5px;border-radius:999px;background:#E9EEF6;border:1px solid #DCE3EE">
          <button type="button" :style="segStyle(!isYearly)" @click="setPeriod('monthly')">Mensuel</button>
          <button type="button" :style="segStyle(isYearly)" @click="setPeriod('yearly')">Annuel</button>
        </div>
        <span style="display:inline-flex;align-items:center;gap:8px;font-size:13.5px;font-weight:600;color:#2563EB;white-space:nowrap">En annuel, économisez l'équivalent de 2 mois.</span>
      </div>
      <div v-if="isYearly" style="font-size:12.5px;color:#8A93A6">Paiement annuel en une fois.</div>
      <a :href="signupUrl()" style="margin-top:6px;font-size:16px;font-weight:600;color:#fff;padding:14px 30px;border-radius:999px;background:linear-gradient(135deg,#00D4AA,#00A882);box-shadow:0 16px 36px rgba(0,180,140,.35);transition:transform .15s" v-hover="{transform:'translateY(-2px)'}">Essayer gratuitement</a>
      <div style="font-size:13.5px;color:#5B6577;font-style:italic">« Vous choisirez votre offre après l'essai »</div>
    </div>

    <!-- Cartes -->
    <div class="vb-rgroup r-4" style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;align-items:stretch">

      <!-- Les 3 offres -->
      <div v-for="card in cards" :key="card.code" :style="card.cardStyle">
        <span v-if="card.badge" :style="card.badgeStyle">{{ card.badge }}</span>
        <h3 :style="`font-size:18px;font-weight:600;color:${card.titleColor};margin-bottom:6px`">{{ card.name }}</h3>
        <p :style="`font-size:13px;color:${card.textColor};line-height:1.5;margin-bottom:16px;min-height:40px`">{{ card.tagline }}</p>

        <div :style="`font-family:'Bricolage Grotesque',sans-serif;font-size:32px;font-weight:600;color:${card.titleColor};margin-bottom:2px`">
          {{ priceOf(card.code) }}<span :style="`font-size:15px;font-weight:400;color:${card.mutedColor}`"> {{ pricePer }}</span>
        </div>
        <div :style="`font-size:12.5px;color:${card.mutedColor};min-height:17px;margin-bottom:18px`">{{ equivalentOf(card.code) }}</div>

        <div :style="`display:flex;flex-direction:column;gap:10px;font-size:13px;color:${card.textColor}`">
          <div v-for="f in card.features" :key="f.label" :style="`display:flex;gap:9px;${f.note ? 'align-items:flex-start' : ''}`">
            <span :style="`color:${card.checkColor};font-weight:700`">✓</span>

            <!-- feature avec sous-titre + mascotte -->
            <div v-if="f.note" style="flex:1;display:flex;gap:10px;align-items:flex-start;justify-content:space-between">
              <div>
                <div>{{ f.label }}</div>
                <div style="font-size:11.5px;color:#7C8DAD;line-height:1.4;margin-top:2px">{{ f.note }}</div>
              </div>
              <img src="/assets/mascot/dialogue-bubble.webp" alt="Verebona" style="width:30px;height:30px;flex-shrink:0;margin-top:-2px">
            </div>

            <!-- feature mise en avant -->
            <strong v-else-if="f.strong" :style="`color:${card.strongColor}`">{{ f.label }}</strong>

            <!-- feature simple -->
            <template v-else>{{ f.label }}</template>
          </div>
        </div>
      </div>

      <!-- Offre Pro (à venir) -->
      <div style="display:flex;flex-direction:column;padding:24px;border-radius:18px;background:#F3F5F9;border:1px solid #E6EBF3;opacity:.8">
        <span style="align-self:flex-start;font-size:11px;padding:4px 11px;border-radius:999px;background:#E7EBF2;border:1px solid #D3DBE8;color:#8A93A6;margin-bottom:8px">Bientôt</span>
        <h3 style="font-size:18px;font-weight:600;color:#5B6577;margin-bottom:6px">Pro</h3>
        <p style="font-size:13px;color:#8A93A6;line-height:1.5;margin-bottom:16px;min-height:40px">Pour la gestion du matériel, des véhicules ou de l'immobilier professionnel.</p>
        <div style="font-family:'Bricolage Grotesque',sans-serif;font-size:28px;font-weight:600;color:#8A93A6;margin-bottom:18px">Bientôt</div>
        <div style="display:flex;flex-direction:column;gap:10px;font-size:13px;color:#8A93A6">
          <div v-for="f in proFeatures" :key="f" style="display:flex;gap:9px"><span style="color:#A9B2C2;font-weight:700">✓</span>{{ f }}</div>
        </div>
      </div>
    </div>

    <!-- Parrainage -->
    <div class="vb-reveal" style="margin-top:20px;display:flex;align-items:center;gap:30px;flex-wrap:wrap;padding:30px 34px;border-radius:20px;background:linear-gradient(120deg,#0E1B36,#0B2A66);border:1px solid rgba(59,130,246,.4);box-shadow:0 24px 50px rgba(15,27,51,.22);position:relative;overflow:hidden">
      <div style="position:absolute;right:-40px;top:-60px;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(59,130,246,.28),transparent 65%);pointer-events:none"></div>
      <div style="position:relative;flex-shrink:0;display:flex;align-items:flex-end;justify-content:center">
        <img src="/assets/mascot/welcome-wave.webp" alt="Parrain Verebona" style="width:92px;height:auto;transform:scaleX(-1);z-index:2;filter:drop-shadow(0 18px 30px rgba(4,10,26,.5))">
        <img src="/assets/mascot/welcome-wave.webp" alt="Filleul Verebona" style="width:92px;height:auto;margin-left:-18px;z-index:1;filter:drop-shadow(0 18px 30px rgba(4,10,26,.5))">
      </div>
      <div style="flex:1;min-width:280px;position:relative">
        <div style="font-size:12.5px;letter-spacing:.14em;text-transform:uppercase;font-weight:800;color:#8FBEFF;margin-bottom:9px">Parrainage</div>
        <h3 style="font-size:24px;font-weight:600;color:#fff;letter-spacing:-.01em;margin-bottom:9px;font-family:'Bricolage Grotesque',sans-serif;line-height:1.2">Parrainez un proche, profitez chacun d'un mois offert</h3>
        <p style="font-size:14.5px;line-height:1.6;color:#B7C4DC;max-width:640px">Votre filleul crée un <strong style="color:#EAF0FB">nouveau compte</strong> avec votre lien et souscrit une offre <strong style="color:#EAF0FB">annuelle</strong>. Après le délai de rétractation, <strong style="color:#EAF0FB">un mois d'abonnement est offert à chacun</strong>.</p>
      </div>
      <a :href="signupUrl()" style="flex-shrink:0;position:relative;font-size:14.5px;font-weight:600;color:#0B2A66;background:#fff;padding:13px 24px;border-radius:999px;box-shadow:0 12px 26px rgba(4,10,26,.3);transition:transform .15s" v-hover="{transform:'translateY(-1px)'}">Parrainer depuis mon compte</a>
    </div>
  </div>
</section>
</template>

<script setup lang="ts">
import { usePricing } from '../composables/usePricing'
import { signupUrl } from '../config/urls'

const { isYearly, setPeriod, pricePer, priceOf, equivalentOf } = usePricing()

const segStyle = (active: boolean) =>
  `padding:9px 20px;border-radius:999px;border:0;cursor:pointer;font-size:14px;font-weight:600;font-family:'Instrument Sans',sans-serif;transition:all .18s;background:${active ? '#fff' : 'transparent'};color:${active ? '#0F1B33' : '#5B6577'};box-shadow:${active ? '0 2px 8px rgba(15,27,51,.10)' : 'none'}`

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
  badgeStyle: string
  cardStyle: string
  titleColor: string
  textColor: string
  mutedColor: string
  checkColor: string
  strongColor: string
  features: Feature[]
}

const cards: PlanCard[] = [
  {
    code: 'standard', name: 'Standard',
    tagline: "L'essentiel pour organiser vos biens et vos documents.",
    badge: '', badgeStyle: '',
    cardStyle: 'display:flex;flex-direction:column;padding:24px;border-radius:18px;background:#fff;border:1px solid #E6EBF3;position:relative',
    titleColor: '#0F1B33', textColor: '#5B6577', mutedColor: '#8A93A6', checkColor: '#2563EB', strongColor: '#0F1B33',
    features: [
      { label: '2 biens · 30 documents' },
      { label: '1 utilisateur' },
      { label: 'Analyse & organisation automatiques' },
      { label: 'Échéances & incohérences détectées' },
      { label: 'Agenda Verebona' },
      { label: 'Export ZIP complet & transmission' },
    ],
  },
  {
    code: 'premium', name: 'Premium',
    tagline: 'Toute la puissance de Verebona.',
    badge: 'Recommandé',
    badgeStyle: 'position:absolute;top:16px;right:16px;font-size:11px;padding:4px 11px;border-radius:999px;background:rgba(59,130,246,.18);border:1px solid rgba(96,165,250,.7);color:#BFDBFE',
    cardStyle: 'display:flex;flex-direction:column;padding:24px;border-radius:18px;background:linear-gradient(180deg,#0E1B36,#0B1428);border:1px solid rgba(59,130,246,.5);position:relative;box-shadow:0 24px 50px rgba(15,27,51,.25)',
    titleColor: '#fff', textColor: '#9DB0CE', mutedColor: '#8DA0BE', checkColor: '#60A5FA', strongColor: '#EAF0FB',
    features: [
      { label: 'Tout Standard +', strong: true },
      { label: '10 biens · 150 documents' },
      { label: '1 utilisateur' },
      { label: 'Posez vos questions à Verebona', note: 'Sur vos biens, vos documents ou vos échéances.' },
      { label: 'Synchronisation avec votre agenda personnel' },
      { label: 'Dossiers prêts à utiliser' },
    ],
  },
  {
    code: 'premium_duo', name: 'Premium Duo',
    tagline: 'Toute la puissance de Verebona, à deux.',
    badge: 'Nouveau',
    badgeStyle: 'position:absolute;top:16px;right:16px;font-size:11px;padding:4px 11px;border-radius:999px;background:rgba(52,211,153,.12);border:1px solid rgba(52,211,153,.5);color:#059669',
    cardStyle: 'display:flex;flex-direction:column;padding:24px;border-radius:18px;background:#fff;border:1px solid rgba(52,211,153,.45);position:relative',
    titleColor: '#0F1B33', textColor: '#5B6577', mutedColor: '#8A93A6', checkColor: '#059669', strongColor: '#0F1B33',
    features: [
      { label: 'Tout Premium +', strong: true },
      { label: '15 biens · 225 documents' },
      { label: '2 utilisateurs' },
      { label: 'Compte entièrement partagé' },
      { label: 'Gestion commune des biens et échéances' },
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
