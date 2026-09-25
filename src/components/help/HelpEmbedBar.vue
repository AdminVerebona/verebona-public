<template>
  <div class="ha-embedbar">
    <button type="button" @click="backToApp">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
           stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>
      Retour à Verebona
    </button>
    <span class="ha-embedbar-title">Centre d’aide</span>
  </div>
</template>

<script setup lang="ts">
/** Barre du mode intégré (§11 « Mobile intégré », MOB-02, MOB-03). */
import '../../help/help.css'
import { backToApp } from '../../help/embed'
</script>
