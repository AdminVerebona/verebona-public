<template>
<template v-if="visible && !isPrelaunch">
<div class="r-fixedcta mcta">
  <a :href="signupUrl()" class="vb-btn vb-btn--primary vb-btn--block">Essayer gratuitement pendant 7 jours</a>
</div>
</template>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { signupUrl } from '../config/urls'
import { useSiteMode } from '../config/site'

// PRELAUNCH : barre non rendue — un bandeau fixe sans action n'aurait pas de
// sens, et aucun lien d'inscription ne doit subsister (CDC pré-lancement §7).
const { isPrelaunch } = useSiteMode()

// CTA fixe mobile : apparaît après le premier défilement (~480 px).
// Masqué sur desktop via .r-fixedcta (style.css).
const visible = ref(false)
let onScroll: (() => void) | null = null
onMounted(() => {
  onScroll = () => { visible.value = window.scrollY > 480 }
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
onUnmounted(() => { if (onScroll) window.removeEventListener('scroll', onScroll) })
</script>

<style>
/* Aplat ivoire, filet en haut : pas de flou ni de transparence (readme « Fonds »). */
.mcta { position: fixed; left: 0; right: 0; bottom: 0; z-index: 60; padding: 10px 16px 14px; background: var(--bg-page); border-top: 1px solid var(--border); }
</style>
