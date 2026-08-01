<template>
<footer style="background:#0F172A;color:#CBD5E1;padding:52px 24px 40px;border-top:1px solid rgba(255,255,255,.08)">
  <div class="r-footer" style="max-width:1280px;margin:0 auto;display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:32px">
    <div>
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:12px">
        <svg width="48" height="48" viewBox="0 0 32 32" fill="none" style="overflow:visible"><rect x="0" y="0" width="9.14" height="9.14" rx="1.6" fill="#fff"/><rect x="11.43" y="0" width="9.14" height="9.14" rx="1.6" fill="#fff"/><rect x="0" y="11.43" width="9.14" height="9.14" rx="1.6" fill="#fff"/><rect x="11.43" y="11.43" width="9.14" height="9.14" rx="1.6" fill="#fff"/><rect x="22.86" y="11.43" width="9.14" height="9.14" rx="1.6" fill="#fff"/><rect x="0" y="22.86" width="9.14" height="9.14" rx="1.6" fill="#fff"/><rect x="11.43" y="22.86" width="9.14" height="9.14" rx="1.6" fill="#fff"/><rect x="22.86" y="22.86" width="9.14" height="9.14" rx="1.6" fill="#fff"/><rect x="22.86" y="-1.55" width="9.14" height="9.14" rx="1.6" fill="#2F6BFF" transform="rotate(18 27.43 3.02)"/></svg>
        <div><div style="font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:27px;letter-spacing:-.01em;color:#fff">Verebona</div></div>
      </div>
      <p style="font-size:12px;color:#64748B;margin-top:18px">© 2026 Verebona. Tous droits réservés.</p>
    </div>
    <div><div style="font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#fff;margin-bottom:14px">Produit</div><div style="display:flex;flex-direction:column;gap:9px;font-size:14px;color:#96A2B8"><a href="#how" @click.prevent="navHow" style="cursor:pointer;transition:color .15s" v-hover="{color:'#fff'}">Comment ça marche</a><a href="#cas-usage" @click.prevent="navCasUsage" style="cursor:pointer;transition:color .15s" v-hover="{color:'#fff'}">Cas d'usage</a><a href="#pricing" @click.prevent="navPricing" style="cursor:pointer;transition:color .15s" v-hover="{color:'#fff'}">Tarifs</a></div></div>
    <div><div style="font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#fff;margin-bottom:14px">Support</div><div style="display:flex;flex-direction:column;gap:9px;font-size:14px;color:#96A2B8"><a href="#faq" @click.prevent="navFaq" style="cursor:pointer;transition:color .15s" v-hover="{color:'#fff'}">FAQ</a><a href="#" @click.prevent="goAide" style="cursor:pointer;transition:color .15s" v-hover="{color:'#fff'}">Centre d'aide</a><a href="#" @click.prevent="goContact" style="cursor:pointer;transition:color .15s" v-hover="{color:'#fff'}">Contact</a></div></div>
    <div><div style="font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#fff;margin-bottom:14px">Légal</div><div style="display:flex;flex-direction:column;gap:9px;font-size:14px;color:#96A2B8"><a href="#" @click.prevent="goMentions" style="cursor:pointer;transition:color .15s" v-hover="{color:'#fff'}">Mentions légales</a><a href="#" @click.prevent="goCGU" style="cursor:pointer;transition:color .15s" v-hover="{color:'#fff'}">CGSU</a><a href="#" @click.prevent="goConfid" style="cursor:pointer;transition:color .15s" v-hover="{color:'#fff'}">Confidentialité</a></div></div>
  </div>
</footer>
</template>

<script setup lang="ts">
import { useNav } from '../composables/useNav'
const { goHome, goAide, goContact, goMentions, goCGU, goConfid, navHow, navFeatures, navPricing, navFaq, navCasUsage } = useNav()
</script>
