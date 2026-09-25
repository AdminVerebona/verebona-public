<template>
  <div class="ha-panel ha-contact">
    <div>
      <div class="ha-contact-title">Vous ne trouvez pas la réponse ?</div>
      <div class="ha-contact-text">Contactez-nous et décrivez votre situation.</div>
    </div>
    <a class="ha-btn" v-bind="link('/contact')">Contacter le support</a>
  </div>
</template>

<script setup lang="ts">
/** Bloc contact — textes exacts du §11. */
import { useNav } from '../../composables/useNav'
const { link } = useNav()
</script>
