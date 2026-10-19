<template>
<!-- Fonctionnalités (#features) — lot 71P : fusion de la visite « Verebona en
     six vues » (lots 69P / 70P) et des anciennes cartes Fonctionnalités
     (décision PO du 19/10). Neuf vues, chacune : un cadrage partiel de
     l'interface construit en HTML/CSS (texte réel, décoratif pour les
     lecteurs d'écran : `aria-hidden`), puis un titre H3 et une phrase en
     TEXTE RÉEL. Rien n'est focalisable dans les vues.
     UN SEUL composant responsive, un seul exemplaire du texte dans le HTML :
     carrousel natif sous 768 px (boutons nommés, position, swipe, aucun
     défilement automatique) ; dès 768 px la même liste devient une grille
     (2 colonnes, puis 3 × 3 dès 1000 px). Quand rien ne défile (grille), la
     piste n'est plus un arrêt de tabulation ni annoncée comme carrousel, et
     les boutons sont masqués. -->
<section id="features" class="vb-section feat">
  <div class="vb-container">
    <div class="feat__intro">
      <span class="vb-eyebrow">Fonctionnalités</span>
      <h2 id="feat-title" class="vb-h2 feat__title">Ce que Verebona vous permet de faire.</h2>
      <p class="vb-text">Des bénéfices concrets, pour reprendre le contrôle de ce que vous possédez.</p>
    </div>
    <div class="feat__views vb-carousel vb-carousel--bleed" role="region" :aria-roledescription="scrolls ? 'carrousel' : undefined" aria-labelledby="feat-title">
      <ul id="feat-track" ref="track" class="vb-carousel__track feat__track" :tabindex="scrolls ? 0 : undefined"
        :aria-label="scrolls ? 'Fonctionnalités, défilement horizontal' : 'Fonctionnalités'">
        <li v-for="(v, i) in views" :key="v.key" :class="['feat__item', `feat__item--${v.key}`]" :data-view="v.key">
          <div class="feat__stage" aria-hidden="true">
            <!-- 1. Fiche du bien : photo recadrée + carte d'identité qui la chevauche -->
            <template v-if="v.key === 'bien'">
              <img class="feat__photo" src="/assets/appartement-lyon.webp" alt="" width="290" height="200" loading="lazy" decoding="async" />
              <div class="feat__ui feat__ui--float feat__asset">
                <div class="feat__row-top"><span class="feat__strong">Appartement Lyon</span><span class="vb-badge feat__b">Actif</span></div>
                <span class="feat__meta">Immobilier · Appartement</span>
                <span class="feat__tabs"><span class="feat__tab feat__tab--on">Aperçu</span><span class="feat__tab">Informations</span><span class="feat__tab">Documents</span></span>
                <span class="feat__kpis"><span><b>7</b> documents</span><span><b>2</b> échéances</span></span>
              </div>
            </template>

            <!-- 2. Documents : pile décalée de documents classés -->
            <template v-else-if="v.key === 'docs'">
              <div class="feat__ui feat__doc feat__doc--back"><span class="feat__ico"><VbIcon name="file" :size="16" /></span><span class="feat__strong">Contrat de bail</span></div>
              <div class="feat__ui feat__doc feat__doc--mid"><span class="feat__ico"><VbIcon name="file" :size="16" /></span><span class="feat__col"><span class="feat__strong">Attestation d’assurance</span><span class="feat__meta">Appartement Lyon · 01/01/2026</span></span></div>
              <div class="feat__ui feat__ui--float feat__doc feat__doc--front">
                <span class="feat__ico"><VbIcon name="file" :size="16" /></span>
                <span class="feat__col"><span class="feat__strong">Facture achat vélo</span><span class="feat__meta">Vélo Cargo · 12/03/2024</span></span>
                <span class="vb-badge feat__b">Facture</span>
              </div>
              <span class="feat__chips feat__chips--bottom"><span class="feat__chip feat__chip--on">Tout · 16</span><span class="feat__chip">Factures · 5</span><span class="feat__chip">Contrats · 2</span></span>
            </template>

            <!-- 3. Informations extraites : fichier déposé → fiche structurée -->
            <template v-else-if="v.key === 'infos'">
              <div class="feat__ui feat__kv">
                <span class="feat__kv-row"><span class="feat__k">Bien</span><span class="feat__v">Appartement Lyon</span></span>
                <span class="feat__kv-row"><span class="feat__k">Catégorie</span><span class="feat__v">Facture · Entretien</span></span>
                <span class="feat__kv-row"><span class="feat__k">Montant</span><span class="feat__v">145,00 €</span></span>
                <span class="feat__kv-row"><span class="feat__k">Date</span><span class="feat__v">12/03/2026</span></span>
              </div>
              <div class="feat__ui feat__ui--float feat__file"><VbIcon name="file" :size="15" /><span class="feat__strong">facture-chaudiere-2026.pdf</span><span class="feat__ok"><VbIcon name="check" :size="13" />Lu</span></div>
            </template>

            <!-- 4. Agenda : échéances datées + rappel qui se superpose -->
            <template v-else-if="v.key === 'agenda'">
              <div class="feat__ui feat__agenda">
                <span v-for="e in events" :key="e.title" class="feat__ev">
                  <span :class="['feat__date', e.late ? 'feat__date--late' : '']"><b>{{ e.d }}</b>{{ e.m }}</span>
                  <span class="feat__col"><span class="feat__strong">{{ e.title }}</span><span class="feat__meta">{{ e.asset }}</span></span>
                  <span :class="['vb-badge feat__b', e.late ? 'vb-badge--attention' : '']">{{ e.state }}</span>
                </span>
              </div>
              <div class="feat__ui feat__ui--float feat__toast"><span class="feat__round"><VbIcon name="bell" :size="15" /></span><span class="feat__col"><span class="feat__strong">Rappel</span><span class="feat__meta">Contrôle technique dans 7 jours</span></span></div>
            </template>

            <!-- 5. Coût de possession : total + répartition (libellés et montants écrits) -->
            <template v-else-if="v.key === 'cout'">
              <div class="feat__ui feat__cost">
                <span class="feat__meta">Vélo Cargo · depuis l’achat</span>
                <span class="feat__total">2 180 €</span>
                <span v-for="c in costs" :key="c.label" class="feat__bar-row">
                  <span class="feat__bar-label"><span>{{ c.label }}</span><b>{{ c.amount }}</b></span>
                  <span class="feat__bar"><span class="feat__bar-fill" :style="{ width: c.pct + '%' }"></span></span>
                </span>
              </div>
              <div class="feat__ui feat__ui--float feat__op"><span class="feat__ico"><VbIcon name="euro" :size="15" /></span><span class="feat__col"><span class="feat__strong">Révision annuelle</span><span class="feat__meta">Entretien · 85,00 €</span></span></div>
            </template>

            <!-- 6. Verebona vous répond : champ de question + réponse de la mascotte -->
            <template v-else-if="v.key === 'question'">
              <div class="feat__ask"><img class="vb-mascot feat__ask-m" src="/assets/mascot/neutral.webp" alt="" width="26" height="26" loading="lazy" decoding="async" /><span>Dernier entretien de la chaudière ?</span></div>
              <div class="vb-bubble feat__answer">Le <b>12/03/2026</b>, pour 145,00 € — facture rattachée à l’Appartement Lyon. Prochain entretien : <b>mars 2027</b>.</div>
              <img class="vb-mascot feat__mascot" src="/assets/mascot/thumbs-up.webp" alt="" width="84" height="84" loading="lazy" decoding="async" />
            </template>

            <!-- 7. Espace à jour : fiche presque complète, information à compléter -->
            <template v-else-if="v.key === 'ajour'">
              <div class="feat__ui feat__fill">
                <span class="feat__bar-label"><span class="feat__strong">Fiche presque complète</span><b>82 %</b></span>
                <span class="feat__bar"><span class="feat__bar-fill" style="width: 82%"></span></span>
                <span class="feat__meta">Vélo Cargo · 1 information à compléter</span>
                <span class="feat__check"><VbIcon name="check" :size="14" />Facture d’achat</span>
                <span class="feat__check"><VbIcon name="check" :size="14" />Photos du bien</span>
                <span class="feat__check feat__check--todo"><span class="feat__todo-dot"></span>Numéro de série<span class="vb-badge vb-badge--attention feat__b">À compléter</span></span>
              </div>
              <div class="feat__ui feat__ui--float feat__field"><span class="feat__k">Numéro de série</span><span class="feat__input">VC-2024-0187<span class="feat__caret"></span></span></div>
            </template>

            <!-- 8. Dossier complet : pièces réunies → archive prête -->
            <template v-else-if="v.key === 'dossier'">
              <span class="feat__chips feat__chips--top"><span class="feat__chip feat__chip--on">Vente</span><span class="feat__chip">Assurance</span><span class="feat__chip">Succession</span></span>
              <div class="feat__ui feat__pack">
                <span class="feat__meta">Dossier de vente · Vélo Cargo</span>
                <span class="feat__check"><VbIcon name="check" :size="14" />Facture d’achat</span>
                <span class="feat__check"><VbIcon name="check" :size="14" />Carnet d’entretien</span>
                <span class="feat__check"><VbIcon name="check" :size="14" />Certificat de garantie</span>
              </div>
              <div class="feat__ui feat__ui--float feat__zip">
                <span class="feat__ico"><VbIcon name="download" :size="15" /></span>
                <span class="feat__col"><span class="feat__strong">Dossier_vente.zip</span><span class="feat__meta">6 documents · 2 événements</span></span>
                <span class="vb-badge feat__b">Prêt</span>
              </div>
            </template>

            <!-- 9. Espace Duo : espace commun à deux, activité de chacun -->
            <template v-else>
              <div class="feat__ui feat__duo">
                <span class="feat__duo-head">
                  <span class="feat__avatars"><span>Lé</span><span>Ma</span></span>
                  <span class="feat__col"><span class="feat__strong">Espace commun</span><span class="feat__meta">Léa &amp; Marc · 2 membres</span></span>
                </span>
                <span class="feat__duo-row"><span class="feat__strong">Vélo Cargo</span><span class="feat__meta">modifié par Marc</span></span>
                <span class="feat__duo-row"><span class="feat__strong">Appartement Lyon</span><span class="feat__meta">ajouté par Léa</span></span>
              </div>
              <div class="feat__ui feat__ui--float feat__toast feat__toast--duo"><span class="feat__round feat__round--ma">Ma</span><span class="feat__col"><span class="feat__strong">Marc a ajouté une facture</span><span class="feat__meta">Vélo Cargo · à l’instant</span></span></div>
            </template>
          </div>
          <h3 class="vb-h3 feat__h3"><span class="feat__num" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>{{ v.title }}</h3>
          <p class="feat__text">{{ v.text }}</p>
        </li>
      </ul>
      <CarouselControls controls="feat-track" prev-label="Fonctionnalité précédente" next-label="Fonctionnalité suivante"
        :at-start="car.atStart.value" :at-end="car.atEnd.value" :count="views.length"
        :first="car.first.value" :last="car.first.value" :position="`${car.first.value + 1} / ${views.length}`" :status="car.status.value"
        @prev="car.prev" @next="car.next" />
    </div>
  </div>
</section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useScrollCarousel } from '../composables/useScrollCarousel'
import VbIcon from '../components/VbIcon.vue'
import CarouselControls from '../components/CarouselControls.vue'
import { FEATURE_COSTS as costs, FEATURE_EVENTS as events, FEATURES as views } from './features'

const car = useScrollCarousel({
  count: views.length,
  step: 'one',
  announce: (f) => `Fonctionnalité ${f + 1} sur ${views.length} : ${views[f].title}`,
})
const track = car.track
// Piste réellement défilante (carrousel) ou grille entièrement visible.
// Vrai au prérendu (aucune mesure possible) : le HTML statique reste celui du
// carrousel accessible ; la mesure au montage corrige pour la grille.
const scrolls = computed(() => car.overflow.value)
</script>

<style>
/* Fonctionnalités — cadrages partiels, deux niveaux de profondeur au plus
   (charte §6), une seule ombre (carte flottante), bordures 1 px, aplats,
   aucune animation propre. */
.feat__intro { max-width: 640px; margin-bottom: var(--sp-6); }
.feat__title { margin-bottom: 14px; }
.feat__item { width: min(300px, 80vw); display: flex; flex-direction: column; }
.feat__stage {
  position: relative; height: 204px; border-radius: var(--radius-lg); overflow: hidden;
  background: var(--bg-section); border: 1px solid var(--border-subtle); margin-bottom: 14px;
}
.feat__item:nth-child(even) .feat__stage { background: var(--bg-sidebar); }
.feat__h3 { display: flex; align-items: baseline; gap: 10px; margin: 0 0 6px; color: var(--text-heading); }
.feat__num { font-size: 14px; font-weight: 700; color: var(--attention); font-variant-numeric: tabular-nums; }
.feat__text { font-size: 15.5px; line-height: 1.55; color: var(--text-muted); margin: 0; }

/* Éléments d'interface (tailles proches de l'application, lisibles) */
.feat__ui { position: absolute; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-md); }
.feat__ui--float { box-shadow: var(--shadow-card); z-index: 2; }
.feat__strong { font-size: 13px; font-weight: 700; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.feat__meta { font-size: 12px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.feat__b { font-size: 11px; padding: 2px 8px; flex-shrink: 0; }
.feat__col { display: flex; flex-direction: column; min-width: 0; flex: 1; }
.feat__ico { width: 30px; height: 30px; border-radius: 9px; background: var(--accent-soft); color: var(--accent); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.feat__round { width: 30px; height: 30px; border-radius: 50%; background: var(--accent); color: var(--on-accent); display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 11px; font-weight: 700; }
.feat__chips { position: absolute; left: 14px; display: flex; gap: 6px; }
.feat__chips--bottom { bottom: 14px; }
.feat__chips--top { top: 14px; }
.feat__chip { font-size: 11.5px; font-weight: 600; padding: 3px 10px; border-radius: var(--radius-pill); border: 1px solid var(--border); background: var(--bg-card); color: var(--text-muted); white-space: nowrap; }
.feat__chip--on { border-color: var(--accent); background: var(--accent-soft); color: var(--text-primary); }
.feat__k { width: 72px; flex-shrink: 0; font-size: 11px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; color: var(--accent); }
.feat__check { display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: var(--text-primary); white-space: nowrap; }
.feat__check .vb-icon { color: var(--accent); flex-shrink: 0; }
.feat__check--todo { color: var(--attention-on-subtle); font-weight: 600; }
.feat__check--todo .feat__b { margin-left: auto; }
.feat__todo-dot { width: 10px; height: 10px; border-radius: 50%; border: 1px solid var(--attention-on-subtle); margin: 0 2px; flex-shrink: 0; }

/* 1. Fiche du bien */
.feat__photo { position: absolute; left: 16px; top: 16px; width: 72%; height: 128px; object-fit: cover; border-radius: var(--radius-md); }
.feat__asset { left: 34%; right: -14px; bottom: 14px; padding: 12px 14px; display: flex; flex-direction: column; gap: 3px; }
.feat__row-top { display: flex; align-items: center; gap: 8px; }
.feat__tabs { display: flex; gap: 4px; margin-top: 6px; }
.feat__tab { font-size: 11.5px; font-weight: 600; color: var(--text-muted); padding: 3px 8px; border-radius: var(--radius-pill); border: 1px solid transparent; white-space: nowrap; }
.feat__tab--on { color: var(--accent); border-color: var(--accent); background: var(--accent-soft); }
.feat__kpis { display: flex; gap: 12px; font-size: 12px; color: var(--text-muted); margin-top: 4px; }
.feat__kpis b { color: var(--text-primary); }

/* 2. Documents */
.feat__doc { display: flex; align-items: center; gap: 10px; padding: 10px 12px; }
.feat__doc--back { left: 40px; right: 8px; top: 16px; }
.feat__doc--mid { left: 26px; right: 22px; top: 52px; }
.feat__doc--front { left: 12px; right: -18px; top: 98px; }

/* 3. Informations extraites */
.feat__kv { left: 16px; right: -16px; top: 58px; padding: 10px 14px; display: flex; flex-direction: column; gap: 6px; }
.feat__kv-row { display: flex; gap: 10px; align-items: baseline; }
.feat__v { font-size: 13px; font-weight: 700; color: var(--text-primary); white-space: nowrap; }
.feat__file { left: 40px; right: 14px; top: 14px; display: flex; align-items: center; gap: 8px; padding: 9px 12px; color: var(--accent); }
.feat__ok { margin-left: auto; display: inline-flex; align-items: center; gap: 3px; font-size: 11.5px; font-weight: 700; color: var(--accent); flex-shrink: 0; }

/* 4. Agenda */
.feat__agenda { left: 14px; right: -20px; top: 14px; padding: 6px 12px; display: flex; flex-direction: column; }
.feat__ev { display: flex; align-items: center; gap: 10px; padding: 7px 0; }
.feat__ev + .feat__ev { border-top: 1px solid var(--border-subtle); }
.feat__date { width: 40px; height: 40px; border-radius: 10px; background: var(--accent-soft); color: var(--accent); display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 9px; font-weight: 700; letter-spacing: .04em; flex-shrink: 0; }
.feat__date b { font-size: 15px; line-height: 1; letter-spacing: 0; }
.feat__date--late { background: var(--attention-soft); color: var(--attention-on-subtle); }
.feat__toast { left: 46px; right: 10px; bottom: 10px; display: flex; align-items: center; gap: 10px; padding: 9px 12px; }

/* 5. Coût de possession */
.feat__cost { left: 14px; right: 40px; top: 14px; padding: 12px 14px; display: flex; flex-direction: column; gap: 5px; }
.feat__total { font-size: 24px; font-weight: 800; letter-spacing: -.02em; color: var(--text-primary); line-height: 1.1; margin-bottom: 2px; }
.feat__bar-row { display: flex; flex-direction: column; gap: 2px; }
.feat__bar-label { display: flex; justify-content: space-between; gap: 8px; font-size: 12px; color: var(--text-muted); }
.feat__bar-label b { color: var(--text-primary); }
.feat__bar { height: 5px; border-radius: 3px; background: var(--accent-soft); overflow: hidden; flex-shrink: 0; }
.feat__bar-fill { display: block; height: 100%; min-width: 6px; border-radius: 3px; background: var(--accent); }
.feat__op { right: -16px; width: 62%; bottom: -8px; display: flex; align-items: center; gap: 10px; padding: 9px 12px; }

/* 6. Verebona vous répond (champ Verebona de la charte §5) */
.feat__ask { position: absolute; left: 14px; right: 14px; top: 14px; height: 38px; display: flex; align-items: center; gap: 8px; padding: 0 12px 0 6px; border-radius: var(--radius-pill); border: 1px solid var(--border); background: var(--bg-card); font-size: 13px; color: var(--text-primary); white-space: nowrap; overflow: hidden; }
.feat__ask-m { width: 26px; }
.feat__answer { position: absolute; left: 14px; right: 66px; top: 62px; font-size: 12.5px; line-height: 1.45; color: var(--text-primary); padding: 10px 12px; }
.feat__mascot { position: absolute; right: 0; bottom: 4px; width: 62px; }

/* 7. Espace toujours à jour */
.feat__fill { left: 14px; right: 30px; top: 14px; padding: 12px 14px; display: flex; flex-direction: column; gap: 6px; }
.feat__fill .feat__meta { margin-bottom: 2px; }
.feat__field { left: 46px; right: -14px; bottom: 10px; display: flex; align-items: center; gap: 10px; padding: 8px 12px; }
.feat__field .feat__k { width: auto; }
.feat__input { flex: 1; display: flex; align-items: center; min-width: 0; height: 28px; padding: 0 10px; border-radius: var(--radius-sm); border: 1px solid var(--accent); font-size: 12.5px; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; }
.feat__caret { width: 1px; height: 14px; margin-left: 2px; background: var(--accent); }

/* 8. Dossier complet */
.feat__pack { left: 14px; right: 40px; top: 46px; padding: 10px 14px; display: flex; flex-direction: column; gap: 6px; }
.feat__zip { left: 34px; right: -14px; bottom: 10px; display: flex; align-items: center; gap: 10px; padding: 9px 12px; }

/* 9. Espace Duo */
.feat__duo { left: 14px; right: -16px; top: 14px; padding: 10px 14px; display: flex; flex-direction: column; gap: 4px; }
.feat__duo-head { display: flex; align-items: center; gap: 10px; padding-bottom: 6px; }
.feat__duo-row { display: flex; align-items: baseline; gap: 8px; padding-top: 6px; border-top: 1px solid var(--border-subtle); }
.feat__avatars { display: flex; flex-shrink: 0; }
.feat__avatars span { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: var(--on-accent); background: var(--accent); outline: 2px solid var(--bg-card); }
.feat__avatars span + span { margin-left: -8px; background: var(--vb-cuivre-texte); color: var(--vb-blanc); }
.feat__round--ma { background: var(--vb-cuivre-texte); color: var(--vb-blanc); }
.feat__toast--duo { left: 30px; right: 14px; }

@media (min-width: 600px) and (max-width: 767px) {
  .feat__item { width: 300px; }
}

/* ── Tablette et ordinateur : la même liste en grille ──
   Toutes les vues sont visibles d'un coup : rien à faire défiler, donc ni
   boutons ni position (seuls les boutons sont masqués, jamais les vues). */
@media (min-width: 768px) {
  .feat__intro { margin-bottom: var(--sp-12); }
  .feat__views.vb-carousel .feat__track {
    display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--sp-12) var(--sp-6);
    margin: 0; padding: 0; overflow: visible; scroll-snap-type: none;
  }
  .feat__item { width: auto; min-width: 0; }
  .feat__stage { height: 224px; margin-bottom: var(--sp-4); }
  .feat__text { font-size: 16px; max-width: 34em; }
  .feat__views .vb-carousel__controls { display: none; }
}
@media (min-width: 1000px) {
  .feat__views.vb-carousel .feat__track { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--sp-12) var(--sp-8); }
}
</style>
