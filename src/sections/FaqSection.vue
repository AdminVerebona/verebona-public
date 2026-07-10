<template>
<section id="faq" style="background:#F5F8FD;color:#0F1B33;padding:88px 24px">
  <div style="max-width:820px;margin:0 auto">
    <div class="vb-reveal" style="display:flex;flex-direction:column;align-items:center;text-align:center;margin-bottom:38px">
      <h2 style="font-size:46px;font-weight:600;letter-spacing:-.02em;color:#0F1B33">Questions fréquentes</h2>
    </div>
    <div class="vb-reveal" style="display:flex;flex-direction:column;gap:12px">
      <template v-for="(item, vi3) in faqItems" :key="vi3">
        <div :style="item.rowStyle">
          <button type="button" @click.prevent="item.onClick" style="width:100%;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:18px 22px;background:transparent;border:0;cursor:pointer;text-align:left;color:#0F1B33;font-family:'Instrument Sans',sans-serif;font-size:15.5px;font-weight:600">
            <span>{{ item.q }}</span>
            <span :style="`${item.chevron};flex-shrink:0;color:#2563EB`">⌄</span>
          </button>
          <template v-if="item.open">
            <div style="padding:0 22px 20px;font-size:14px;line-height:1.65;color:#5B6577;white-space:pre-line">{{ item.a }}</div>
          </template>
        </div>
      </template>
    </div>
  </div>
</section>
</template>

<script setup lang="ts">
import { useLanding } from '../composables/useLanding'
const { faqItems } = useLanding()
</script>
