<template>
<div class="vb-reveal" style="margin-top:64px">
  <div style="text-align:center;max-width:660px;margin:0 auto 30px">
    <h2 style="font-size:29px;font-weight:600;letter-spacing:-.02em;color:#fff;line-height:1.15;margin-bottom:11px">Emmenez Verebona partout avec vous</h2>
    <p style="font-size:16px;line-height:1.6;color:#95A1B8">Sur ordinateur ou sur mobile, retrouvez vos biens, vos documents et vos échéances où que vous soyez — toujours synchronisés.</p>
  </div>

  <div class="r-mock" style="display:flex;gap:22px;align-items:flex-end">
    <!-- Fenêtre navigateur -->
    <div class="r-browser" style="flex:1;min-width:0;display:flex;flex-direction:column;align-items:center">
      <div style="width:92%;background:#0A0E17;padding:9px 9px 10px;border-radius:16px;border:1px solid rgba(132,144,168,.28);box-shadow:0 42px 82px rgba(0,0,0,.55),inset 0 0 0 1px rgba(255,255,255,.03)">
        <div style="display:flex;justify-content:center;padding-bottom:7px"><span style="width:6px;height:6px;border-radius:50%;background:#141A26;box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.16)"></span></div>
        <div style="border-radius:6px;overflow:hidden;background:rgba(15,23,42,.96)">

          <!-- barre navigateur -->
          <div style="display:flex;align-items:center;gap:10px;padding:11px 16px;border-bottom:1px solid rgba(31,41,55,.9);background:rgba(9,14,28,.98)">
            <div style="display:flex;gap:7px">
              <span style="width:11px;height:11px;border-radius:50%;background:rgba(239,68,68,.7)"></span>
              <span style="width:11px;height:11px;border-radius:50%;background:rgba(245,158,11,.7)"></span>
              <span style="width:11px;height:11px;border-radius:50%;background:rgba(34,197,94,.7)"></span>
            </div>
            <div style="flex:1;display:flex;justify-content:center">
              <div style="padding:3px 14px;border-radius:6px;background:rgba(31,41,55,.8);font-size:11px;color:#64748B">app.verebona.fr</div>
            </div>
            <span style="font-size:11px;color:#64748B">{{ slides[current].label }}</span>
          </div>

          <div style="display:flex;height:440px;background:#020617">
            <!-- sidebar -->
            <div style="width:210px;flex-shrink:0;border-right:1px solid rgba(31,41,55,.6);background:rgba(15,23,42,.25);padding:16px 12px;display:flex;flex-direction:column;gap:5px">
              <div style="display:flex;align-items:center;gap:9px;padding:0 6px;margin-bottom:16px">
                <svg width="20" height="20" viewBox="0 0 32 32" fill="none" style="overflow:visible">
                  <rect x="0" y="0" width="9.14" height="9.14" rx="1.6" fill="#fff"/><rect x="11.43" y="0" width="9.14" height="9.14" rx="1.6" fill="#fff"/>
                  <rect x="0" y="11.43" width="9.14" height="9.14" rx="1.6" fill="#fff"/><rect x="11.43" y="11.43" width="9.14" height="9.14" rx="1.6" fill="#fff"/><rect x="22.86" y="11.43" width="9.14" height="9.14" rx="1.6" fill="#fff"/>
                  <rect x="0" y="22.86" width="9.14" height="9.14" rx="1.6" fill="#fff"/><rect x="11.43" y="22.86" width="9.14" height="9.14" rx="1.6" fill="#fff"/><rect x="22.86" y="22.86" width="9.14" height="9.14" rx="1.6" fill="#fff"/>
                  <rect x="22.86" y="-1.55" width="9.14" height="9.14" rx="1.6" fill="#2F6BFF" transform="rotate(18 27.43 3.02)"/>
                </svg>
                <span style="font-size:13px;font-weight:600;color:#E2E8F0">Verebona</span>
              </div>
              <button v-for="(s, i) in slides" :key="s.label" type="button" :style="navStyle(i === current)" @click="current = i">
                <span style="width:15px;height:15px;border-radius:4px;border:2px solid currentColor;opacity:.9"></span>{{ s.nav }}
              </button>
              <div style="display:flex;align-items:center;gap:11px;padding:9px 12px;border-radius:10px;font-size:12px;font-weight:600;color:#8892A6">
                <span style="width:15px;height:15px;border-radius:4px;border:2px solid currentColor;opacity:.9"></span>Mes rappels
              </div>
            </div>

            <!-- zone principale -->
            <div style="flex:1;display:flex;flex-direction:column;min-width:0">
              <div style="height:48px;flex-shrink:0;border-bottom:1px solid rgba(31,41,55,.6);display:flex;align-items:center;padding:0 18px;gap:12px">
                <div style="flex:1;max-width:240px;height:30px;border-radius:999px;background:rgba(15,23,42,.6);border:1px solid rgba(31,41,55,.7);display:flex;align-items:center;padding:0 14px;font-size:11.5px;color:#64748B">Rechercher…</div>
                <div style="margin-left:auto;width:28px;height:28px;border-radius:50%;background:#1E293B;border:1px solid rgba(71,85,105,.6);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#CBD5E1">LM</div>
              </div>

              <div style="flex:1;overflow:hidden;padding:22px">
                <!-- Tableau de bord -->
                <div v-if="current === 0">
                  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px">
                    <div v-for="s in stats" :key="s.label" style="padding:13px;border-radius:12px;background:rgba(15,23,42,.5);border:1px solid rgba(31,41,55,.6);display:flex;align-items:center;gap:11px">
                      <div :style="`width:32px;height:32px;border-radius:9px;background:${s.bg};color:${s.color};display:flex;align-items:center;justify-content:center;font-weight:700`">{{ s.icon }}</div>
                      <div>
                        <div style="font-size:10px;color:#64748B;text-transform:uppercase;font-weight:600">{{ s.label }}</div>
                        <div style="font-size:19px;font-weight:700;color:#E2E8F0">{{ s.value }}</div>
                      </div>
                    </div>
                  </div>
                  <div style="font-size:11px;font-weight:600;color:#94A3B8;text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px">Mes rappels</div>
                  <div v-for="r in reminders" :key="r.title" style="padding:12px 14px;border-radius:12px;background:rgba(15,23,42,.5);border:1px solid rgba(31,41,55,.6);display:flex;align-items:center;gap:12px;margin-bottom:10px">
                    <div :style="`width:34px;height:34px;border-radius:9px;background:${r.bg};color:${r.color};display:flex;align-items:center;justify-content:center;flex-shrink:0`">{{ r.icon }}</div>
                    <div style="flex:1;min-width:0">
                      <div style="font-size:12px;font-weight:600;color:#E2E8F0">{{ r.title }}</div>
                      <div style="font-size:10.5px;color:#64748B">{{ r.sub }}</div>
                    </div>
                    <span v-if="r.tag" :style="`font-size:9px;padding:2px 7px;border-radius:5px;color:${r.color};border:1px solid ${r.color}55`">{{ r.tag }}</span>
                  </div>
                </div>

                <!-- Mes biens -->
                <div v-else-if="current === 1" style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
                  <div v-for="b in biens" :key="b.name" style="border-radius:12px;overflow:hidden;background:rgba(15,23,42,.5);border:1px solid rgba(31,41,55,.6)">
                    <img :src="b.img" :alt="b.name" style="width:100%;height:88px;object-fit:cover;display:block">
                    <div style="padding:10px 12px">
                      <div style="font-size:12px;font-weight:600;color:#E2E8F0;margin-bottom:2px">{{ b.name }}</div>
                      <div style="font-size:10.5px;color:#64748B">{{ b.meta }}</div>
                    </div>
                  </div>
                </div>

                <!-- Mes événements -->
                <div v-else-if="current === 2">
                  <div v-for="e in events" :key="e.title" style="padding:11px 13px;border-radius:11px;background:rgba(15,23,42,.5);border:1px solid rgba(31,41,55,.6);display:flex;align-items:center;gap:11px;margin-bottom:10px">
                    <div :style="`width:34px;height:34px;border-radius:9px;background:${e.bg};color:${e.color};display:flex;align-items:center;justify-content:center;flex-shrink:0`">{{ e.icon }}</div>
                    <div style="flex:1;min-width:0">
                      <div style="font-size:11.5px;font-weight:600;color:#E2E8F0">{{ e.title }}</div>
                      <div style="font-size:10px;color:#64748B">{{ e.sub }}</div>
                    </div>
                    <span :style="`font-size:9px;padding:2px 7px;border-radius:5px;color:${e.color};border:1px solid ${e.color}55`">{{ e.tag }}</span>
                  </div>
                </div>

                <!-- Mes documents -->
                <div v-else>
                  <div v-for="d in docs" :key="d.name" style="padding:11px 13px;border-radius:11px;background:rgba(15,23,42,.5);border:1px solid rgba(31,41,55,.6);display:flex;align-items:center;gap:11px;margin-bottom:10px">
                    <div style="width:32px;height:32px;border-radius:8px;background:rgba(139,92,246,.12);color:#B49BFF;display:flex;align-items:center;justify-content:center;font-size:13px">▤</div>
                    <div style="flex:1;min-width:0">
                      <div style="font-size:11.5px;font-weight:600;color:#E2E8F0">{{ d.name }}</div>
                      <div style="font-size:10px;color:#64748B">{{ d.meta }}</div>
                    </div>
                    <span style="font-size:9px;padding:2px 7px;border-radius:5px;color:#4ADE80;border:1px solid rgba(74,222,128,.35)">Analysé</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- navigation -->
      <div class="r-dots" style="display:flex;align-items:center;justify-content:center;gap:14px;margin-top:16px">
        <button type="button" @click="prev" aria-label="Précédent" style="width:30px;height:30px;border-radius:50%;border:1px solid rgba(71,85,105,.6);background:rgba(15,23,42,.6);color:#94A3B8;cursor:pointer;font-size:15px">‹</button>
        <div style="display:flex;gap:7px;align-items:center">
          <button v-for="(s, i) in slides" :key="s.label" type="button" :aria-label="s.label" :style="dotStyle(i === current)" @click="current = i"></button>
        </div>
        <button type="button" @click="next" aria-label="Suivant" style="width:30px;height:30px;border-radius:50%;border:1px solid rgba(71,85,105,.6);background:rgba(15,23,42,.6);color:#94A3B8;cursor:pointer;font-size:15px">›</button>
      </div>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const current = ref(0)

const slides = [
  { label: 'Tableau de bord', nav: 'Accueil' },
  { label: 'Mes biens',       nav: 'Mes biens' },
  { label: 'Mes événements',  nav: 'Mes événements' },
  { label: 'Mes documents',   nav: 'Mes documents' },
]

const prev = () => { current.value = (current.value + slides.length - 1) % slides.length }
const next = () => { current.value = (current.value + 1) % slides.length }

const navStyle = (active: boolean) =>
  `display:flex;align-items:center;gap:11px;padding:9px 12px;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer;transition:all .15s;text-align:left;font-family:'Instrument Sans',sans-serif;border:1px solid ${active ? 'rgba(59,130,246,.35)' : 'transparent'};background:${active ? 'rgba(37,99,235,.14)' : 'transparent'};color:${active ? '#7EB0FF' : '#8892A6'}`

const dotStyle = (active: boolean) =>
  `height:6px;border-radius:99px;transition:all .25s;cursor:pointer;border:0;padding:0;width:${active ? '26px' : '6px'};background:${active ? '#2563EB' : 'rgba(148,163,184,.4)'}`

const stats = [
  { label: 'Mes biens',   value: '3',  icon: '◱', bg: 'rgba(59,130,246,.12)',  color: '#60A5FA' },
  { label: 'Événements',  value: '2',  icon: '◷', bg: 'rgba(245,158,11,.12)',  color: '#FBBF24' },
  { label: 'Documents',   value: '16', icon: '▤', bg: 'rgba(34,197,94,.12)',   color: '#4ADE80' },
  { label: 'À traiter',   value: '0',  icon: '!', bg: 'rgba(239,68,68,.12)',   color: '#F87171' },
]

const reminders = [
  { title: 'Révision annuelle', sub: 'Il y a 2 jours • Vélo Cargo Électrique', icon: '◷', bg: 'rgba(239,68,68,.1)',  color: '#F87171', tag: 'En retard' },
  { title: 'Assurance habitation', sub: 'Dans 12 jours • Appartement Lyon',    icon: '◷', bg: 'rgba(245,158,11,.1)', color: '#FBBF24', tag: 'À venir' },
]

const biens = [
  { name: 'Appartement Lyon',       meta: '8 documents • 2 événements', img: '/assets/appartement-lyon.webp' },
  { name: 'Vélo Cargo Électrique',  meta: '5 documents • 1 événement',  img: '/assets/velo-cargo.webp' },
  { name: 'Planche de surf',        meta: '3 documents',                img: '/assets/surf-personal.webp' },
]

const events = [
  { title: 'Révision annuelle',    sub: 'Vélo Cargo • Il y a 2 jours',     icon: '◷', bg: 'rgba(239,68,68,.1)',  color: '#F87171', tag: 'En retard' },
  { title: 'Assurance habitation', sub: 'Appartement Lyon • Dans 12 jours', icon: '◷', bg: 'rgba(245,158,11,.1)', color: '#FBBF24', tag: 'À venir' },
  { title: 'Contrôle technique',   sub: 'Vélo Cargo • Dans 2 mois',        icon: '◷', bg: 'rgba(59,130,246,.1)', color: '#60A5FA', tag: 'Planifié' },
]

const docs = [
  { name: 'Facture achat vélo.pdf',        meta: 'Vélo Cargo • 12 mars 2025' },
  { name: 'Attestation assurance.pdf',     meta: 'Appartement Lyon • 3 janv. 2025' },
  { name: 'Diagnostic énergétique.pdf',    meta: 'Appartement Lyon • 18 nov. 2024' },
]
</script>
