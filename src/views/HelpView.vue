<template>
<section style="position:relative;padding:128px 24px 56px;overflow:hidden;background:radial-gradient(1100px 620px at 15% -10%,rgba(59,130,246,.22),transparent 60%),#070E20">
  <div style="position:absolute;inset:0;background-image:radial-gradient(rgba(148,163,184,.09) 1px,transparent 1px);background-size:34px 34px;-webkit-mask-image:linear-gradient(to bottom,#000,transparent 85%);mask-image:linear-gradient(to bottom,#000,transparent 85%);pointer-events:none"></div>
  <div style="max-width:1180px;margin:0 auto;position:relative">
    <nav aria-label="Fil d'Ariane" style="margin-bottom:24px"><ol style="display:flex;align-items:center;gap:6px;list-style:none;margin:0;padding:0;font-size:13.5px"><li style="display:flex;align-items:center"><a href="#" @click.prevent="goHome" style="display:inline-flex;align-items:center;gap:7px;color:#9FB4D8;font-weight:500;padding:6px 11px;border-radius:9px;cursor:pointer;transition:color .15s,background .15s" v-hover="{color:'#fff',background:'rgba(255,255,255,.06)'}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5"/></svg>Accueil</a></li><li aria-hidden="true" style="display:flex;color:#42557A"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></li><li aria-current="page" style="color:#EAF0FB;font-weight:600;padding:6px 4px">{{ crumbLabel }}</li></ol></nav>
    <div style="font-size:13.5px;letter-spacing:.15em;text-transform:uppercase;font-weight:800;color:#8FBEFF;margin-bottom:16px">Centre d'aide</div>
    <h1 style="font-size:46px;line-height:1.06;font-weight:600;letter-spacing:-.025em;color:#fff;max-width:640px">Comment pouvons-nous vous aider ?</h1>
    <p style="font-size:17px;line-height:1.6;color:#A5B0C6;max-width:560px;margin-top:16px">Parcourez les questions les plus fréquentes. Vous ne trouvez pas ? <a href="#" @click.prevent="goContact" style="color:#8FBEFF;font-weight:600">Contactez-nous</a>.</p>
  </div>
</section>
<section style="background:#F6F8FC;padding:56px 24px 72px">
  <div style="max-width:880px;margin:0 auto;display:flex;flex-direction:column;gap:12px">
    <template v-for="(item, vi4) in aideItems" :key="vi4">
      <div :style="item.rowStyle">
        <button type="button" @click.prevent="item.onClick" style="width:100%;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:20px 22px;background:transparent;border:0;cursor:pointer;text-align:left">
          <span style="display:flex;flex-direction:column;gap:5px"><span style="font-family:'Space Mono',monospace;font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;color:#2563EB">{{ item.c }}</span><span style="font-size:16.5px;font-weight:600;color:#0F1B33;font-family:'Bricolage Grotesque',sans-serif">{{ item.q }}</span></span>
          <span :style="item.chevron">⌄</span>
        </button>
        <template v-if="item.open">
          <div style="padding:0 22px 22px;font-size:15px;line-height:1.65;color:#475569;white-space:pre-line">{{ item.a }}</div>
        </template>
      </div>
    </template>
    <div style="margin-top:26px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px;background:#fff;border:1px solid #E6EBF3;border-radius:18px;padding:26px 28px">
      <div><div style="font-size:18px;font-weight:700;color:#0F1B33;font-family:'Bricolage Grotesque',sans-serif">Toujours besoin d'aide ?</div><div style="font-size:14.5px;color:#64748B;margin-top:4px">Notre équipe vous répond sous 24&nbsp;h ouvrées.</div></div>
      <button type="button" @click.prevent="goContact" style="font-size:15px;font-weight:600;color:#fff;padding:13px 24px;border-radius:999px;background:linear-gradient(135deg,#3B82F6,#1D4ED8);border:0;cursor:pointer;box-shadow:0 12px 26px rgba(37,99,235,.3)">Contacter le support</button>
    </div>
  </div>
</section>
</template>

<script setup lang="ts">
import { useHelp } from '../composables/useHelp'
import { useNav } from '../composables/useNav'
const { aideItems, crumbLabel } = useHelp()
const { goHome, goContact } = useNav()
</script>
