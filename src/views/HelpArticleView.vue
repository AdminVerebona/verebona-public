<template>
<section style="position:relative;padding:128px 24px 48px;overflow:hidden;background:radial-gradient(1100px 620px at 15% -10%,rgba(59,130,246,.22),transparent 60%),#070E20">
  <div style="max-width:880px;margin:0 auto;position:relative">
    <nav aria-label="Fil d'Ariane" style="margin-bottom:24px">
      <ol style="display:flex;align-items:center;gap:8px;list-style:none;margin:0;padding:0;font-size:13.5px;flex-wrap:wrap">
        <li><a href="#" @click.prevent="$router.push('/')" style="color:#9FB4D8;font-weight:500">Accueil</a></li>
        <li aria-hidden="true" style="color:#42557A">›</li>
        <li><a href="#" @click.prevent="$router.push('/aide')" style="color:#9FB4D8;font-weight:500">Centre d'aide</a></li>
        <li aria-hidden="true" style="color:#42557A">›</li>
        <li aria-current="page" style="color:#EAF0FB;font-weight:600">{{ article ? article.title : 'Article introuvable' }}</li>
      </ol>
    </nav>

    <template v-if="article">
      <div style="font-size:13px;letter-spacing:.14em;text-transform:uppercase;font-weight:800;color:#8FBEFF;margin-bottom:14px">{{ categorie }}</div>
      <h1 style="font-size:38px;line-height:1.12;font-weight:600;letter-spacing:-.02em;color:#fff;max-width:700px">{{ article.title }}</h1>
      <p style="font-size:17px;line-height:1.6;color:#A5B0C6;max-width:620px;margin-top:14px">{{ article.excerpt }}</p>
      <p style="font-size:13.5px;color:#6B7A99;margin-top:12px">Mis à jour {{ article.updated }}</p>
    </template>

    <template v-else>
      <h1 style="font-size:38px;line-height:1.12;font-weight:600;color:#fff">Cet article n'existe pas</h1>
      <p style="font-size:17px;line-height:1.6;color:#A5B0C6;max-width:560px;margin-top:14px">
        Il a peut-être été renommé. Retrouvez les autres réponses dans le centre d'aide.
      </p>
    </template>
  </div>
</section>

<section style="background:#F6F8FC;padding:48px 24px 72px">
  <div style="max-width:760px;margin:0 auto">
    <template v-if="article">
      <div v-for="(p, i) in article.paras" :key="i" style="margin-bottom:20px">
        <div v-if="p.step" style="display:flex;gap:14px;align-items:flex-start">
          <span style="flex-shrink:0;width:26px;height:26px;border-radius:50%;background:#2563EB;color:#fff;font-size:13px;font-weight:600;display:flex;align-items:center;justify-content:center">{{ p.step }}</span>
          <p style="font-size:16px;line-height:1.7;color:#334155;margin:0">{{ p.text }}</p>
        </div>
        <p v-else style="font-size:16px;line-height:1.7;color:#475569;margin:0">{{ p.text }}</p>
      </div>

      <div v-if="memeCategorie.length" style="margin-top:44px;padding-top:28px;border-top:1px solid #E6EBF3">
        <div style="font-size:13px;letter-spacing:.12em;text-transform:uppercase;font-weight:700;color:#64748B;margin-bottom:16px">Dans la même catégorie</div>
        <div style="display:flex;flex-direction:column;gap:10px">
          <a v-for="a in memeCategorie" :key="a.id" href="#" @click.prevent="$router.push('/aide/' + a.id)"
             style="display:block;padding:16px 18px;background:#fff;border:1px solid #E6EBF3;border-radius:14px;text-decoration:none">
            <div style="font-size:15.5px;font-weight:600;color:#0F1B33">{{ a.title }}</div>
            <div style="font-size:14px;color:#64748B;margin-top:3px">{{ a.excerpt }}</div>
          </a>
        </div>
      </div>
    </template>

    <div style="margin-top:34px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px;background:#fff;border:1px solid #E6EBF3;border-radius:18px;padding:26px 28px">
      <div>
        <div style="font-size:18px;font-weight:700;color:#0F1B33">Toujours besoin d'aide ?</div>
        <div style="font-size:14.5px;color:#64748B;margin-top:4px">Notre équipe vous répond sous 24&nbsp;h ouvrées.</div>
      </div>
      <button type="button" @click="$router.push('/contact')"
              style="font-size:15px;font-weight:600;color:#fff;padding:13px 24px;border-radius:999px;background:linear-gradient(135deg,#3B82F6,#1D4ED8);border:0;cursor:pointer">
        Contacter le support
      </button>
    </div>
  </div>
</section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { HELP_ARTICLES, HELP_CATS } from '../content/help-articles'

/**
 * Article du centre d'aide.
 *
 * L'application ouvre `verebona.fr/aide/<id>` depuis sa modale : sans cette
 * page, chaque lien répondait 404.
 *
 * Un identifiant inconnu n'est pas une erreur technique — un article a pu
 * être renommé. On l'annonce et on renvoie vers le centre d'aide, plutôt que
 * d'afficher une page vide.
 */
const route = useRoute()

const article = computed(() =>
  HELP_ARTICLES.find((a) => a.id === route.params.slug) ?? null,
)

const categorie = computed(() =>
  article.value ? HELP_CATS[article.value.cat] : '',
)

/** Trois articles voisins : lire une réponse appelle souvent la suivante. */
const memeCategorie = computed(() =>
  article.value
    ? HELP_ARTICLES.filter((a) => a.cat === article.value!.cat && a.id !== article.value!.id).slice(0, 3)
    : [],
)
</script>
