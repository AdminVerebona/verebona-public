<template>
<section class="vb-page-hero">
  <div class="vb-page-hero__inner" style="max-width:900px">
    <PageCrumbs :current="crumbLabel" />
    <span class="vb-eyebrow">Informations légales</span>
    <h1 class="vb-page-hero__title">{{ heading }}</h1>
  </div>
</section>
<section class="legal">
  <div class="legal__wrap">
    <!--
      Onglets (motif ARIA « tabs ») : chaque onglet est un lien vers son URL
      stable (nouvel onglet, partage, sans JavaScript) ; flèches gauche/droite,
      Début et Fin déplacent le focus et ouvrent l'onglet.
    -->
    <div class="vb-tabs legal__tabs" role="tablist" aria-label="Informations légales" @keydown="onTabKeydown">
      <a
        v-for="d in documents"
        :id="`legal-tab-${d.key}`"
        :key="d.key"
        :ref="(el) => setTabRef(d.key, el)"
        role="tab"
        :aria-selected="d.key === activeKey ? 'true' : 'false'"
        aria-controls="legal-panel"
        :tabindex="d.key === activeKey ? 0 : -1"
        v-bind="link(d.path)"
      >{{ d.tabLabel }}</a>
    </div>

    <div id="legal-panel" class="vb-card legal__card" role="tabpanel" :aria-labelledby="`legal-tab-${activeKey}`" tabindex="0">
      <!-- Permalien d'une version des CGUV : exactement cette version, jamais une autre. -->
      <template v-if="isVersionRoute">
        <template v-if="version">
          <dl class="legal__meta">
            <div><dt>Version</dt><dd>{{ version.code }}</dd></div>
            <div v-if="version.publishedAt"><dt>Publiée le</dt><dd>{{ formatLegalDate(version.publishedAt) }}</dd></div>
            <div v-if="version.effectiveAt"><dt>Entrée en vigueur</dt><dd>{{ formatLegalDate(version.effectiveAt) }}</dd></div>
          </dl>
          <p v-if="current && version.code === current.code" class="legal__notice">Cette version est la version en vigueur des CGUV.</p>
          <p v-else class="legal__notice legal__notice--old">
            Ce n’est pas la version la plus récente des CGUV.
            <a v-bind="link('/legal/cguv')" class="vb-link">Consulter la version en vigueur</a>.
          </p>
          <p v-if="version.changeSummary" class="legal__summary"><strong>Résumé des modifications :</strong> {{ version.changeSummary }}</p>
          <p v-if="version.pending" class="legal__pending">Texte en cours de publication.</p>
          <div v-else class="legal__doc" v-html="version.html" />
          <p class="legal__file">
            <a :href="version.textPath" class="vb-link">Texte figé de cette version (fichier HTML à enregistrer ou imprimer)</a>
          </p>
        </template>
        <template v-else>
          <p class="legal__notice legal__notice--old">
            Aucune version des CGUV ne porte l’identifiant<template v-if="isCode(requestedCode)"> « {{ requestedCode }} »</template>.
            Cette adresse ne renvoie jamais vers une autre version.
          </p>
          <p><a v-bind="link('/legal/cguv')" class="vb-link">Consulter la version en vigueur des CGUV</a></p>
        </template>
      </template>

      <!--
        Onglet CGUV : la version en vigueur SEULEMENT, avec son code et son
        lien permanent (ticket « livraison des informations légales » : pas
        d'annuaire public des anciennes versions). Les versions précédentes
        restent accessibles par leur URL directe /legal/cguv/versions/{code}
        (preuves d'acceptation), sans être mises en avant.
      -->
      <template v-else-if="activeKey === 'cguv'">
        <template v-if="current">
          <dl class="legal__meta">
            <div><dt>Version</dt><dd>{{ current.code }}</dd></div>
            <div v-if="current.effectiveAt"><dt>Entrée en vigueur</dt><dd>{{ formatLegalDate(current.effectiveAt) }}</dd></div>
          </dl>
          <p class="legal__links">
            <a v-bind="link(current.permalinkPath)" class="vb-link">Lien permanent de cette version</a>
          </p>
          <p v-if="current.pending" class="legal__pending">Texte en cours de publication.</p>
          <div v-else class="legal__doc" v-html="current.html" />
        </template>
        <p v-else class="legal__pending">Texte en cours de publication.</p>
      </template>

      <!-- Autres onglets : texte fourni par le PO, tel quel. -->
      <template v-else>
        <p v-if="activeDoc.updatedAt" class="legal__date">Dernière mise à jour : {{ formatLegalDate(activeDoc.updatedAt) }}</p>
        <p v-if="activeDoc.pending" class="legal__pending">Texte en cours de publication.</p>
        <div v-else class="legal__doc" v-html="activeDoc.html" />
      </template>
    </div>

    <p class="legal__foot">
      Pour toute question, <a v-bind="link('/contact')" class="vb-link">contactez-nous</a>.
      Contact protection des données (<a href="mailto:dpo@verebona.com" class="vb-link">dpo@verebona.com</a>).
    </p>
  </div>
</section>
</template>

<script setup lang="ts">
import { nextTick, type ComponentPublicInstance } from 'vue'
import { useRouter } from 'vue-router'
import { useLegal } from '../composables/useLegal'
import { useNav } from '../composables/useNav'
import { formatLegalDate } from '../legal/format'
import type { LegalDocKey } from '../legal/types'
import PageCrumbs from '../components/PageCrumbs.vue'

const { documents, activeKey, activeDoc, isVersionRoute, requestedCode, current, version, heading, crumbLabel } = useLegal()
const { link } = useNav()
const router = useRouter()

const isCode = (c: string) => /^\d{4}-\d{2}-\d{2}-v[1-9]\d{0,3}$/.test(c)

const tabRefs = new Map<LegalDocKey, HTMLElement>()
function setTabRef(key: LegalDocKey, el: Element | ComponentPublicInstance | null) {
  if (el instanceof HTMLElement) tabRefs.set(key, el)
  else tabRefs.delete(key)
}

/** Clavier des onglets (WAI-ARIA APG « Tabs », activation automatique). */
function onTabKeydown(event: KeyboardEvent) {
  const keys = documents.map((d) => d.key)
  const from = keys.indexOf(activeKey.value)
  let to = -1
  if (event.key === 'ArrowRight') to = (from + 1) % keys.length
  else if (event.key === 'ArrowLeft') to = (from - 1 + keys.length) % keys.length
  else if (event.key === 'Home') to = 0
  else if (event.key === 'End') to = keys.length - 1
  if (to === -1) return
  event.preventDefault()
  const target = documents[to]
  tabRefs.get(target.key)?.focus()
  const { href } = link(target.path)
  router.push(href).then(() => nextTick(() => tabRefs.get(target.key)?.focus()))
}
</script>

<style>
.legal { padding: 32px var(--gutter) 72px; }
.legal__wrap { max-width: 900px; margin: 0 auto; }
.legal__tabs { margin-bottom: 28px; }
.legal__tabs a[role="tab"] {
  display: inline-flex; align-items: center; padding: 0 18px; min-height: 40px; border-radius: var(--radius-pill);
  font-size: 15px; font-weight: 600; border: 1px solid var(--border); background: var(--bg-card); color: var(--text-muted);
  text-decoration: none;
  transition: background-color var(--dur) var(--ease), color var(--dur) var(--ease), border-color var(--dur) var(--ease);
}
.legal__tabs a[role="tab"]:hover { border-color: var(--accent); color: var(--accent); }
.legal__tabs a[role="tab"][aria-selected="true"] { border-color: var(--accent); background: var(--accent-soft); color: var(--accent); }
.legal__card { padding: 40px 42px; font-size: 15.5px; line-height: 1.75; color: var(--text-primary); }
.legal__meta { display: flex; flex-wrap: wrap; gap: 6px 24px; margin: 0 0 14px; font-size: 14px; color: var(--text-muted); }
.legal__meta div { display: flex; gap: 6px; }
.legal__meta dt { font-weight: 600; color: var(--text-heading); }
.legal__meta dd { margin: 0; }
.legal__links { display: flex; flex-wrap: wrap; gap: 8px 20px; margin: 0 0 22px; font-size: 14.5px; }
.legal__notice { margin: 0 0 16px; padding: 12px 16px; border-radius: 12px; background: var(--accent-soft); color: var(--text-heading); font-size: 14.5px; }
.legal__notice--old { background: var(--bg-page); border: 1px solid var(--border); }
.legal__summary { margin: 0 0 18px; font-size: 14.5px; }
.legal__date { margin: 0 0 13px; color: var(--text-muted); font-size: 14px; }
.legal__pending { margin: 0; color: var(--text-muted); font-style: italic; }
.legal__file { margin: 26px 0 0; font-size: 14px; }
.legal__doc h2 { font-size: 20px; font-weight: 700; color: var(--text-heading); margin: 26px 0 10px; }
.legal__doc h2:first-child { margin-top: 0; }
.legal__doc h3 { font-size: 17px; font-weight: 700; color: var(--text-heading); margin: 20px 0 8px; }
.legal__doc h4, .legal__doc h5 { font-size: 16px; font-weight: 600; color: var(--text-heading); margin: 16px 0 6px; }
.legal__doc p { margin: 0 0 13px; }
.legal__doc ul, .legal__doc ol { margin: 0 0 13px; padding-left: 1.4em; }
.legal__doc li { margin: 0 0 6px; }
.legal__doc a { color: var(--accent); text-decoration: underline; overflow-wrap: anywhere; }
.legal__doc table { width: 100%; border-collapse: collapse; margin: 0 0 16px; font-size: 14.5px; display: block; overflow-x: auto; }
.legal__doc th, .legal__doc td { border: 1px solid var(--border); padding: 8px 10px; text-align: left; vertical-align: top; }
.legal__foot { font-size: 14px; color: var(--text-muted); margin-top: 22px; text-align: center; }
@media (max-width: 860px) {
  .legal { padding: 24px 16px 56px; }
  .legal__card { padding: 24px 20px; }
}
</style>
