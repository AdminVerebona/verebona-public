<template>
<section id="how" style="background:#070E20;color:#EAF0FB;padding:88px 24px;position:relative;overflow:hidden">
  <div style="position:absolute;top:-10%;right:-5%;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,rgba(59,130,246,.14),transparent 60%);pointer-events:none"></div>
  <div style="max-width:1200px;margin:0 auto;position:relative">
    <div class="r-2b" style="display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center">
      <div class="vb-reveal">
        <div style="font-size:13.5px;letter-spacing:.15em;text-transform:uppercase;font-weight:800;color:#8FBEFF;margin-bottom:12px">Comment ça marche</div>
        <h2 style="font-size:42px;font-weight:600;letter-spacing:-.02em;color:#fff;line-height:1.14;margin-bottom:14px">Votre patrimoine se met en ordre, sans effort.</h2>
        <p style="font-size:15.5px;line-height:1.65;color:#95A1B8;margin-bottom:34px">Ajoutez vos documents. Verebona les comprend, les relie à vos biens, complète vos informations et prépare vos prochaines échéances.</p>
        <div style="display:flex;flex-direction:column;gap:26px">
          <div style="display:flex;gap:20px"><div style="font-family:'Bricolage Grotesque',sans-serif;font-size:38px;font-weight:700;color:rgba(96,165,250,.35);line-height:1">01</div><div><h4 style="font-size:18px;font-weight:600;color:#fff;margin-bottom:6px">Vous déposez</h4><p style="font-size:14px;line-height:1.6;color:#8B98AE">Ajoutez vos documents comme ils viennent : factures, contrats, diagnostics, garanties, photos.</p></div></div>
          <div style="display:flex;gap:20px"><div style="font-family:'Bricolage Grotesque',sans-serif;font-size:38px;font-weight:700;color:rgba(96,165,250,.35);line-height:1">02</div><div><h4 style="font-size:18px;font-weight:600;color:#fff;margin-bottom:6px">Verebona organise</h4><p style="font-size:14px;line-height:1.6;color:#8B98AE">Verebona analyse vos documents, les classe, les rattache aux bons biens et extrait les informations utiles.</p></div></div>
          <div style="display:flex;gap:20px"><div style="font-family:'Bricolage Grotesque',sans-serif;font-size:38px;font-weight:700;color:rgba(96,165,250,.35);line-height:1">03</div><div><h4 style="font-size:18px;font-weight:600;color:#fff;margin-bottom:6px">Vous gardez l'essentiel sous la main</h4><p style="font-size:14px;line-height:1.6;color:#8B98AE">Vos échéances, dossiers, documents et informations importantes sont prêts quand vous en avez besoin.</p></div></div>
        </div>
      </div>
      <template v-if="showMascot">
      <div class="vb-reveal" style="transition-delay:.12s;display:flex;justify-content:center;align-items:center;position:relative">
        <div style="position:absolute;width:360px;height:360px;border-radius:50%;background:radial-gradient(circle,rgba(59,130,246,.22),transparent 62%)"></div>
        <img src="/assets/mascot/document-analysis-pdf.webp" alt="Verebona analyse un document" style="position:relative;width:min(360px,90%);height:auto;filter:drop-shadow(0 30px 50px rgba(4,10,26,.6));animation:vb-float 6s ease-in-out infinite"/>
      </div>
      </template>
    </div>
  </div>
</section>
</template>

<script setup lang="ts">
import { useLanding } from '../composables/useLanding'
const { showMascot } = useLanding()
</script>
