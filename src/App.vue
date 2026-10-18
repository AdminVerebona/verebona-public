<template>
  <div class="vb-site">
    <!--
      Mode intégré à l'application (MOB-02) : ni en-tête ni pied de page du
      site, seulement la barre « Retour à Verebona » — sauf si l'application
      encadre la page et affiche déjà la sienne (voir `showEmbedBar`).
    -->
    <HelpEmbedBar v-if="showEmbedBar" />
    <AppHeader v-if="!embedded" />
    <router-view />
    <AppFooter v-if="!embedded" />
    <PreviewModeSwitch v-if="PreviewModeSwitch && !embedded" />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import { CAN_PREVIEW_SITE_MODE } from './config/site'
import { useEmbed } from './help/embed'

// Chargée à la demande : hors mode intégré, la barre n'est jamais téléchargée.
const HelpEmbedBar = defineAsyncComponent(() => import('./components/help/HelpEmbedBar.vue'))
const { embedded, showEmbedBar } = useEmbed()

// Sélecteur FULL / PRELAUNCH : chargé à la demande, et seulement là où la
// prévisualisation est autorisée. En production, il n'est jamais téléchargé.
const PreviewModeSwitch = CAN_PREVIEW_SITE_MODE
  ? defineAsyncComponent(() => import('./components/PreviewModeSwitch.vue'))
  : null

// Charte 2026 (lot 66P) : plus d'animation d'apparition au défilement — les
// transitions ne portent que sur le fond et la couleur (readme « Animation »).
</script>
