# Textes de la rubrique « Légal » — où et comment les coller

Ce dossier est la **source unique** des cinq contenus juridiques du site
(chantier 104P). Aucun texte juridique n'est écrit ailleurs dans le code.
Les textes sont **fournis par le PO** et collés **mot pour mot** : on ne
reformule rien, on ne corrige rien.

**Chantier 108P-L : les textes se déposent avec l'outil d'import**
(`npm run legal:importer-textes -- <export>`, voir `docs/legal.md` § 3 bis), qui
convertit la forme et contrôle la fidélité mot pour mot. Une retouche à la main
après l'import fait échouer `npm test`.

Tant qu'un fichier contient le marqueur `<!-- TEXTE-JURIDIQUE-A-FOURNIR -->`,
le build échoue (`scripts/check-legal-texts.mjs`) : rien ne peut partir en
ligne avec un texte manquant.

## Les fichiers

| Onglet | URL | Fichier à remplir |
|---|---|---|
| Mentions légales | `/legal/mentions-legales` | `mentions-legales.html` |
| CGUV | `/legal/cguv` | `cguv/versions/<code>.html` (une version par fichier, voir plus bas) |
| Confidentialité | `/legal/confidentialite` | `confidentialite.html` |
| Sous-traitants et prestataires | `/legal/sous-traitants` | `sous-traitants.html` |
| Parrainage | `/legal/parrainage` | `parrainage.html` |

Autres fichiers :

- `documents.json` — date « Dernière mise à jour » facultative de chaque
  contenu (`"AAAA-MM-JJ"` ou `null`). Si le texte fourni contient déjà sa
  date, laisser `null` (sinon elle s'afficherait deux fois).
- `controles.json` — termes interdits dans le contenu servi (CGSU, CGVU,
  « Standard gratuite », « Pro », « Contact DPO », « 2025 »…). Règles
  modifiables si le PO le décide.
- `cguv/empreintes.lock.json` — **verrou** des versions publiées des CGUV
  (empreinte SHA-256 et métadonnées figées). Ne jamais le modifier à la main.

## Format : du HTML très simple

Chaque fichier est un **fragment HTML** (pas de `<html>`, `<head>` ni `<body>`
pour les quatre contenus ; pour les CGUV, on colle dans `<article>`).
Remplacer la ligne du marqueur par le texte, en suivant ces règles :

| Dans le texte fourni | À écrire |
|---|---|
| Titre de partie (« 1. Objet ») | `<h2>1. Objet</h2>` |
| Sous-titre (« 1.1 … ») | `<h3>1.1 …</h3>` (puis `<h4>` si besoin) |
| Paragraphe | `<p>…</p>` (un par paragraphe) |
| Liste à puces | `<ul><li>…</li><li>…</li></ul>` |
| Liste numérotée | `<ol><li>…</li></ol>` |
| Gras / italique | `<strong>…</strong>` / `<em>…</em>` |
| Lien | `<a href="https://…">…</a>`, `<a href="mailto:dpo@verebona.com">dpo@verebona.com</a>`, ou `<a href="/legal/cguv">…</a>` |
| Tableau (ex. sous-traitants) | `<table><thead><tr><th>…</th></tr></thead><tbody><tr><td>…</td></tr></tbody></table>` |
| Saut de ligne dans un paragraphe | `<br>` |

Règles vérifiées au build :

- pas de `<h1>` (la page a déjà son titre), pas de `<script>`, pas de `<style>`,
  pas d'attribut `style`, `class` ou `onclick` ;
- les caractères spéciaux s'écrivent normalement (é, à, «  », ’, €) : le
  fichier est en UTF-8. Seuls `<` et `&` isolés s'écrivent `&lt;` et `&amp;`.

Exemple (contenu FACTICE, uniquement pour montrer la forme) :

```html
<h2>1. Titre de partie</h2>
<p>Premier paragraphe.</p>
<ul>
<li>Premier point.</li>
<li>Second point.</li>
</ul>
```

## CGUV : une version = deux fichiers, figés à la publication

Dans `cguv/versions/` :

- `<code>.html` — le fichier **servi octet pour octet** à
  `/legal/cguv/versions/<code>.html` et dont l'empreinte SHA-256 est publiée
  dans le manifeste. Le texte des CGUV se colle **dans `<article>`**, à la
  place du marqueur. Ne rien changer d'autre dans le fichier.
- `<code>.json` — métadonnées :

| Champ | Qui décide | Valeur |
|---|---|---|
| `code` | — | `AAAA-MM-JJ-vN`, jour réel de publication (ne jamais réutiliser) |
| `origin` | — | `site` (version publiée par le site) ou `archive-application` |
| `title` | — | « Conditions générales d’utilisation et de vente » |
| `publishedAt` | PO | date et heure de publication, UTC, ex. `2026-10-30T08:00:00Z` (même jour que le code) |
| `effectiveAt` | PO | entrée en vigueur, UTC (égale ou postérieure à `publishedAt`) |
| `requiresReacceptance` | **PO** | `true` = modification substantielle (tous les utilisateurs devront réaccepter), `false` = non |
| `changeSummary` | PO | résumé en mots simples affiché sur l'écran de réacceptation ; **obligatoire si `true`** ; `null` sinon possible |

Une fois la version **figée** (`npm run legal:figer-cguv -- <code>`), plus
rien ne change : ni les octets du `.html`, ni les dates, ni la décision. Une
correction, même d'une virgule, se fait par une **nouvelle version**. Le
build et les tests échouent si une version figée est modifiée ou supprimée.

La procédure complète (nouvelle version, archive 2026-07-30-v1, ordre de mise
en ligne) est dans `docs/legal.md`.

## Version historique 2026-07-30-v1 (archive de l'application)

`cguv/versions/2026-07-30-v1.json` existe, **sans** fichier `.html` : tant
que l'original n'a pas été importé avec `scripts/import-cguv-archive.mjs`,
cette version **n'apparaît ni dans le manifeste ni dans l'historique** du
site (l'application continue de servir sa propre archive). Elle n'est jamais
régénérée ni recopiée à la main : voir `docs/legal.md`, section « Reprendre
la version 2026-07-30-v1 ».
