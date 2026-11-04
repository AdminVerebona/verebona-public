# Recette — audit Bing Webmaster Tools du 02/11/2026 (chantier 105Q)

Dépôt : site public Verebona, branche `l104-pub` (après 104P « Légal » et 105P « Ressources / aide »).
Relevé fait sur le **HTML réellement servi** par `server.cjs` (sans JavaScript), build de **production** (`npm run build`, mode prélancement), avant et après le chantier. Outil : `scripts/check-seo-html.mjs` (étape du build ; `npm run check:seo-html -- --json` pour le relevé complet).

Résultat : **21 défauts avant, 0 après** sur 137 pages contrôlées (136 URL du sitemap + `/contact`).

## 1. Les 13 `<title>` trop longs (§2)

Partout : **HTTP 200**, **H1 inchangé**, **slug et canonical inchangés**, **meta description inchangée**, **indexable** (ni `noindex`, ni `X-Robots-Tag`), présent au sitemap.

| URL | Ancien `<title>` (car.) | Nouveau `<title>` (car.) | H1 (inchangé) |
| --- | --- | --- | --- |
| /aide/downgrade-impaye-duo | Que se passe-t-il lors d’un downgrade ou d’un impayé Duo ? \| Aide Verebona (74) | Premium Duo : impayé ou changement d’offre \| Aide Verebona (58) | Que se passe-t-il lors d’un downgrade ou d’un impayé Duo ? |
| /aide/interroger-verebona-donnees | Interroger Verebona sur ses biens, documents et échéances \| Aide Verebona (73) | Interroger ses biens et documents \| Aide Verebona (49) | Interroger Verebona sur ses biens, documents et échéances |
| /aide/confiance-conflits-valeurs | Comprendre confiance, conflits et protection des valeurs \| Aide Verebona (72) | IA : confiance et conflits de données \| Aide Verebona (53) | Comprendre confiance, conflits et protection des valeurs |
| /aide/classement-rattachement-document | Comprendre le classement et le rattachement d’un document \| Aide Verebona (73) | Classer et rattacher un document \| Aide Verebona (48) | Comprendre le classement et le rattachement d’un document |
| /aide/ecriture-bloquee | Je ne peux plus ajouter ou modifier un bien ou un document \| Aide Verebona (74) | Ajout ou modification bloqués \| Aide Verebona (45) | Je ne peux plus ajouter ou modifier un bien ou un document |
| /aide/assistant-aide-application | Comment Verebona répond aux questions sur l’application \| Aide Verebona (71) | Assistant : questions sur l’application \| Aide Verebona (55) | Comment Verebona répond aux questions sur l’application |
| /aide/mois-offerts-parrainage | Comprendre l’application des mois offerts de parrainage \| Aide Verebona (71) | Mois offerts : échéances et parrainage \| Aide Verebona (54) | Comprendre l’application des mois offerts de parrainage |
| /aide/recherche-donnees-vs-aide | Différencier recherche de données et recherche dans le Centre d’aide \| Aide Verebona (84) | Recherche : données ou Centre d’aide ? \| Verebona (49) | Différencier recherche de données et recherche dans le Centre d’aide |
| /aide/historique-dossiers-generes | Retrouver, télécharger, relancer ou supprimer un dossier généré \| Aide Verebona (79) | Dossiers générés : historique et actions \| Aide Verebona (56) | Retrouver, télécharger, relancer ou supprimer un dossier généré |
| /aide/quitter-retirer-duo | Retirer le second utilisateur ou quitter un espace partagé \| Aide Verebona (74) | Quitter le Duo ou retirer un membre \| Aide Verebona (51) | Retirer le second utilisateur ou quitter un espace partagé |
| /aide/invitation-transmission-duo-probleme | Une invitation de transmission ou Duo ne fonctionne pas \| Aide Verebona (71) | Invitation Duo ou transmission invalide \| Aide Verebona (55) | Une invitation de transmission ou Duo ne fonctionne pas |
| /aide/email-verification-non-recu | Je ne reçois pas l’e-mail de vérification ou de réinitialisation \| Aide Verebona (80) | E-mail de vérification non reçu \| Aide Verebona (47) | Je ne reçois pas l’e-mail de vérification ou de réinitialisation |
| /ressources | Ressources pratiques : factures, garanties, échéances et assurances \| Verebona (78) | Guides : factures, garanties et échéances \| Verebona (52) | Ressources |

Canonical de chaque ligne : `https://www.verebona.fr` + l'URL (identique avant/après).

Mécanisme : le `seoTitle` existant du frontmatter (aide) et la constante `RESSOURCES_TITLE` (index Ressources). Aucun second système, aucun gabarit automatique. Les libellés ont été relus contre le premier paragraphe de chaque article : ils correspondent au contenu publié.

Dates : les 12 articles sont **publiés** (aucun n'est `blocked`). Modifier leur frontmatter impose `updatedAt` = date du jour (contrôle `check:help-dates`, EDITOR-02) ; or le build refuse un `validatedAt` antérieur à `updatedAt`. Les deux passent donc au **2026-11-02** (libellés validés au ticket, comme AID-TODO-001 au lot 105P). Conséquence : l'empreinte du catalogue d'aide (`tests/l66p-charte.test.ts`) change ; vérifié : **seules ces 24 dates** diffèrent (dates remises à l'ancienne valeur → ancienne empreinte retrouvée). Commentaire ajouté dans le test.

Contrôles automatiques (`tests/l105q-seo-bing.test.ts`, `scripts/check-seo-html.mjs`) : titres exacts ; unicité de tous les `<title>` servis ; suffixe de marque jamais doublé (« Découvrir Verebona \| Aide Verebona » reste admis : la marque y est le sujet) ; 13 titres ≤ 65 caractères, jamais tronqués.

## 2. Les 4 H1 manquants (§3)

| URL signalée | État servi | Arbitrage | Page finale : HTTP, H1, canonical |
| --- | --- | --- | --- |
| /cgu | **301** → /legal/cguv (lot 104P) | Pas de H1 sur une URL redirigée : une 301 n'a pas de contenu. Bing a vu l'ancienne page à onglets ; il suivra la 301 au prochain passage. | 200 · H1 « Conditions générales d’utilisation et de vente (CGUV) » · https://www.verebona.fr/legal/cguv |
| /confidentialite | **301** → /legal/confidentialite | idem | 200 · H1 « Politique de confidentialité » · https://www.verebona.fr/legal/confidentialite |
| /mentions-legales | **301** → /legal/mentions-legales | idem | 200 · H1 « Mentions légales » · https://www.verebona.fr/legal/mentions-legales |
| /contact | avant : 200, coquille SPA vide (titre « Verebona », **aucun H1**, pas de canonical) | Page pré-rendue au build (`dist/.pages/contact.html`), servie par `server.cjs` | 200 · H1 « **Contacter Verebona** » · title « Contact \| Verebona » · canonical https://www.verebona.fr/contact · description propre |

Pages légales : un seul H1 par page, visible dans le HTML pré-rendu, en accès direct, sans clic d'onglet (les onglets sont des liens vers des URL stables). Le H1 de /legal/cguv n'est **pas** remplacé par le libellé du ticket (« Conditions générales de service et d’utilisation ») : le libellé juridique relève des tickets légaux (#621 / 104P), il n'est pas modifié ici. `/legal` seul : 301 → /legal/mentions-legales.

`/contact` reste **hors sitemap** (liste explicite, décision antérieure) mais indexable et canonique. À ajouter au sitemap seulement sur décision PO.

Vérifié aussi : `/contact` avec un agent mobile (iPhone) et avec l'agent bingbot → même HTML, même H1. Redirection d'hôte (`CANONICAL_HOST`) : `http://verebona.fr/cgu` → **une seule** 301 vers `https://www.verebona.fr/legal/cguv`.

## 3. Images de l'accueil (§4)

Le HTML servi de `/` contient **18** `<img>` ; **toutes** portaient déjà `alt=""` (aucun attribut absent). Bing compte un `alt` vide comme « manquant » : c'est la source des 15 occurrences. Correction : les **captures produit** (informatives) ont maintenant un texte ; le décor garde `alt=""` (règle WCAG : une image décorative doit être ignorée par les lecteurs d'écran). Bing pourra donc continuer à signaler les images décoratives : c'est voulu, pas un défaut.

| Image (`src`) | Rôle | `alt` avant | `alt` après |
| --- | --- | --- | --- |
| /assets/app-desktop-accueil.webp | capture produit (carrousel) | "" | Tableau de bord de l’application sur ordinateur : biens et prochaines échéances |
| /assets/app-desktop-biens.webp | capture produit | "" | Écran Mes biens : logements, véhicules et objets, chacun avec sa photo |
| /assets/app-desktop-agenda.webp | capture produit | "" | Agenda annuel : entretiens, contrôles et fins de garantie mois par mois |
| /assets/app-desktop-documents.webp | capture produit | "" | Écran Mes documents : contrôles techniques et diagnostics rattachés à leur bien |
| /assets/app-mobile-accueil.webp | capture produit (téléphone ; le cadre n'est plus `aria-hidden`) | "" | Accueil de l’application sur mobile : biens et prochaines échéances |
| appartement-lyon, velo-cargo, surf-personal (héros) | dans le montage `role="img"` déjà nommé « Aperçu de Verebona : documents classés par bien et prochaine échéance » | "" | "" (inchangé) |
| appartement-lyon (×2 : « Comment ça marche », Fonctionnalités) | dans des illustrations `aria-hidden` dont le texte réel est à côté | "" | "" |
| mascottes (welcome-wave, search-loupe, document-analysis-pdf, neutral, thumbs-up ×3, security-shield) | décor | "" | "" |

Le carrousel ne montre qu'une capture à la fois (`display:none` sur les autres) : un lecteur d'écran n'en lit qu'une. Dimensions, `loading="lazy"` et responsive inchangés. Aucun mot-clé ajouté, « Verebona » non répété dans les `alt`.

Cause dans les composants réutilisés : aucun composant partagé (logo, cartes d'aide et de Ressources, icônes) ne produit d'image sans `alt`. Le logo est un SVG `aria-hidden` ; le seul lien-image (logo de l'en-tête) a déjà son nom accessible (`aria-label="Verebona — accueil"`). Garde-fou ajouté : test qui refuse toute balise `<img>` sans attribut `alt` dans `src/**/*.vue`, et contrôle du HTML servi (captures produit décrites).

Audit axe-core (`npm run test:a11y`) : **non exécuté ici** (pas de navigateur sur la machine de build). À lancer sur un poste avec Chromium avant mise en production.

## 4. Fiabilisation SEO (§5)

| Contrôle (HTML servi, production) | Résultat |
| --- | --- |
| 136 URL du sitemap : 200, un `<title>`, meta description, un H1, canonical absolue = l'URL, pas de `noindex` | OK (avant comme après) |
| Sitemap : seulement `https://www.verebona.fr/…`, ni redirection, ni 404, ni préproduction, ni `/inscription`, ni permaliens CGUV, ni doublon | OK — 136 URL (Bing en avait découvert 145 : les articles bloqués au lot 105P en sont sortis) |
| robots.txt production | `Allow: /` + une ligne `Sitemap:` |
| Préproduction | `noindex` partout (meta + `X-Robots-Tag`), robots.txt `Disallow: /`, pas de sitemap, pas d'IndexNow |
| Adresse inconnue | 404 réelle |
| JSON-LD | Organization + WebSite sur l'accueil seulement, déjà conformes (nom « Verebona », logo officiel, URL canonique ; pas de `sameAs` : aucun profil social officiel publié). Ni prix ni note. |

`seoTitle` indépendant du H1 (aide et Ressources) : désormais **facultatif** ; absent, repli « H1 \| Aide Verebona » (aide) ou « H1 \| Verebona » (Ressources), avec « \| Verebona » si le résultat dépasse 65 caractères. Jamais tronqué, jamais de suffixe doublé (`src/config/seo-title.rules.ts`). Les 100 articles d'aide et les 31 Ressources ont déjà tous un `seoTitle` : le repli ne change aucune page aujourd'hui.

`SoftwareApplication` : **non ajouté**. Le site est en prélancement (« Ouverture prochaine ») ; ce balisage n'a d'intérêt pour les moteurs qu'avec un prix et une note, et le ticket interdit d'en inventer. À reconsidérer à l'ouverture, avec les vrais prix du catalogue.

IndexNow : **n'existait pas** ; implémenté, **inactif tant que `INDEXNOW_KEY` n'est pas définie** en production. Détails : `docs/seo/indexnow.md`. Essai local : diff entre ce build et le build « avant » → exactement les 14 URL modifiées (accueil, 12 articles, /ressources) ; aucune notification réelle envoyée depuis le poste.

Pas d'analytics ni de pixel ajouté (testé).

## 5. Promesses produit (§5)

| Mention | Réalité (application `verebona-app-main`) | Action |
| --- | --- | --- |
| « authentification à deux facteurs (2FA) » — accueil, carte « Connexion sécurisée » (texte + pictogramme « 2FA ») | **Aucune double authentification en V1** (décision PO Q2, lot 96B ; connexion mot de passe, Google ou Apple) | **Retirée** du texte et du pictogramme. Texte : « Verebona utilise une connexion chiffrée pour protéger les échanges avec l'application. » |
| « Ouverture prochaine » (en-tête), « Verebona arrive bientôt », « Bientôt disponible » (tarifs), description « Disponible bientôt » | Affichés **seulement en mode PRELAUNCH**, qui est le mode actuel de la production | Cohérent : rien modifié. Ils disparaissent seuls au passage en mode FULL. |
| Accueil, bloc « Sécurité » : « hébergées en France », « sauvegardées chaque jour », « sauvegardes chiffrées… serveurs redondants » | Non vérifiable depuis le code de l'application (relève de l'hébergeur) | **À confirmer par le PO** (non modifié). |

## 6. Fichiers modifiés

- `src/content/aide/articles/` : AID-DUO-005, AID-SEARCH-003, AID-AI-003, AID-DOC-005, AID-HELP-006, AID-AI-005, AID-BILL-011, AID-SEARCH-004, AID-DOSSIER-008, AID-DUO-006, AID-HELP-010, AID-HELP-003 (`seoTitle`, `updatedAt`, `validatedAt`).
- `src/ressources/head.ts` (titre de /ressources) ; `src/help/corpus.ts`, `src/ressources/corpus.ts` (`seoTitle` facultatif, repli) ; nouveau `src/config/seo-title.rules.ts`.
- `src/views/ContactView.vue` (H1) ; `src/config/head.rules.ts` (description de /contact) ; nouveau `src/config/site-pages.ts` ; `src/entry-prerender.ts`, `scripts/prerender.mjs` (pré-rendu de /contact) ; `server.cjs` (sert `dist/.pages/`, IndexNow).
- `src/sections/AppShowcaseSection.vue` (alt des captures) ; `src/sections/TrustSection.vue` (2FA retirée).
- Nouveaux : `scripts/check-seo-html.mjs`, `scripts/indexnow-prepare.mjs`, `scripts/lib/indexnow.cjs`, `tests/l105q-seo-bing.test.ts`, `docs/seo/indexnow.md`, ce document.
- `package.json` (étapes `check-seo-html` et `indexnow-prepare` dans les deux builds, scripts `check:seo-html`, `indexnow:prepare`), `tsconfig.node.json`, `README.md`.
- Tests ajustés avec commentaire : `tests/l69p-mobile-demo.test.ts` (captures désormais décrites), `tests/l66p-charte.test.ts` (empreinte du catalogue).

URL dont le HTML change : `/`, `/contact`, `/ressources` et les 12 articles ci-dessus.

## 7. Résultats d'exécution (02/11/2026)

- `npm test` : 36 fichiers, 469 tests réussis, 2 ignorés.
- `npm run build` (production) et `npm run build:preprod` : tout passe jusqu'à `check-legal-texts`, qui bloque comme attendu (textes juridiques non fournis) ; l'étape suivante `check-preview-chunk` passe lancée à part. La publication avec des textes juridiques complets reste couverte par `tests/l104p-legal-*.test.ts` (sources factices temporaires).
- `npm run check:help-dates` : **échoue sur AID-ASSET-002**, article **non touché** par ce chantier (updatedAt 2026-09-26 antérieur à un commit de contenu du 2026-09-28) — défaut antérieur, à corriger par la rédaction. Les 12 articles modifiés passent ; ils devront être **commités le 2026-11-02**, sinon avancer leur `updatedAt` (et `validatedAt`) à la date du commit.

## 8. Points ouverts pour le PO

1. **AID-HELP-013 et AID-NOTIF-005** (bloqués au lot 105P) ont le même H1 et le même `<title>` (« Je ne reçois pas mes notifications ») : à départager avant toute republication. En préproduction (où ils sont visibles), le contrôle le signale sans bloquer ; en production il bloquerait.
2. Sept titres d'aide font 68–69 caractères (non signalés par Bing) : /aide/gerer-pieces-equipements, /aide/gerer-echeance, /aide/echeances-detectees-documents, /aide/synchroniser-agenda-personnel, /aide/dossier-transmission-export, /aide/historique-modifications-automatiques, /aide/gerer-paiement-factures-stripe. Information seulement.
3. Mentions « hébergement en France / sauvegardes quotidiennes chiffrées » à confirmer.
4. Recherche de marque « verebona » (Bing propose « Vérone ») : à suivre à part, dans la durée ; ce chantier ne garantit aucun classement.

## 9. Après déploiement (à faire)

1. Définir `INDEXNOW_KEY` en production (voir `docs/seo/indexnow.md`), redéployer, vérifier `https://www.verebona.fr/<clé>.txt` et la ligne `[indexnow] … notifiée(s)` dans les logs.
2. `curl -s https://www.verebona.fr/contact | grep '<h1'` → « Contacter Verebona » ; `curl -sI https://www.verebona.fr/cgu` → 301 ; vérifier un des 13 titres.
3. Bing Webmaster Tools : **Inspection d'URL** de l'accueil, puis « Analyse du site » (SEO) ; ne pas redemander l'indexation de pages déjà soumises. Les alertes disparaissent au recrawl, sur plusieurs jours.
4. Suivre sur 2 à 4 semaines : pages indexées (Index Bing), impressions et position sur la requête « verebona ».
5. Lancer `npm run test:a11y` sur un poste avec Chromium.
