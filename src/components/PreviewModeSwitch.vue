<template>
  <!-- Sélecteur FULL / PRELAUNCH — préproduction et local uniquement (CDC pré-lancement §8.2).
       Jamais chargé en production : voir App.vue. -->
  <div
    class="vb-preview-switch"
    role="group"
    aria-label="Prévisualisation du mode du site"
    data-testid="preview-mode-switch"
    style="position:fixed;left:14px;bottom:14px;z-index:70;display:flex;align-items:center;gap:8px;padding:6px 6px 6px 12px;border-radius:999px;background:#FFFFFF;border:1px dashed #AA4E38;box-shadow:0 12px 32px rgba(38,53,59,.08);font-size:12px;color:#26353B"
  >
    <span style="font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#AA4E38">{{ environment }}</span>
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
  `background:${active ? '#17474D' : 'transparent'};color:${active ? '#FFFFFF' : '#52636A'}`
</script>
