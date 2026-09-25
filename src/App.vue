<template>
  <div style="background:#070E20;color:#EAF0FB;overflow-x:hidden;min-height:100vh">
    <!--
      Mode intégré à l'application (MOB-02) : ni en-tête ni pied de page du
      site, seulement la barre « Retour à Verebona ».
    -->
    <HelpEmbedBar v-if="embedded" />
    <AppHeader v-else />
    <router-view />
    <AppFooter v-if="!embedded" />
    <PreviewModeSwitch v-if="PreviewModeSwitch && !embedded" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch, nextTick, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import { useScrollReveal } from './composables/useScrollReveal'
import { CAN_PREVIEW_SITE_MODE } from './config/site'
import { useEmbed } from './help/embed'

// Chargée à la demande : hors mode intégré, la barre n'est jamais téléchargée.
const HelpEmbedBar = defineAsyncComponent(() => import('./components/help/HelpEmbedBar.vue'))
const { embedded } = useEmbed()

// Sélecteur FULL / PRELAUNCH : chargé à la demande, et seulement là où la
// prévisualisation est autorisée. En production, il n'est jamais téléchargé.
const PreviewModeSwitch = CAN_PREVIEW_SITE_MODE
  ? defineAsyncComponent(() => import('./components/PreviewModeSwitch.vue'))
  : null

const route = useRoute()
const { scan } = useScrollReveal()

onMounted(() => { scan() })

// Re-scan reveal targets whenever the route (page) changes.
watch(
  () => route.fullPath,
  () => { nextTick(() => setTimeout(scan, 60)) },
)
</script>
