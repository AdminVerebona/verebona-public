<template>
<!-- Application : ordinateur + téléphone (charte 2026 §6). Contenu et
     interactions du carrousel inchangés ; habillage clair de l'application. -->
<section class="app">
  <div class="vb-container">
    <ul class="app__tri r-stack">
      <li v-for="t in triptych" :key="t.title" class="vb-card app__tri-item">
        <span class="vb-tile"><VbIcon :name="t.icon" /></span>
        <span><span class="app__tri-title">{{ t.title }}</span><span class="app__tri-text">{{ t.text }}</span></span>
      </li>
    </ul>

    <template v-if="showMockup">
      <p class="vb-text app__intro">L'application Verebona, sur le web et sur mobile <strong>(iOS &amp; Android)</strong> — vos biens, documents et échéances toujours synchronisés.</p>
      <div class="app__devices">
        <!-- Ordinateur -->
        <div class="app__laptop">
          <div class="app__bezel">
            <span class="app__cam" aria-hidden="true"></span>
            <div class="app__screen">
              <div class="app__side">
                <div class="app__side-logo"><VbLogo :size="18" :wordmark="false" /><span>Verebona</span></div>
                <button v-for="(n, i) in nav" :key="n.label" type="button" :aria-pressed="n.active" class="app__side-btn" @click.prevent="n.onClick">
                  <VbIcon :name="sideIcons[i]" :size="16" />{{ sideLabels[i] }}
                </button>
                <div class="app__side-btn app__side-btn--static"><VbIcon name="calendar" :size="16" />Mes rappels</div>
              </div>
              <div class="app__main">
                <div class="app__top">
                  <div class="app__search"><VbIcon name="search" :size="14" />Rechercher…</div>
                  <span class="app__avatar" aria-hidden="true">LM</span>
                </div>
                <div class="app__body" aria-live="polite">
                  <!-- Tableau de bord -->
                  <template v-if="isDashboard">
                    <div class="app__stats">
                      <div v-for="s in stats" :key="s.label" class="app__stat">
                        <span :class="['app__stat-ico', s.attention ? 'app__stat-ico--att' : '']"><VbIcon :name="s.icon" :size="16" /></span>
                        <span><span class="app__cap">{{ s.label }}</span><span class="app__stat-n">{{ s.n }}</span></span>
                      </div>
                    </div>
                    <div class="app__cap app__cap--h">Mes rappels</div>
                    <div class="app__row app__row--late">
                      <span class="app__row-ico"><VbIcon name="calendar" :size="16" /></span>
                      <span class="app__row-body"><span class="app__row-title">Révision annuelle</span><span class="app__row-meta">Il y a 2 jours • Vélo Cargo Électrique</span></span>
                      <span class="vb-badge vb-badge--attention app__b">En retard (2 j)</span>
                    </div>
                    <div class="app__cap app__cap--h">Mes biens</div>
                    <div class="app__assets">
                      <div v-for="a in assets" :key="a.name" class="app__asset">
                        <img :src="a.img" :alt="a.name" class="app__asset-img" />
                        <div class="app__asset-body"><div class="app__row-title">{{ a.name }}</div><div class="app__row-meta">{{ a.dash }}</div></div>
                      </div>
                    </div>
                  </template>
                  <!-- Biens -->
                  <template v-if="isBiens">
                    <div class="app__head"><span class="app__h">Mes biens</span><span class="app__chips"><span class="app__chip app__chip--on">Tout</span><span class="app__chip">Actif</span><span class="app__chip">Archivé</span></span></div>
                    <div class="app__assets">
                      <div v-for="a in assets" :key="a.name" class="app__asset">
                        <img :src="a.img" :alt="a.name" class="app__asset-img app__asset-img--lg" />
                        <div class="app__asset-body"><div class="app__row-title">{{ a.name }}</div><div class="app__row-meta">{{ a.kind }}</div><div class="app__row-meta">{{ a.docs }}</div></div>
                      </div>
                    </div>
                  </template>
                  <!-- Événements -->
                  <template v-if="isEvents">
                    <div class="app__chips app__chips--mb"><span class="app__chip app__chip--on">Tout</span><span class="app__chip">À venir</span><span class="app__chip">En retard</span></div>
                    <div class="app__two">
                      <div v-for="e in events" :key="e.title" :class="['app__row', e.late ? 'app__row--late' : '']">
                        <span class="app__row-ico"><VbIcon name="calendar" :size="16" /></span>
                        <span class="app__row-body"><span class="app__row-title">{{ e.title }}</span><span class="app__row-meta">{{ e.meta }}</span></span>
                        <span :class="['vb-badge app__b', e.late ? 'vb-badge--attention' : '']">{{ e.state }}</span>
                      </div>
                    </div>
                  </template>
                  <!-- Documents -->
                  <template v-if="isDocs">
                    <div class="app__head"><div class="app__search app__search--sm"><VbIcon name="search" :size="14" />Rechercher un document…</div><span class="app__chips"><span class="app__chip app__chip--on">Tout</span><span class="app__chip">Facture</span><span class="app__chip">Notice</span></span></div>
                    <div class="app__two">
                      <div v-for="d in documents" :key="d.title" class="app__row">
                        <span class="app__row-ico"><VbIcon name="file" :size="16" /></span>
                        <span class="app__row-body"><span class="app__row-title">{{ d.title }}</span><span class="app__row-meta">{{ d.meta }}</span></span>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
          <div class="app__base" aria-hidden="true"></div>
        </div>

        <!-- Téléphone -->
        <div class="app__phone" aria-hidden="true">
          <div class="app__phone-screen">
            <div class="app__phone-status"><span>9:41</span><span class="app__notch"></span><span class="app__battery"></span></div>
            <div class="app__phone-body">
              <div class="app__side-logo"><VbLogo :size="18" :wordmark="false" /><span>Verebona</span></div>
              <div class="app__phone-hello">Bonjour, Léa</div>
              <div class="app__phone-stats">
                <div class="app__stat app__stat--col"><span class="app__cap">Biens</span><span class="app__stat-n">3</span></div>
                <div class="app__stat app__stat--col app__stat--att"><span class="app__cap">À traiter</span><span class="app__stat-n">1</span></div>
              </div>
              <div class="app__row app__row--late app__row--phone"><span class="app__row-body"><span class="app__row-title">Révision annuelle</span><span class="app__row-meta app__row-meta--att">En retard · Vélo Cargo</span></span></div>
              <div class="app__cap">Mes biens</div>
              <div v-for="a in assets.slice(0, 2)" :key="a.name" class="app__row">
                <img :src="a.img" alt="" class="app__thumb" />
                <span class="app__row-body"><span class="app__row-title">{{ a.name }}</span><span class="app__row-meta">{{ a.phone }}</span></span>
              </div>
              <div class="app__tabbar"><VbIcon name="home" :size="20" class="app__tab--on" /><VbIcon name="box" :size="20" /><VbIcon name="calendar" :size="20" /><VbIcon name="file" :size="20" /></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation du carrousel -->
      <div class="app__dots">
        <button type="button" class="app__arrow" aria-label="Écran précédent" @click.prevent="prev">‹</button>
        <div class="app__dots-list">
          <button v-for="d in dots" :key="d.label" type="button" :class="['app__dot', d.active ? 'app__dot--on' : '']" :aria-pressed="d.active" :aria-label="`Afficher : ${d.label}`" @click.prevent="d.onClick"></button>
        </div>
        <button type="button" class="app__arrow" aria-label="Écran suivant" @click.prevent="next">›</button>
      </div>
    </template>
  </div>
</section>
</template>

<script setup lang="ts">
import { useLanding } from '../composables/useLanding'
import VbIcon from '../components/VbIcon.vue'
import VbLogo from '../components/VbLogo.vue'
import type { IconName } from '../components/icons'

const { showMockup, nav, dots, isDashboard, isBiens, isEvents, isDocs, prev, next } = useLanding()

const triptych: Array<{ icon: IconName; title: string; text: string }> = [
  { icon: 'home', title: 'Biens', text: 'Logements, véhicules, objets' },
  { icon: 'file', title: 'Documents', text: 'Factures, garanties, contrats…' },
  { icon: 'calendar', title: 'Agendas', text: 'Échéances, entretiens, rappels…' },
]

const sideLabels = ['Accueil', 'Mes biens', 'Mes événements', 'Mes documents']
const sideIcons: IconName[] = ['home', 'box', 'calendar', 'file']

const stats: Array<{ icon: IconName; label: string; n: number; attention?: boolean }> = [
  { icon: 'box', label: 'Mes biens', n: 3 },
  { icon: 'calendar', label: 'Événements', n: 2 },
  { icon: 'file', label: 'Documents', n: 16 },
  { icon: 'check', label: 'À traiter', n: 0 },
]

const assets = [
  { name: 'Appartement Lyon', img: '/assets/appartement-lyon.webp', dash: 'Immobilier • 7 docs', kind: 'Immobilier • T3', docs: '7 documents', phone: '7 documents' },
  { name: 'Vélo Cargo', img: '/assets/velo-cargo.webp', dash: 'Véhicule • 6 docs', kind: 'Véhicule • Électrique', docs: '6 documents • 2 évén.', phone: '6 documents · 2 évén.' },
  { name: 'Planche de Surf', img: '/assets/surf-personal.webp', dash: 'Loisir • 3 docs', kind: 'Sport / Loisir', docs: '3 documents', phone: '3 documents' },
]

const events = [
  { title: 'Révision annuelle', meta: 'Vélo Cargo • Il y a 2 jours', state: 'En retard', late: true },
  { title: 'Contrôle technique', meta: 'Voiture familiale • Dans 12 j', state: 'À venir', late: false },
  { title: 'Renouvellement bail', meta: 'Appartement Lyon • Dans 3 mois', state: 'À venir', late: false },
  { title: 'Assurance habitation', meta: 'Appartement Lyon • Dans 4 mois', state: 'À venir', late: false },
]

const documents = [
  { title: 'Facture achat vélo', meta: 'Facture · Vélo Cargo · 12/03/2024' },
  { title: 'Attestation assurance', meta: 'Assurance · Appart. Lyon · 01/01/2025' },
  { title: 'Notice technique', meta: 'Notice · Vélo Cargo · 12/03/2024' },
  { title: 'Contrat de bail', meta: 'Contrat · Appart. Lyon · 15/09/2023' },
  { title: 'Facture planche surf', meta: 'Facture · Planche · 05/06/2023' },
  { title: 'PV remise des clés', meta: 'Admin · Appart. Lyon · 15/09/2023' },
]
</script>

<style>
.app { padding: 72px var(--gutter) 24px; }
.app__tri { list-style: none; margin: 0 0 48px; padding: 0; display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.app__tri-item { display: flex; align-items: center; gap: 16px; padding: 20px 22px; }
.app__tri-title { display: block; font-size: 19px; font-weight: 700; color: var(--text-heading); letter-spacing: -.01em; }
.app__tri-text { display: block; font-size: 14.5px; color: var(--text-muted); }
.app__intro { text-align: center; max-width: 640px; margin: 0 auto 28px; }
.app__intro strong { color: var(--text-primary); }

.app__devices { display: flex; align-items: flex-end; gap: 32px; max-width: 1000px; margin: 0 auto; }
.app__laptop { flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: center; }
.app__bezel { width: 92%; background: #1E2A2F; border-radius: 16px 16px 0 0; padding: 16px 14px 18px; border: 1px solid #3A4A51; border-bottom: 0; position: relative; }
.app__cam { position: absolute; top: 6px; left: 50%; transform: translateX(-50%); width: 6px; height: 6px; border-radius: 50%; background: #0B1114; }
.app__base { width: 100%; height: 14px; background: #C9D1CF; border-radius: 3px 3px 11px 11px; }
.app__screen { border-radius: 6px; overflow: hidden; background: var(--bg-page); display: flex; height: 400px; }
.app__side { width: 180px; flex-shrink: 0; background: var(--bg-sidebar); border-right: 1px solid var(--border-subtle); padding: 14px 10px; display: flex; flex-direction: column; gap: 4px; }
.app__side-logo { display: flex; align-items: center; gap: 8px; padding: 0 6px 12px; font-size: 13px; font-weight: 700; color: var(--text-heading); }
.app__side-btn {
  display: flex; align-items: center; gap: 9px; height: 32px; padding: 0 10px; border-radius: var(--radius-sm); border: 0;
  border-left: 2px solid transparent; background: transparent; color: var(--text-muted); font-size: 12px; font-weight: 500;
  text-align: left; cursor: pointer; transition: background-color var(--dur) var(--ease), color var(--dur) var(--ease);
}
.app__side-btn:hover { color: var(--accent); }
.app__side-btn[aria-pressed="true"] { background: var(--accent-soft); border-left-color: var(--accent); color: var(--accent); font-weight: 700; }
.app__side-btn--static { cursor: default; }
.app__main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.app__top { height: 44px; flex-shrink: 0; border-bottom: 1px solid var(--border-subtle); display: flex; align-items: center; gap: 10px; padding: 0 16px; }
.app__search { flex: 1; max-width: 260px; height: 28px; border-radius: var(--radius-pill); border: 1px solid var(--border); background: var(--bg-card); display: flex; align-items: center; gap: 6px; padding: 0 10px; font-size: 11.5px; color: var(--text-muted); }
.app__search--sm { max-width: 220px; }
.app__avatar { margin-left: auto; width: 26px; height: 26px; border-radius: 50%; background: var(--accent); color: var(--on-accent); font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
.app__body { flex: 1; overflow: hidden; padding: 18px 20px; }
.app__stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px; }
.app__stat { padding: 11px; border-radius: var(--radius-md); background: var(--bg-card); border: 1px solid var(--border); display: flex; align-items: center; gap: 10px; }
.app__stat--col { flex-direction: column; align-items: flex-start; gap: 2px; }
.app__stat--att { background: var(--attention-soft); border-color: var(--attention-edge); }
.app__stat-ico { width: 30px; height: 30px; border-radius: 9px; background: var(--accent-soft); color: var(--accent); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.app__stat-ico--att { background: var(--attention-soft); color: var(--attention-on-subtle); }
.app__cap { display: block; font-size: 10.5px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; color: var(--text-muted); }
.app__cap--h { margin-bottom: 8px; }
.app__stat-n { display: block; font-size: 18px; font-weight: 800; color: var(--text-primary); }
.app__row { position: relative; display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: var(--radius-md); background: var(--bg-card); border: 1px solid var(--border); margin-bottom: 0; overflow: hidden; }
.app__row--late::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: var(--attention); }
.app__body > .app__row { margin-bottom: 16px; }
.app__row-ico { width: 32px; height: 32px; border-radius: 9px; background: var(--accent-soft); color: var(--accent); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.app__row--late .app__row-ico { background: var(--attention-soft); color: var(--attention-on-subtle); }
.app__row-body { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.app__row-title { font-size: 12px; font-weight: 700; color: var(--text-primary); }
.app__row-meta { font-size: 10.5px; color: var(--text-muted); }
.app__row-meta--att { color: var(--attention); font-weight: 600; }
.app__b { font-size: 10px; padding: 2px 8px; }
.app__assets { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.app__asset { border-radius: var(--radius-md); overflow: hidden; background: var(--bg-card); border: 1px solid var(--border); }
.app__asset-img { display: block; width: 100%; height: 76px; object-fit: cover; }
.app__asset-img--lg { height: 120px; }
.app__asset-body { padding: 9px 10px; }
.app__head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
.app__h { font-size: 14px; font-weight: 800; color: var(--text-primary); }
.app__chips { display: flex; gap: 6px; }
.app__chips--mb { margin-bottom: 14px; }
.app__chip { padding: 3px 11px; border-radius: var(--radius-pill); border: 1px solid var(--border); font-size: 11px; font-weight: 600; color: var(--text-muted); }
.app__chip--on { border-color: var(--accent); background: var(--accent-soft); color: var(--text-primary); }
.app__two { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

.app__phone { flex-shrink: 0; width: 246px; border-radius: 46px; padding: 7px; background: #1E2A2F; border: 1px solid #3A4A51; }
.app__phone-screen { border-radius: 40px; overflow: hidden; background: var(--bg-page); height: 486px; display: flex; flex-direction: column; }
.app__phone-status { height: 44px; flex-shrink: 0; display: flex; align-items: center; justify-content: space-between; padding: 6px 22px 0; font-size: 12.5px; font-weight: 700; color: var(--text-primary); }
.app__notch { width: 80px; height: 24px; border-radius: 14px; background: #0B1114; }
.app__battery { width: 22px; height: 11px; border-radius: 3px; border: 1.5px solid var(--text-primary); }
.app__phone-body { padding: 6px 16px 10px; display: flex; flex-direction: column; gap: 10px; flex: 1; overflow: hidden; }
.app__phone-hello { font-size: 16px; font-weight: 800; letter-spacing: -.02em; color: var(--text-primary); }
.app__phone-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.app__row--phone { padding-left: 15px; }
.app__thumb { width: 38px; height: 38px; border-radius: 9px; object-fit: cover; flex-shrink: 0; }
.app__tabbar { margin-top: auto; display: flex; justify-content: space-around; padding: 10px 4px 2px; border-top: 1px solid var(--border-subtle); color: var(--text-muted); }
.app__tab--on { color: var(--accent); }

.app__dots { display: flex; align-items: center; justify-content: center; gap: 14px; margin-top: 18px; }
.app__arrow { width: 36px; height: 36px; border-radius: 50%; border: 1px solid var(--border); background: var(--bg-card); color: var(--accent); cursor: pointer; font-size: 18px; line-height: 1; }
.app__dots-list { display: flex; gap: 4px; align-items: center; }
.app__dot { width: 24px; height: 24px; border: 0; padding: 0; background: transparent; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; }
.app__dot::before { content: ''; display: block; width: 8px; height: 8px; border-radius: 50%; background: var(--border); transition: background-color var(--dur) var(--ease); }
.app__dot--on::before { background: var(--accent); }

@media (max-width: 860px) {
  .app { padding: 48px 20px 8px; }
  .app__tri { margin-bottom: 36px; gap: 12px; }
  .app__laptop, .app__dots { display: none; }
  .app__devices { justify-content: center; }
}
</style>
