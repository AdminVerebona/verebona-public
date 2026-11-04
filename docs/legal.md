# Rubrique « Légal » du site public — exploitation (chantier 104P)

Référence d'interface (fait foi) : dépôt **verebona-app**,
`docs/exploitation/contrat-site-public-legal.md`. Ce document décrit la
mise en œuvre côté site public : ce qui est servi, comment publier, et
dans quel ordre mettre en ligne.

## 1. Ce que le site sert

| Adresse | Réponse |
|---|---|
| `/legal/mentions-legales`, `/legal/cguv`, `/legal/confidentialite`, `/legal/sous-traitants`, `/legal/parrainage` | 200, page à 5 onglets ouverte sur le bon onglet (HTML pré-rendu, lisible sans JavaScript) |
| `/legal/cguv` | toujours la version en vigueur (= la plus récente publiée), avec son code et son lien permanent — **pas d'annuaire public** des anciennes versions (108P-L, décision PO) |
| `/legal/cguv/versions/{code}` | 200 : exactement cette version. Code inconnu : **404 explicite**, jamais la version courante |
| `/legal/cguv/versions/{code}.html` | le texte figé, **octet pour octet** : `text/html; charset=utf-8`, `Cache-Control: public, max-age=31536000, immutable`, `ETag: "sha256-<empreinte>"` |
| `/legal/cguv/versions.json` | le manifeste `verebona-legal-cguv-versions-v1` : `application/json; charset=utf-8`, `Cache-Control: public, max-age=300` |
| `/mentions-legales`, `/cgu`, `/cgvu`, `/cguv`, `/confidentialite`, `/legal` | **301** vers `/legal/mentions-legales`, `/legal/cguv` (×3), `/legal/confidentialite`, `/legal/mentions-legales` (query conservée, une seule redirection, aussi côté routeur) |

En préproduction protégée (`BASIC_AUTH_ENABLED=true`), le manifeste et les
textes figés restent lisibles **sans identifiants** : l'application les lit
de serveur à serveur. Les pages, elles, restent protégées.

Le contenu juridique est le même en préproduction et en production : les
textes figés ont **la même empreinte** ; seules les URL du manifeste changent
(`VITE_PUBLIC_SITE_URL` : `https://preprod.verebona.fr` /
`https://www.verebona.fr`, dans `.env.preprod` / `.env.production`).

## 2. Où sont les sources

Tout est dans `src/content/legal/` (voir le `README.md` de ce dossier pour
le format de collage). Le build :

1. lit et contrôle les sources (`scripts/lib/legal-core.mjs`) — un défaut de
   structure ou une version figée modifiée arrête le build tout de suite ;
2. pré-rend les pages (`scripts/prerender.mjs`, dans `dist/legal/.pages/`) ;
3. `scripts/publish-legal.mjs` copie chaque texte figé octet pour octet dans
   `dist/legal/cguv/versions/`, vérifie son empreinte contre le verrou, puis
   écrit le manifeste **en dernier** (fichier temporaire puis renommage) ;
4. `scripts/check-legal-texts.mjs` **bloque** le build si un marqueur
   `<!-- TEXTE-JURIDIQUE-A-FOURNIR -->` ou une décision du PO manque, si le
   manifeste est absent ou non conforme, si un fichier servi ne donne pas
   l'empreinte annoncée, ou si un terme interdit apparaît dans le contenu
   servi (règles : `src/content/legal/controles.json`).

Aucune version publiée n'est réécrite par Vite ou par le serveur : les
fichiers figés ne passent jamais par Vite, et `server.cjs` les envoie tels
qu'ils sont lus. `.gitattributes` empêche Git de convertir leurs fins de ligne.

## 3. Ordre de mise en ligne

1. **Site public d'abord** (préproduction, puis production) — une fois les
   textes collés, la version 2026-10-30-v1 figée, et le build vert.
   Vérifier : `curl -sI https://preprod.verebona.fr/legal/cguv` (200),
   `curl -sI https://preprod.verebona.fr/cgu` (301),
   `curl -s https://preprod.verebona.fr/legal/cguv/versions.json`, puis
   l'empreinte du texte servi :
   `curl -s https://preprod.verebona.fr/legal/cguv/versions/2026-10-30-v1.html | sha256sum`
   (doit être égale à `sha256` du manifeste).
2. **Application ensuite** : BO › CGUV › « Relire le manifeste ». À la
   première lecture réussie, l'application bascule seule ses liens vers
   `/legal/…` (au plus 60 s par serveur).
3. **Ne pas forcer `LEGAL_PUBLIC_V2=on`** côté application : la bascule est
   automatique et ne se fait que si le manifeste est réellement servi.
   Forcer avant la livraison du site ferait pointer les liens vers des pages
   absentes. Laisser la variable vide ; `off` ne sert qu'à figer le repli en
   cas d'incident.
4. L'inventaire des liens (`link-inventory.json`) a changé : le recopier dans
   l'application (`node scripts/sync-public-link-inventory.mjs <dépôt vitrine>`
   côté verebona-app) et y relancer ses tests de liens.

## 3 bis. Déposer les textes fournis par le PO (108P-L) — sans réécriture

Les textes ne se collent plus à la main : `npm run legal:importer-textes -- <export>`
convertit la FORME (titres, paragraphes, gras / italique, sauts de ligne « deux
espaces », listes, tableaux, liens) et refuse tout écart de FOND.

Formats acceptés : corpus Markdown du PO (`.md`), export Google Docs « Page Web »
(`.zip` ou `.html`), export Word (`.docx`). Découpage en cinq contenus :
`src/content/legal/import/decoupage.json` (section `markdown` pour le corpus).

1. Déposer le fichier reçu, sans l'ouvrir dans un éditeur, dans
   `src/content/legal/import/sources/` (il est la référence de la recette).
2. `npm run legal:importer-textes -- src/content/legal/import/sources/<fichier> --lister`
   : blocs trouvés → contenus. Ajuster `decoupage.json` si un titre n'est pas reconnu.
3. Essai à blanc (sans option) : conversion + **contrôle de fidélité mot pour mot**
   (texte source extrait indépendamment == texte relu des fragments produits). Rien
   n'est écrit ; tout écart, élément non pris en charge (notes, images, suivi des
   modifications, lien non HTTPS) ou texte hors bloc est **refusé** avec le passage en cause.
4. `--ecrire` : dépose les quatre fragments et l'`<article>` de la version CGUV non
   figée (créée par `legal:nouvelle-cguv`) — rien d'autre du fichier ne change — puis
   écrit `src/content/legal/import/dernier-import.json` (empreinte de la source et du
   texte de chaque contenu). `npm test` échoue si un contenu est retouché à la main
   ensuite (`tests/l108p-legal-import.test.ts`, L108P-IMP-20).
5. `--verifier` (recette, « comparaison des textes ») : compare la source aux textes
   déposés, contenu par contenu ; n'écrit rien.
6. Puis § 4 (décisions du PO, `legal:figer-cguv`), `npm test`, build.

État au 03/11/2026 : corpus `corpus-juridique-2026-10-30.md` (sha256
`2f5a09d1233a5f933e097c0fb3c7b6f85ea27ac70c865d691d18c819139de860`) déposé ; texte
figé `cguv/versions/2026-10-30-v1.html` : sha256
`f57a64847c32e1f715dd77439c47d480099b1cd2d4005ae973497b051bbb3240` (empreinte que le
manifeste publiera, octets inchangés au gel). Version **non figée** : `publishedAt`,
`effectiveAt` et `requiresReacceptance` attendent la décision du PO ; tant qu'ils
manquent, le build est bloqué et la version n'est jamais présentée comme courante.

## 4. Publier une nouvelle version des CGUV

1. `npm run legal:nouvelle-cguv -- AAAA-MM-JJ-vN` (jour réel de publication ;
   `v2`, `v3`… si plusieurs le même jour). Crée `<code>.html` (gabarit avec le
   marqueur) et `<code>.json`.
2. Coller le texte fourni par le PO **dans `<article>`** du `.html`, à la
   place du marqueur. Ne rien modifier d'autre.
3. Compléter le `.json` avec les décisions du PO : `publishedAt`,
   `effectiveAt`, `requiresReacceptance`, `changeSummary` (voir § 5).
4. `npm run legal:figer-cguv -- <code>` : refuse tant que quelque chose
   manque ; sinon écrit l'empreinte et les métadonnées dans
   `src/content/legal/cguv/empreintes.lock.json`.
5. Commiter les trois fichiers, déployer le site (préproduction puis
   production), puis BO › CGUV › « Relire le manifeste ».

La nouvelle version devient la version en vigueur affichée sur
`/legal/cguv` (la plus récente). Les anciennes restent publiées à vie.

## 5. Comment le PO décide `requiresReacceptance`

C'est une décision du PO, prise **avant** de figer la version, et qui ne
change plus jamais (l'application refuse une décision modifiée après coup).

- `true` (substantielle) : le changement touche les droits ou obligations
  des utilisateurs (prix ou mode de facturation, durée, résiliation,
  rétractation, conservation ou usage des données, responsabilités…). Tous
  les utilisateurs qui n'ont pas accepté cette version seront bloqués par un
  écran dédié à partir de `effectiveAt`, jusqu'à leur acceptation.
  `changeSummary` est alors obligatoire : 2 ou 3 phrases simples qui disent
  ce qui change (ce n'est pas le texte juridique).
- `false` (non substantielle) : correction de forme, faute de frappe,
  précision sans effet sur les droits. Aucune réacceptation, aucun blocage.

En cas de doute, le PO tranche avec son conseil juridique ; le site ne
décide jamais à sa place (le champ reste `null` et le build échoue).

## 6. Reprendre la version 2026-07-30-v1 (archive de l'application)

Cette version a été publiée autrefois par l'application ; des utilisateurs
l'ont acceptée. Elle n'est **jamais régénérée** : on reprend ses octets
d'origine.

1. Dans l'application, **BO › CGUV** (`/admin/cguv`) : relever l'empreinte
   SHA-256 de la version 2026-07-30-v1 (et sa date de publication d'origine).
2. Télécharger l'original figé depuis l'application :
   `https://<app>/api/legal/cgvu/versions/2026-07-30-v1/download`
   (pièce jointe), ou `https://<app>/cguv/versions/2026-07-30-v1` (réponse
   `X-Legal-Source: archive-historique`), par exemple
   `curl -sS -o cguv-2026-07-30-v1.html https://app.verebona.fr/api/legal/cgvu/versions/2026-07-30-v1/download`.
   Ne pas ouvrir ni réenregistrer le fichier avec un éditeur.
   Attention : une fois l'archive reprise par le site, l'application
   redirige ces adresses vers le site — télécharger AVANT.
3. Importer :
   `node scripts/import-cguv-archive.mjs cguv-2026-07-30-v1.html --code 2026-07-30-v1 --sha256 <empreinte relevée>`
   (option `--published-at 2026-07-30T…Z` si la date d'origine n'est pas
   minuit UTC). Le script **refuse** le fichier si son empreinte diffère et
   n'écrit rien.
4. Commiter `2026-07-30-v1.html`, `2026-07-30-v1.json` et le verrou, puis
   déployer.

Tant que cet import n'est pas fait, 2026-07-30-v1 **n'apparaît pas** dans le
manifeste ni dans l'historique du site (le build l'indique en
information) : l'application continue de servir sa propre archive, et ses
preuves d'acceptation restent valables. Dès que le manifeste la liste,
l'application compare l'empreinte à celle qu'elle connaît et renvoie vers le
permalien public.

## 7. Contrôles et tests

- `npm test` : `tests/l104p-legal-sources.test.ts` (sources, immuabilité,
  procédures, manifeste), `tests/l104p-legal-server.test.ts` (`server.cjs`
  démarré : 200, 301, octets servis = empreinte, 404, en-têtes, Basic Auth),
  `tests/l104p-legal-view.test.ts` (onglets, clavier, termes interdits).
- Avec `VEREBONA_APP_REPO=<clone de verebona-app> npm test`, le manifeste est
  en plus lu par le code même de l'application (`parseCguvManifest`) et
  chaque texte servi est vérifié par son `verifyTextSha256`.
- `npm run check:legal-texts -- --sources` : état des textes à fournir, sans
  build.
