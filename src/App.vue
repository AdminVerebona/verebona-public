<template>
  <div style="background:#070E20;color:#EAF0FB;overflow-x:hidden;min-height:100vh">
    <AppHeader />
    <router-view />
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import { useScrollReveal } from './composables/useScrollReveal'

const route = useRoute()
const { scan } = useScrollReveal()

onMounted(() => { scan() })

// Re-scan reveal targets whenever the route (page) changes.
watch(
  () => route.fullPath,
  () => { nextTick(() => setTimeout(scan, 60)) },
)
</script>
