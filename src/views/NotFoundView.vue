<template>
  <section class="nf">
    <div class="nf__inner">
      <img src="/assets/mascot/questioning.webp" alt="" width="112" height="112" class="vb-mascot nf__mascot" />
      <span class="vb-eyebrow">Erreur 404</span>
      <h1 class="vb-page-hero__title nf__title">Cette page est introuvable</h1>
      <p class="vb-text nf__text">La page que vous cherchez n'existe pas ou a été déplacée.</p>
      <router-link to="/" class="vb-btn vb-btn--primary vb-btn--lg">Retour à l'accueil</router-link>
    </div>
  </section>
</template>

<script setup lang="ts"></script>

<style>
.nf { min-height: 60vh; display: flex; align-items: center; justify-content: center; padding: 48px 24px 96px; text-align: center; }
.nf__inner { max-width: 560px; display: flex; flex-direction: column; align-items: center; }
.nf__mascot { width: 112px; margin-bottom: 20px; }
.nf__title { margin-bottom: 16px; }
.nf__text { margin-bottom: 30px; }
</style>
