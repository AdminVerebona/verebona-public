<template>
  <form class="ha-search" role="search" @submit.prevent="submit">
    <label :for="id">Rechercher dans le Centre d’aide</label>
    <input :id="id" v-model="q" type="search" name="q" enterkeyhint="search" autocomplete="off"
           placeholder="Rechercher dans le Centre d’aide…" maxlength="200" />
    <button type="submit">Rechercher</button>
  </form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { siteModeQuery } from '../../config/site'
import { embedQuery } from '../../help/embed'

const props = defineProps<{ initial?: string }>()
const router = useRouter()
const q = ref(props.initial ?? '')
const id = `ha-search-${Math.random().toString(36).slice(2, 8)}`
watch(() => props.initial, (v) => { q.value = v ?? '' })

function submit() {
  const query = q.value.trim()
  router.push({ path: '/aide', query: { ...siteModeQuery(), ...embedQuery(), ...(query ? { q: query } : {}) } })
}
</script>
