<template>
  <section class="ha-panel ha-feedback" aria-labelledby="ha-feedback-title">
    <h2 id="ha-feedback-title" class="ha-contact-title">Cet article vous a-t-il aidé ?</h2>

    <div v-if="state === 'idle' || state === 'sending-vote'" class="ha-feedback-choices">
      <button type="button" class="ha-btn ha-btn-ghost" :disabled="state !== 'idle'" @click="vote(true)">Oui</button>
      <button type="button" class="ha-btn ha-btn-ghost" :disabled="state !== 'idle'" @click="vote(false)">Non</button>
    </div>

    <p v-if="state === 'thanks-yes'" class="ha-status" role="status">Merci pour votre retour.</p>

    <form v-if="state === 'ask-comment' || state === 'sending-comment'" @submit.prevent="sendComment">
      <label for="ha-feedback-comment" class="ha-muted">Qu’est-ce qui vous a manqué ? (facultatif)</label>
      <textarea id="ha-feedback-comment" v-model="comment" :maxlength="MAX_COMMENT" />
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:10px">
        <span class="ha-muted">{{ comment.length }} / {{ MAX_COMMENT }}</span>
        <button type="submit" class="ha-btn" :disabled="state === 'sending-comment' || !comment.trim()">Envoyer</button>
      </div>
    </form>

    <p v-if="state === 'thanks-comment'" class="ha-status" role="status">Merci, votre retour a été enregistré.</p>
    <p v-if="error" class="ha-error" role="alert">{{ error }}</p>
  </section>
</template>

<script setup lang="ts">
/**
 * Retour « Cet article vous a-t-il aidé ? » — FEEDBACK-01, FEEDBACK-02, §11.
 *
 * Sans connexion et sans cookie (COOKIE-01) : un appel à l'API publique de
 * l'application, qui enregistre l'ID d'article, le choix, la date et le
 * commentaire éventuel. La limitation de débit, le nettoyage et la longueur
 * maximale du commentaire sont appliqués par le serveur ; la borne affichée
 * ici n'est qu'une aide à la saisie.
 */
import { ref, watch } from 'vue'
import { appUrl } from '../../config/urls'

const props = defineProps<{ articleId: string; version: string }>()
const MAX_COMMENT = 1000

type State = 'idle' | 'sending-vote' | 'thanks-yes' | 'ask-comment' | 'sending-comment' | 'thanks-comment'
const state = ref<State>('idle')
const comment = ref('')
const error = ref<string | null>(null)
let receipt: { feedbackId: string; commentToken: string } | null = null

// Un autre article s'ouvre dans la même vue : nouveau vote possible.
watch(() => props.articleId, () => { state.value = 'idle'; comment.value = ''; error.value = null; receipt = null })

async function post(path: string, body: unknown): Promise<Record<string, unknown>> {
  const res = await fetch(appUrl(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'omit',
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(String(res.status))
  return res.json().catch(() => ({}))
}

async function vote(helpful: boolean) {
  error.value = null
  state.value = 'sending-vote'
  try {
    const r = await post('/api/public/help-feedback', { articleId: props.articleId, helpful, contentVersion: props.version })
    receipt = typeof r.feedbackId === 'string' && typeof r.commentToken === 'string'
      ? { feedbackId: r.feedbackId, commentToken: r.commentToken }
      : null
    // Sans reçu, un commentaire ne pourrait pas être rattaché au vote : on ne
    // propose pas un champ dont le contenu serait perdu.
    state.value = helpful || !receipt ? 'thanks-yes' : 'ask-comment'
  } catch {
    state.value = 'idle'
    error.value = 'Votre retour n’a pas pu être envoyé. Réessayez dans un instant.'
  }
}

async function sendComment() {
  if (!receipt) return
  error.value = null
  state.value = 'sending-comment'
  try {
    await post('/api/public/help-feedback/comment', { ...receipt, comment: comment.value.trim() })
    state.value = 'thanks-comment'
  } catch {
    state.value = 'ask-comment'
    error.value = 'Votre commentaire n’a pas pu être envoyé. Réessayez dans un instant.'
  }
}
</script>
