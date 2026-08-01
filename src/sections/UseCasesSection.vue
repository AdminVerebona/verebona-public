<template>
<section id="cas-usage" style="background:#0B1120;color:#EAF0FB;padding:88px 24px;position:relative;overflow:hidden">
  <div style="position:absolute;top:-10%;right:-6%;width:560px;height:560px;border-radius:50%;background:radial-gradient(circle,rgba(59,130,246,.12),transparent 60%);pointer-events:none"></div>
  <div style="max-width:1240px;margin:0 auto;position:relative">
    <div class="vb-reveal" style="max-width:660px;margin-bottom:36px">
      <div style="font-size:13.5px;letter-spacing:.15em;text-transform:uppercase;font-weight:800;color:#8FBEFF;margin-bottom:12px">Cas d'usage</div>
      <h2 style="font-size:42px;font-weight:600;letter-spacing:-.02em;color:#fff;line-height:1.12;margin-bottom:12px">Utile au quotidien. Décisif quand il faut agir.</h2>
      <p style="font-size:15.5px;line-height:1.6;color:#95A1B8">Verebona vous aide à retrouver, suivre et documenter vos biens au fil du temps, puis à réunir les bonnes pièces lorsqu'un événement arrive.</p>
    </div>
    <div style="overflow:hidden;-webkit-mask-image:linear-gradient(to right,transparent,#000 6%,#000 94%,transparent);mask-image:linear-gradient(to right,transparent,#000 6%,#000 94%,transparent);margin-bottom:32px">
      <div style="display:flex;gap:56px;white-space:nowrap;width:max-content;animation:vb-marquee 34s linear infinite;font-family:'Bricolage Grotesque',sans-serif;font-size:30px;font-weight:500;color:rgba(148,163,184,.14)">
        <span>Voiture</span><span>Appartement</span><span>Garage</span><span>Moto</span><span>Maison</span><span>Terrain</span><span>Vélo</span><span>Local commercial</span><span>Loisir / Sport</span><span>Électronique</span>
        <span>Voiture</span><span>Appartement</span><span>Garage</span><span>Moto</span><span>Maison</span><span>Terrain</span><span>Vélo</span><span>Local commercial</span><span>Loisir / Sport</span><span>Électronique</span>
      </div>
    </div>
    <div v-for="group in ucGroups" :key="group.label" class="vb-reveal" style="max-width:920px;margin:0 auto 30px">
      <div style="font-family:'Bricolage Grotesque',sans-serif;font-size:13px;letter-spacing:.14em;text-transform:uppercase;font-weight:700;color:#8FBEFF;margin:0 0 14px 4px">{{ group.label }}</div>
      <div style="border-radius:20px;overflow:hidden;border:1px solid rgba(148,163,184,.14);background:rgba(15,23,42,.4)">
      <template v-for="(item, vi0) in group.items" :key="vi0">
        <div style="border-bottom:1px solid rgba(148,163,184,.09)">
          <button type="button" :aria-expanded="item.open" :aria-controls="item.panelId" :style="item.headerStyle" @click.prevent="item.onClick">
            <span :style="item.badgeStyle">{{ item.badge }}</span>
            <span :style="item.titleStyle">{{ item.title }}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" :style="item.chevStyle"><path d="M9 6l6 6-6 6"/></svg>
          </button>
          <template v-if="item.open">
            <div :id="item.panelId" role="region" style="padding:2px 22px 24px 36px">
              <p style="font-size:14.5px;line-height:1.55;color:#95A1B8;font-style:italic;margin:0 0 18px">{{ item.scenario }}</p>
              <div class="r-2" style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
                <div style="padding:16px 18px;border-radius:13px;background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.18)">
                  <div style="font-size:11.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#F87171;margin-bottom:12px">Sans Verebona</div>
                  <template v-for="(w, vi1) in item.without" :key="vi1">
                    <div style="display:flex;gap:9px;font-size:13.5px;line-height:1.5;color:#B6C0D2;margin-bottom:10px"><span style="color:#F87171;font-weight:700;flex-shrink:0">✕</span>{{ w }}</div>
                  </template>
                </div>
                <div style="padding:16px 18px;border-radius:13px;background:rgba(34,197,94,.06);border:1px solid rgba(34,197,94,.18)">
                  <div style="font-size:11.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#4ADE80;margin-bottom:12px">Avec Verebona</div>
                  <template v-for="(g, vi2) in item.withSteps" :key="vi2">
                    <div style="display:flex;gap:9px;font-size:13.5px;line-height:1.5;color:#B6C0D2;margin-bottom:10px"><span style="color:#4ADE80;font-weight:700;flex-shrink:0">✓</span>{{ g }}</div>
                  </template>
                </div>
              </div>
            </div>
          </template>
        </div>
      </template>
      </div>
    </div>
  </div>
</section>
</template>

<script setup lang="ts">
import { useLanding } from '../composables/useLanding'
const { ucGroups } = useLanding()
</script>
