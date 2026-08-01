<template>
<section style="background:#070E20;color:#EAF0FB;padding:88px 24px;position:relative;overflow:hidden">
  <div style="position:absolute;top:-15%;left:-8%;width:520px;height:520px;border-radius:50%;background:radial-gradient(circle,rgba(59,130,246,.12),transparent 60%);pointer-events:none"></div>
  <div style="max-width:1280px;margin:0 auto;position:relative">
    <div class="vb-reveal" style="display:flex;align-items:center;gap:28px;margin-bottom:40px;flex-wrap:wrap">
      <template v-if="showMascot">
      <img src="/assets/mascot/security-shield.webp" alt="Verebona sécurité" style="width:130px;height:auto;flex-shrink:0;filter:drop-shadow(0 22px 38px rgba(4,10,26,.6))"/>
      </template>
      <div>
        <div style="font-size:13.5px;letter-spacing:.15em;text-transform:uppercase;font-weight:800;color:#8FBEFF;margin-bottom:10px">Sécurité des données</div>
        <h2 style="font-size:44px;font-weight:600;letter-spacing:-.02em;color:#fff;max-width:680px;line-height:1.12">Vos données sont protégées, hébergées en France et sauvegardées chaque jour.</h2>
        <p style="font-size:15.5px;line-height:1.65;color:#95A1B8;max-width:680px;margin-top:14px">Verebona protège l'accès à vos informations et ne revend pas vos données. Vous restez propriétaire des contenus déposés et pouvez les récupérer ou les supprimer.</p>
      </div>
    </div>
    <div class="vb-rgroup r-3" style="display:grid;grid-template-columns:repeat(3,1fr);gap:18px">
      <div style="padding:26px;border-radius:18px;background:rgba(15,23,42,.6);border:1px solid rgba(148,163,184,.14)">
        <img src="/assets/france-hosting.png" alt="Hébergement en France" style="width:72px;height:72px;object-fit:contain;margin-bottom:16px"/>
        <h3 style="font-size:17px;font-weight:600;color:#fff;margin-bottom:8px">Hébergement en France</h3>
        <p style="font-size:14px;line-height:1.6;color:#95A1B8">Vos données sont stockées exclusivement sur des serveurs sécurisés en France, sous la protection des réglementations européennes les plus rigoureuses.</p>
      </div>
      <div style="padding:26px;border-radius:18px;background:rgba(15,23,42,.6);border:1px solid rgba(148,163,184,.14)">
        <img src="/assets/ssl-2fa.png" alt="Connexion sécurisée" style="width:72px;height:72px;object-fit:contain;margin-bottom:16px"/>
        <h3 style="font-size:17px;font-weight:600;color:#fff;margin-bottom:8px">Connexion sécurisée</h3>
        <p style="font-size:14px;line-height:1.6;color:#95A1B8">Verebona utilise une connexion chiffrée pour protéger les échanges avec l'application et une authentification à deux facteurs (2FA) pour une sécurité renforcée.</p>
      </div>
      <div style="padding:26px;border-radius:18px;background:rgba(15,23,42,.6);border:1px solid rgba(148,163,184,.14)">
        <img src="/assets/cloud-backup.png" alt="Sauvegarde protégée" style="width:72px;height:72px;object-fit:contain;margin-bottom:16px"/>
        <h3 style="font-size:17px;font-weight:600;color:#fff;margin-bottom:8px">Sauvegarde protégée</h3>
        <p style="font-size:14px;line-height:1.6;color:#95A1B8">Des sauvegardes automatiques et chiffrées sont effectuées quotidiennement sur des serveurs redondants, garantissant la pérennité de vos informations.</p>
      </div>
    </div>
  </div>
</section>
</template>

<script setup lang="ts">
import { useLanding } from '../composables/useLanding'
const { showMascot } = useLanding()
</script>
