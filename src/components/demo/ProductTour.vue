<template>
<!-- Visite de l'application en six vues (lot 69P, page publique mobile).
     Carrousel natif piloté par l'utilisateur : chaque vue associe un titre et
     une phrase en TEXTE RÉEL à un cadrage partiel de l'interface construit en
     HTML/CSS (inspiré des maquettes « Verebona App 2026 »). Les cadrages sont
     décoratifs pour les lecteurs d'écran (`aria-hidden`) : l'information
     utile est portée par le texte de la vue. Rien n'est focalisable dans les
     vues : les éléments hors écran ne reçoivent jamais le focus. -->
<div class="tour vb-carousel vb-carousel--bleed" role="region" aria-roledescription="carrousel" aria-labelledby="tour-title">
  <p id="tour-title" class="tour__head">Verebona en six vues</p>
  <ul id="tour-track" ref="track" class="vb-carousel__track tour__track" tabindex="0" aria-label="Vues de l'application, défilement horizontal">
    <li v-for="(v, i) in views" :key="v.key" :class="['tour__slide', `tour__slide--${v.key}`]" :data-view="v.key">
      <div class="tour__stage" aria-hidden="true">
        <!-- 1. Fiche du bien : photo recadrée + carte d'identité qui la chevauche -->
        <template v-if="v.key === 'bien'">
          <img class="tour__photo" src="/assets/appartement-lyon.webp" alt="" width="290" height="200" loading="lazy" decoding="async" />
          <div class="tour__card tour__card--float tour__asset">
            <div class="tour__row-top"><span class="tour__strong">Appartement Lyon</span><span class="vb-badge tour__b">Actif</span></div>
            <span class="tour__meta">Immobilier · Appartement</span>
            <span class="tour__tabs"><span class="tour__tab tour__tab--on">Aperçu</span><span class="tour__tab">Informations</span><span class="tour__tab">Documents</span></span>
            <span class="tour__kpis"><span><b>7</b> documents</span><span><b>2</b> échéances</span></span>
          </div>
        </template>

        <!-- 2. Documents : pile décalée de documents classés -->
        <template v-else-if="v.key === 'docs'">
          <div class="tour__card tour__doc tour__doc--back"><span class="tour__doc-ico"><VbIcon name="file" :size="16" /></span><span class="tour__strong">Contrat de bail</span></div>
          <div class="tour__card tour__doc tour__doc--mid"><span class="tour__doc-ico"><VbIcon name="file" :size="16" /></span><span class="tour__doc-body"><span class="tour__strong">Attestation d’assurance</span><span class="tour__meta">Appartement Lyon · 01/01/2026</span></span></div>
          <div class="tour__card tour__card--float tour__doc tour__doc--front">
            <span class="tour__doc-ico"><VbIcon name="file" :size="16" /></span>
            <span class="tour__doc-body"><span class="tour__strong">Facture achat vélo</span><span class="tour__meta">Vélo Cargo · 12/03/2024</span></span>
            <span class="vb-badge tour__b">Facture</span>
          </div>
          <span class="tour__chips"><span class="tour__chip tour__chip--on">Tout · 16</span><span class="tour__chip">Factures · 5</span><span class="tour__chip">Contrats · 2</span></span>
        </template>

        <!-- 3. Informations extraites : fichier déposé → fiche structurée -->
        <template v-else-if="v.key === 'infos'">
          <div class="tour__card tour__kv">
            <span class="tour__kv-row"><span class="tour__k">Bien</span><span class="tour__v">Appartement Lyon</span></span>
            <span class="tour__kv-row"><span class="tour__k">Catégorie</span><span class="tour__v">Facture · Entretien</span></span>
            <span class="tour__kv-row"><span class="tour__k">Montant</span><span class="tour__v">145,00 €</span></span>
            <span class="tour__kv-row"><span class="tour__k">Date</span><span class="tour__v">12/03/2026</span></span>
          </div>
          <div class="tour__card tour__card--float tour__file"><VbIcon name="file" :size="15" /><span class="tour__strong">facture-chaudiere-2026.pdf</span><span class="tour__ok"><VbIcon name="check" :size="13" />Lu</span></div>
        </template>

        <!-- 4. Agenda : échéances datées + rappel qui se superpose -->
        <template v-else-if="v.key === 'agenda'">
          <div class="tour__card tour__agenda">
            <span v-for="e in events" :key="e.title" class="tour__ev">
              <span :class="['tour__date', e.late ? 'tour__date--late' : '']"><b>{{ e.d }}</b>{{ e.m }}</span>
              <span class="tour__doc-body"><span class="tour__strong">{{ e.title }}</span><span class="tour__meta">{{ e.asset }}</span></span>
              <span :class="['vb-badge tour__b', e.late ? 'vb-badge--attention' : '']">{{ e.state }}</span>
            </span>
          </div>
          <div class="tour__card tour__card--float tour__toast"><span class="tour__toast-ico"><VbIcon name="bell" :size="15" /></span><span class="tour__doc-body"><span class="tour__strong">Rappel</span><span class="tour__meta">Contrôle technique dans 7 jours</span></span></div>
        </template>

        <!-- 5. Coût de possession : total + répartition (libellés et montants écrits) -->
        <template v-else-if="v.key === 'cout'">
          <div class="tour__card tour__cost">
            <span class="tour__meta">Vélo Cargo · depuis l’achat</span>
            <span class="tour__total">2 180 €</span>
            <span v-for="c in costs" :key="c.label" class="tour__bar-row">
              <span class="tour__bar-label"><span>{{ c.label }}</span><b>{{ c.amount }}</b></span>
              <span class="tour__bar"><span class="tour__bar-fill" :style="{ width: c.pct + '%' }"></span></span>
            </span>
          </div>
          <div class="tour__card tour__card--float tour__op"><span class="tour__doc-ico"><VbIcon name="euro" :size="15" /></span><span class="tour__doc-body"><span class="tour__strong">Révision annuelle</span><span class="tour__meta">Entretien · 85,00 €</span></span></div>
        </template>

        <!-- 6. Verebona vous répond : champ de question + réponse de la mascotte -->
        <template v-else>
          <div class="tour__ask"><img class="vb-mascot tour__ask-m" src="/assets/mascot/neutral.webp" alt="" width="26" height="26" loading="lazy" decoding="async" /><span>Dernier entretien de la chaudière ?</span></div>
          <div class="vb-bubble tour__answer">Le <b>12/03/2026</b>, pour 145,00 € — facture rattachée à l’Appartement Lyon. Prochain entretien : <b>mars 2027</b>.</div>
          <img class="vb-mascot tour__mascot" src="/assets/mascot/thumbs-up.webp" alt="" width="84" height="84" loading="lazy" decoding="async" />
        </template>
      </div>
      <p class="tour__title"><span class="tour__num" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>{{ v.title }}</p>
      <p class="tour__text">{{ v.text }}</p>
    </li>
  </ul>
  <CarouselControls controls="tour-track" prev-label="Vue précédente" next-label="Vue suivante"
    :at-start="car.atStart.value" :at-end="car.atEnd.value" :count="views.length"
    :first="car.first.value" :last="car.first.value" :position="`${car.first.value + 1} / ${views.length}`" :status="car.status.value"
    @prev="car.prev" @next="car.next" />
</div>
</template>

<script setup lang="ts">
import { useScrollCarousel } from '../../composables/useScrollCarousel'
import VbIcon from '../VbIcon.vue'
import CarouselControls from '../CarouselControls.vue'
import { TOUR_COSTS as costs, TOUR_EVENTS as events, TOUR_VIEWS as views } from './tour'

const car = useScrollCarousel({
  count: views.length,
  step: 'one',
  announce: (f) => `Vue ${f + 1} sur ${views.length} : ${views[f].title}`,
})
const track = car.track
</script>

<style>
/* Visite en six vues — cadrages partiels, deux niveaux de profondeur au plus
   (charte §6), ombre de carte de la charte, aucune animation propre. */
.tour { margin-top: 40px; }
.tour__head { font-size: 14px; letter-spacing: .06em; text-transform: uppercase; font-weight: 700; color: var(--text-heading); margin: 0 0 6px 2px; }
.tour__slide { width: min(300px, 80vw); display: flex; flex-direction: column; }
.tour__stage {
  position: relative; height: 204px; border-radius: var(--radius-lg); overflow: hidden;
  background: var(--bg-section); border: 1px solid var(--border-subtle); margin-bottom: 14px;
}
.tour__slide:nth-child(even) .tour__stage { background: var(--bg-sidebar); }
.tour__title { display: flex; align-items: baseline; gap: 10px; font-size: var(--fs-h3-mobile); line-height: var(--lh-h3); font-weight: 700; letter-spacing: var(--ls-h3); color: var(--text-heading); margin: 0 0 6px; }
.tour__num { font-size: 14px; font-weight: 700; color: var(--attention); font-variant-numeric: tabular-nums; }
.tour__text { font-size: 15.5px; line-height: 1.55; color: var(--text-muted); margin: 0; }

/* Éléments d'interface (tailles proches de l'application, lisibles) */
.tour__card { position: absolute; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-md); }
.tour__card--float { box-shadow: var(--shadow-card); z-index: 2; }
.tour__strong { font-size: 13px; font-weight: 700; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tour__meta { font-size: 12px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tour__b { font-size: 11px; padding: 2px 8px; flex-shrink: 0; }
.tour__doc-body { display: flex; flex-direction: column; min-width: 0; flex: 1; }
.tour__doc-ico { width: 30px; height: 30px; border-radius: 9px; background: var(--accent-soft); color: var(--accent); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

/* 1. Fiche du bien */
.tour__photo { position: absolute; left: 16px; top: 16px; width: 72%; height: 128px; object-fit: cover; border-radius: var(--radius-md); }
.tour__asset { left: 34%; right: -14px; bottom: 14px; padding: 12px 14px; display: flex; flex-direction: column; gap: 3px; }
.tour__row-top { display: flex; align-items: center; gap: 8px; }
.tour__tabs { display: flex; gap: 4px; margin-top: 6px; }
.tour__tab { font-size: 11.5px; font-weight: 600; color: var(--text-muted); padding: 3px 8px; border-radius: var(--radius-pill); border: 1px solid transparent; white-space: nowrap; }
.tour__tab--on { color: var(--accent); border-color: var(--accent); background: var(--accent-soft); }
.tour__kpis { display: flex; gap: 12px; font-size: 12px; color: var(--text-muted); margin-top: 4px; }
.tour__kpis b { color: var(--text-primary); }

/* 2. Documents */
.tour__doc { display: flex; align-items: center; gap: 10px; padding: 10px 12px; }
.tour__doc--back { left: 40px; right: 8px; top: 16px; }
.tour__doc--mid { left: 26px; right: 22px; top: 52px; }
.tour__doc--front { left: 12px; right: -18px; top: 98px; }
.tour__chips { position: absolute; left: 14px; bottom: 14px; display: flex; gap: 6px; }
.tour__chip { font-size: 11.5px; font-weight: 600; padding: 3px 10px; border-radius: var(--radius-pill); border: 1px solid var(--border); background: var(--bg-card); color: var(--text-muted); white-space: nowrap; }
.tour__chip--on { border-color: var(--accent); background: var(--accent-soft); color: var(--text-primary); }

/* 3. Informations extraites */
.tour__kv { left: 16px; right: -16px; top: 58px; padding: 10px 14px; display: flex; flex-direction: column; gap: 6px; }
.tour__kv-row { display: flex; gap: 10px; align-items: baseline; }
.tour__k { width: 72px; flex-shrink: 0; font-size: 11px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; color: var(--accent); }
.tour__v { font-size: 13px; font-weight: 700; color: var(--text-primary); white-space: nowrap; }
.tour__file { left: 40px; right: 14px; top: 14px; display: flex; align-items: center; gap: 8px; padding: 9px 12px; color: var(--accent); }
.tour__ok { margin-left: auto; display: inline-flex; align-items: center; gap: 3px; font-size: 11.5px; font-weight: 700; color: var(--accent); flex-shrink: 0; }

/* 4. Agenda */
.tour__agenda { left: 14px; right: -20px; top: 14px; padding: 6px 12px; display: flex; flex-direction: column; }
.tour__ev { display: flex; align-items: center; gap: 10px; padding: 7px 0; }
.tour__ev + .tour__ev { border-top: 1px solid var(--border-subtle); }
.tour__date { width: 40px; height: 40px; border-radius: 10px; background: var(--accent-soft); color: var(--accent); display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 9px; font-weight: 700; letter-spacing: .04em; flex-shrink: 0; }
.tour__date b { font-size: 15px; line-height: 1; letter-spacing: 0; }
.tour__date--late { background: var(--attention-soft); color: var(--attention-on-subtle); }
.tour__toast { left: 46px; right: 10px; bottom: 10px; display: flex; align-items: center; gap: 10px; padding: 9px 12px; }
.tour__toast-ico { width: 30px; height: 30px; border-radius: 50%; background: var(--accent); color: var(--on-accent); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

/* 5. Coût de possession */
.tour__cost { left: 14px; right: 40px; top: 14px; padding: 12px 14px; display: flex; flex-direction: column; gap: 5px; }
.tour__total { font-size: 24px; font-weight: 800; letter-spacing: -.02em; color: var(--text-primary); line-height: 1.1; margin-bottom: 2px; }
.tour__bar-row { display: flex; flex-direction: column; gap: 2px; }
.tour__bar-label { display: flex; justify-content: space-between; font-size: 12px; color: var(--text-muted); }
.tour__bar-label b { color: var(--text-primary); }
.tour__bar { height: 5px; border-radius: 3px; background: var(--accent-soft); overflow: hidden; }
.tour__bar-fill { display: block; height: 100%; min-width: 6px; border-radius: 3px; background: var(--accent); }
.tour__op { right: -16px; width: 62%; bottom: -8px; display: flex; align-items: center; gap: 10px; padding: 9px 12px; }

/* 6. Verebona vous répond (champ Verebona de la charte §5) */
.tour__ask { position: absolute; left: 14px; right: 14px; top: 14px; height: 38px; display: flex; align-items: center; gap: 8px; padding: 0 12px 0 6px; border-radius: var(--radius-pill); border: 1px solid var(--border); background: var(--bg-card); font-size: 13px; color: var(--text-primary); white-space: nowrap; overflow: hidden; }
.tour__ask-m { width: 26px; }
.tour__answer { position: absolute; left: 14px; right: 66px; top: 62px; font-size: 12.5px; line-height: 1.45; color: var(--text-primary); padding: 10px 12px; }
.tour__mascot { position: absolute; right: 0; bottom: 4px; width: 62px; }

/* Desktop : la démonstration y est portée par l'ordinateur et le téléphone
   (inchangés) ; la visite est la recomposition propre aux écrans étroits. */
@media (min-width: 861px) {
  .tour { display: none; }
}
@media (min-width: 600px) and (max-width: 860px) {
  .tour__slide { width: 300px; }
}
</style>
