<template>
<template v-if="visible">
<div class="r-fixedcta" style="position:fixed;left:0;right:0;bottom:0;z-index:60;padding:10px 16px 14px;background:rgba(7,14,32,.94);backdrop-filter:blur(14px);border-top:1px solid rgba(148,163,184,.18)">
  <a :href="signupUrl()" style="display:block;text-align:center;font-size:15.5px;font-weight:600;color:#fff;padding:14px;border-radius:999px;background:linear-gradient(135deg,#00D4AA,#00A882)">Essayer gratuitement pendant 7 jours</a>
</div>
</template>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { signupUrl } from '../config/urls'

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
