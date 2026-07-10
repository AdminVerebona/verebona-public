<template>
  <section style="min-height:70vh;display:flex;align-items:center;justify-content:center;padding:132px 24px 80px;text-align:center">
    <div style="max-width:520px">
      <div style="font-family:'Space Mono',monospace;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#60A5FA;margin-bottom:16px">Erreur 404</div>
      <h1 style="font-size:44px;font-weight:600;letter-spacing:-.02em;color:#fff;line-height:1.1;margin-bottom:16px">Cette page est introuvable</h1>
      <p style="font-size:16px;line-height:1.6;color:#95A1B8;margin-bottom:30px">La page que vous cherchez n'existe pas ou a été déplacée.</p>
      <router-link
        to="/"
        style="display:inline-flex;align-items:center;gap:9px;font-size:15.5px;font-weight:600;color:#fff;padding:13px 24px;border-radius:999px;background:linear-gradient(135deg,#3B82F6,#1D4ED8);box-shadow:0 12px 30px rgba(37,99,235,.4)"
        v-hover="{ transform: 'translateY(-1px)' }"
      >
        Retour à l'accueil
      </router-link>
    </div>
  </section>
</template>

<script setup lang="ts"></script>
