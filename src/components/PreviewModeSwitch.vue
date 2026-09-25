<template>
  <!-- Sélecteur FULL / PRELAUNCH — préproduction et local uniquement (CDC pré-lancement §8.2).
       Jamais chargé en production : voir App.vue. -->
  <div
    class="vb-preview-switch"
    role="group"
    aria-label="Prévisualisation du mode du site"
    data-testid="preview-mode-switch"
    style="position:fixed;left:14px;bottom:14px;z-index:70;display:flex;align-items:center;gap:8px;padding:6px 6px 6px 12px;border-radius:999px;background:rgba(7,14,32,.92);border:1px solid rgba(250,204,21,.45);box-shadow:0 10px 30px rgba(4,10,26,.45);backdrop-filter:blur(10px);font-family:'Instrument Sans','Instrument Sans Fallback',sans-serif;font-size:12px;color:#FDE68A"
  >
    <span style="font-weight:700;letter-spacing:.08em;text-transform:uppercase">{{ environment }}</span>
    <button
      v-for="option in options"
      :key="option.mode"
      type="button"
      :aria-pressed="siteMode === option.mode"
      :style="buttonStyle(siteMode === option.mode)"
      @click="select(option.mode)"
    >{{ option.label }}</button>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { SITE_MODE_PARAM, useSiteMode, type SiteMode } from '../config/site'

const { siteMode, environment } = useSiteMode()
const route = useRoute()
const router = useRouter()

const options: { mode: SiteMode; label: string }[] = [
  { mode: 'full', label: 'FULL' },
  { mode: 'prelaunch', label: 'PRELAUNCH' },
]

/** Passe par l'URL : le choix reste partageable et survit au rechargement. */
function select(mode: SiteMode) {
  if (mode === siteMode.value) return
  router.replace({ path: route.path, hash: route.hash, query: { ...route.query, [SITE_MODE_PARAM]: mode } })
}

const buttonStyle = (active: boolean) =>
  `border:0;border-radius:999px;padding:6px 11px;font:inherit;font-weight:700;cursor:${active ? 'default' : 'pointer'};` +
  `background:${active ? '#FACC15' : 'transparent'};color:${active ? '#0B1324' : '#FDE68A'}`
</script>
