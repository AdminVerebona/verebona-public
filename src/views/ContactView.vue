<template>
<section class="vb-page-hero">
  <div class="vb-page-hero__inner" style="max-width:1080px">
    <PageCrumbs :current="crumbLabel" />
    <span class="vb-eyebrow">Contact</span>
    <h1 class="vb-page-hero__title">Parlons de vos biens</h1>
    <p class="vb-page-hero__lead">Une question, une suggestion, un partenariat ? Écrivez-nous, nous revenons vers vous rapidement.</p>
  </div>
</section>
<section class="ct">
  <div class="ct__grid r-stack">
    <div class="vb-card ct__form-card">
      <template v-if="contactSent">
        <div style="display:flex;flex-direction:column;align-items:center;text-align:center;padding:30px 10px">
          <span class="vb-tile ct__ok"><VbIcon name="check" :size="30" /></span>
          <div class="ct__ok-title">Message envoyé</div>
          <div class="vb-meta" style="margin-top:8px;max-width:340px;font-size:15px">Merci ! Notre équipe vous répond sous 24&nbsp;h ouvrées à l'adresse indiquée.</div>
          <button type="button" @click.prevent="goHome" class="vb-btn vb-btn--secondary" style="margin-top:22px">Retour à l'accueil</button>
        </div>
      </template>
      <template v-if="notContactSent">
      <form @submit.prevent="sendContact" style="display:flex;flex-direction:column;gap:16px">
        <div class="ct__names">
          <label class="ct__label">Prénom<input class="vb-field" type="text" required placeholder="Camille" v-model="firstName"/></label>
          <label class="ct__label">Nom<input class="vb-field" type="text" required placeholder="Durand" v-model="lastName"/></label>
        </div>
        <label class="ct__label">Email<input class="vb-field" type="email" required placeholder="camille@email.com" v-model="email"/></label>
        <label class="ct__label">Sujet<select class="vb-field" required v-model="subject" data-testid="contact-subject" :aria-invalid="error && !subject ? 'true' : undefined" aria-describedby="contact-error"><option value="" disabled>Choisir…</option><option v-for="s in subjects" :key="s" :value="s">{{ s }}</option></select></label>
        <label class="ct__label">Message<textarea class="vb-field" required rows="5" placeholder="Votre message…" v-model="message" style="resize:vertical"></textarea></label>
        <button type="submit" :disabled="sending" class="vb-btn vb-btn--primary vb-btn--lg" style="margin-top:4px">Envoyer le message</button>
        <!-- A11Y-02 : conteneur live toujours present (une region ajoutee en meme temps que son texte n'est pas toujours annoncee) ; role=alert pour une annonce immediate. -->
        <div id="contact-error" role="alert" aria-live="assertive" aria-atomic="true"><p v-if="error" data-testid="contact-error" class="ct__error">{{ error }}</p></div>
      </form>
      </template>
    </div>
    <div style="display:flex;flex-direction:column;gap:14px">
      <div class="vb-card ct__info"><div class="ct__info-label">Email</div><div class="ct__info-main">contact@verebona.com</div><div class="vb-meta" style="margin-top:4px">Réponse sous 24&nbsp;h ouvrées</div></div>
      <div class="vb-card ct__info"><div class="ct__info-label">Support</div><div class="ct__info-text">Consultez d'abord notre <a v-bind="link('/aide')" class="vb-link">Centre d'aide</a> : la plupart des réponses s'y trouvent déjà.</div></div>
      <div class="ct__brand vb-on-dark"><VbLogo :size="22" inverse /><div class="ct__brand-text">L'inventaire administré de vos biens, centralisé et prêt le moment venu.</div></div>
    </div>
  </div>
</section>
</template>

<script setup lang="ts">
import { useContact } from '../composables/useContact'
import { useNav } from '../composables/useNav'
import PageCrumbs from '../components/PageCrumbs.vue'
import VbIcon from '../components/VbIcon.vue'
import VbLogo from '../components/VbLogo.vue'
const { firstName, lastName, email, subject, subjects, message, contactSent, notContactSent, sending, error, sendContact, crumbLabel } = useContact()
const { link, goHome } = useNav()
</script>

<style>
.ct { padding: 48px var(--gutter) 72px; }
.ct__grid { max-width: 1080px; margin: 0 auto; display: grid; grid-template-columns: 1.1fr .9fr; gap: 36px; align-items: start; }
.ct__form-card { padding: 32px 30px; }
.ct__names { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.ct__label { display: flex; flex-direction: column; gap: 7px; font-size: 14px; font-weight: 600; color: var(--text-primary); }
.ct__error { margin: 0; font-size: 15px; font-weight: 600; color: var(--attention); }
.ct__ok { width: 64px; height: 64px; border-radius: 50%; margin-bottom: 18px; }
.ct__ok-title { font-size: 22px; font-weight: 700; color: var(--text-heading); }
.ct__info { padding: 22px 24px; }
.ct__info-label { font-size: 13px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--attention); margin-bottom: 8px; }
.ct__info-main { font-size: 17px; font-weight: 700; color: var(--text-heading); }
.ct__info-text { font-size: 15.5px; line-height: 1.6; color: var(--text-muted); }
.ct__brand { background: var(--vb-petrole); border-radius: var(--radius-lg); padding: 24px; color: var(--vb-blanc); }
.ct__brand-text { font-size: 15px; color: var(--vb-brume); margin-top: 10px; line-height: 1.6; }
@media (max-width: 860px) {
  .ct { padding: 32px 16px 56px; }
  .ct__form-card { padding: 24px 20px; }
  .ct__names { grid-template-columns: 1fr; }
}
</style>
