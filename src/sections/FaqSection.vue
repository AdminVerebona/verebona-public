<template>
<section id="faq" class="vb-section vb-section--brume faq">
  <div class="faq__inner">
    <h2 class="vb-h2 faq__title">Questions fréquentes</h2>
    <div class="faq__list">
      <div v-for="(item, vi3) in faqItems" :key="vi3" :class="['faq__row', item.open ? 'faq__row--open' : '']">
        <button type="button" class="faq__q" @click.prevent="item.onClick" :aria-expanded="item.open" :aria-controls="item.panelId">
          <span>{{ item.q }}</span>
          <VbIcon name="chevronDown" :size="20" class="faq__chev" />
        </button>
        <template v-if="item.open">
          <div :id="item.panelId" role="region" class="faq__a">{{ item.a }}</div>
        </template>
      </div>
    </div>
  </div>
</section>
</template>

<script setup lang="ts">
import { useLanding } from '../composables/useLanding'
import VbIcon from '../components/VbIcon.vue'
const { faqItems } = useLanding()
</script>

<style>
.faq__inner { max-width: 820px; margin: 0 auto; }
.faq__title { text-align: center; margin-bottom: 38px; }
.faq__list { display: flex; flex-direction: column; gap: 12px; }
.faq__row { border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--bg-card); overflow: hidden; transition: border-color var(--dur) var(--ease); }
.faq__row--open { border-color: var(--accent); }
.faq__q {
  width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 18px 22px;
  background: transparent; border: 0; cursor: pointer; text-align: left; color: var(--text-heading); font-size: 17px; font-weight: 700;
  border-radius: var(--radius-lg);
}
.faq__chev { color: var(--accent); flex-shrink: 0; transition: transform var(--dur) var(--ease); }
.faq__row--open .faq__chev { transform: rotate(180deg); }
.faq__a { padding: 0 22px 20px; font-size: 16px; line-height: 1.65; color: var(--text-muted); white-space: pre-line; }
@media (max-width: 860px) {
  .faq__q { padding: 16px 18px; font-size: 16px; }
  .faq__a { padding: 0 18px 18px; }
}
</style>
