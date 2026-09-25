# Verebona — Site public (Vue 3 + Vite + TypeScript)

Refonte de la partie publique de Verebona en **Vue 3** (`<script setup>` + Composition API), **Vite** et **TypeScript**. Front uniquement — aucun appel API.

## Démarrer

```bash
npm install
npm run dev        # serveur de dev (http://localhost:5173)
npm run build      # build de production (vue-tsc + vite) -> dist/
npm run preview    # prévisualise le build
```

> Node 18+ recommandé.

## Structure

```
public/
  assets/                 images (mascotte, mockups, vignettes) servies telles quelles
src/
  main.ts                 point d'entrée : app + router + directive v-hover + styles
  App.vue                 shell : <AppHeader/> <router-view/> <AppFooter/>
  style.css               polices, resets, animations de scroll-reveal, règles responsive
  router/
    index.ts              TOUTES les routes (voir ci-dessous)
  directives/
    hover.ts              v-hover : styles appliqués au survol (remplace style-hover)
  composables/
    useNav.ts             navigation header/footer + menu mobile + burger
    useLanding.ts         état/logique de la home (carrousel mockup, accordéons FAQ & cas d'usage)
    useHelp.ts            accordéon du Centre d'aide
    useContact.ts         état du formulaire de contact (front-only)
    useLegal.ts           onglets de la page légale (dérivés de la route)
    useScrollReveal.ts    apparition des éléments au scroll (IntersectionObserver)
  components/
    AppHeader.vue         header sticky (transparent en haut -> solide au scroll) + menu mobile
    AppFooter.vue         footer (Produit / Support / Légal)
  sections/               sections de la home, dans l'ordre d'affichage
    HeroSection.vue       hero + triptyque Biens/Documents/Agendas + mockups laptop & mobile
    WhySection.vue        « Pourquoi Verebona »
    UseCasesSection.vue   cas d'usage (accordéon, 7 situations)
    FeaturesSection.vue   fonctionnalités (aperçus d'UI)
    HowItWorksSection.vue « Comment ça marche »
    PricingSection.vue    tarifs
    TrustSection.vue      « Une base de confiance » (sécurité)
    FaqSection.vue        FAQ (accordéon)
    CtaSection.vue        appel à l'action
  views/
    HomeView.vue          assemble les sections de la home
    HelpView.vue          /aide
    ContactView.vue       /contact
    LegalView.vue         /mentions-legales, /cgu, /confidentialite
    NotFoundView.vue      404
```

## Routes (`src/router/index.ts`)

| Chemin              | Vue          | Note                    |
| ------------------- | ------------ | ----------------------- |
| `/`                 | HomeView     | landing complète        |
| `/aide`             | HelpView     | Centre d'aide           |
| `/contact`          | ContactView  | formulaire (front-only) |
| `/mentions-legales` | LegalView    | onglet Mentions légales |
| `/cgu`              | LegalView    | onglet CGSU             |
| `/confidentialite`  | LegalView    | onglet Confidentialité  |
| `/:pathMatch(.*)*`  | NotFoundView | 404                     |

- Les liens **header/footer** utilisent `useNav()` : les pages passent par `router.push`, et les 4 liens de section de la home (Pourquoi / Fonctionnalités / Tarifs / FAQ) routent vers `/` puis défilent vers l'ancre.
- Le **fil d'Ariane** des sous-pages et le lien « Accueil » naviguent via le router.
- La page **légale** est unique : les 3 onglets sont 3 routes distinctes (bon pour le SEO / partage de liens), l'onglet actif est déduit du chemin dans `useLegal()`.

## Sitemap et indexation

`https://www.verebona.fr/sitemap.xml` déclare aux moteurs les pages publiques à indexer. CDC _Sitemap XML du site public Verebona_ (V1).

### Où ça vit

| Fichier                       | Rôle                                                                                                    |
| ----------------------------- | ------------------------------------------------------------------------------------------------------- |
| `src/config/sitemap.rules.ts` | **source unique** : domaine canonique, liste des pages indexables, génération du XML et de `robots.txt` |
| `vite.config.ts`              | émet `dist/sitemap.xml` (production uniquement) et `dist/robots.txt`                                    |
| `src/config/canonical.ts`     | pose la balise `<link rel="canonical">` de chaque route                                                 |
| `server.cjs`                  | sert les fichiers statiques et refuse le repli SPA sur `/sitemap.xml` et `/robots.txt`                  |
| `tests/sitemap.test.ts`       | recette automatisée du contenu produit                                                                  |
| `tests/server.test.ts`        | recette HTTP : `/sitemap.xml` en 200 `application/xml`, 404 (jamais du HTML) pour tout fichier absent   |

Le sitemap **n'est pas dérivé du router** : c'est une liste explicite (CDC §8). Le router déclare aussi les pages légales, `/contact` et la redirection `/inscription`, toutes hors périmètre. Seule exception : les pages du Centre d'aide (thèmes et articles publiés), dérivées du corpus au build (CDC Centre d'aide SEO-02) — voir ci-dessous.

Aucun `lastmod`, `changefreq` ni `priority` en V1 (§7). Aucun sitemap n'est produit hors production, et `robots.txt` y passe en `Disallow: /` (§10).

### Maintenir la liste (§11)

Tout se joue dans `INDEXABLE_PATHS` de `src/config/sitemap.rules.ts`. Une page n'y entre **qu'au moment de sa mise en production**, jamais par anticipation, et seulement si elle est : publique, sans authentification, en HTTP 200, non `noindex`, et destinée à être indexée (§3.2).

| Évènement                                | Geste                                    |
| ---------------------------------------- | ---------------------------------------- |
| nouvelle page publique indexable         | ajouter son chemin à `INDEXABLE_PATHS`   |
| sous-page du centre d'aide mise en ligne | ajouter `/aide/<id>` au même déploiement |
| page supprimée ou passée en `noindex`    | retirer son chemin                       |

Après modification : `npm run test` (la recette verrouille le contenu attendu) puis `npm run build`, et vérifier `dist/sitemap.xml`.

### Recette sur l'environnement déployé

Ce que les tests ne peuvent pas couvrir depuis le poste de développement :

```bash
curl -sI https://www.verebona.fr/sitemap.xml   # 200 + Content-Type: application/xml; charset=utf-8
curl -s  https://www.verebona.fr/robots.txt    # doit contenir la ligne Sitemap:
curl -sI https://www.verebona.fr/aide          # 200, sans redirection
```

Puis, dans Google Search Console : soumettre `https://www.verebona.fr/sitemap.xml` et vérifier la disparition de l'erreur « le sitemap est un fichier HTML ».

### Search Console signale encore « le sitemap est un fichier HTML »

Le témoin le plus simple est `robots.txt` : **sans ligne `Sitemap:`, la production ne sert pas ce code** (build ancien ou déploiement en échec). Le sitemap tombe alors dans le repli SPA et répond du HTML.

1. Vérifier les logs de build de l'hébergeur. Le dépôt versionne `package-lock.json` : sans lui, `npm install` échoue avec npm 10 (fourni avec Node 20/22) sur `Cannot read properties of null (reading 'edgesOut')`, et l'ancienne version reste en ligne.
2. Vérifier que le build tourne avec `VITE_ENVIRONMENT=production` (ou sans la variable) : hors production, aucun sitemap n'est émis et `/sitemap.xml` répond 404.
3. Une fois `curl` conforme, renvoyer le sitemap dans Search Console. Le rapport ne se met à jour qu'à la lecture suivante.

> **Prérequis d'hébergement.** Le CDC impose le domaine `www.verebona.fr`. Les URLs du sitemap ne doivent pas rediriger (§7) : `www` doit être servi en direct, et c'est l'apex `verebona.fr` qui redirige vers lui — pas l'inverse. Si la configuration actuelle fait le contraire, l'inverser **avant** de soumettre le sitemap.

## Centre d'aide

`/aide` est la **source unique** de l'aide Verebona (CDC _Centre d'aide V1_) : le site, « Besoin d'aide » dans l'application et l'assistant lisent le même corpus. L'application ne contient aucun article.

### Où ça vit

| Fichier                                | Rôle                                                                                   |
| -------------------------------------- | -------------------------------------------------------------------------------------- |
| `src/content/aide/articles/AID-*.md`   | **un article par fichier**, nommé d'après son ID stable ; frontmatter + Markdown restreint |
| `src/content/aide/categories.json`     | les 14 thèmes, leur ordre et leur introduction (§11.1)                                  |
| `src/help/*.ts`                        | parsing, validation de build, recherche, sorties (fonctions pures, testées)             |
| `help.build.ts`                        | lecture du disque et dates Git (EDITOR-02)                                              |
| `vite.config.ts` (`helpCenterPlugin`)  | valide le corpus, émet catalogue, corpus assistant, redirections ; échec au 1ᵉʳ défaut   |
| `scripts/prerender.mjs`                | une page HTML statique par page publiée (SEO-01)                                        |
| `server.cjs`                           | redirections 301 (§13.1), 404 explicite, CORS des JSON, `frame-ancestors`               |

### Ce que produit chaque build

| Sortie                    | Lecteur                                   | Contenu                                                    |
| ------------------------- | ----------------------------------------- | ---------------------------------------------------------- |
| pages `/aide…`            | visiteurs, moteurs                        | articles **publiés dans l'environnement**                  |
| `/aide/catalogue.json`    | application (« Besoin d'aide »)           | ID → titre, chemin, catégorie, statut, `published`         |
| `/aide/corpus-t2.json`    | application (assistant)                   | articles publiés, découpés en sections citables            |
| `dist/aide/.redirects.json` | `server.cjs` (non servi)                | anciennes URLs → destination, en un saut                   |
| `sitemap.xml`             | moteurs (production)                      | thèmes et articles publiés et indexables                   |

Toutes portent la même `version` (commit déployé + empreinte du contenu).

### Publication par environnement

- `status: published` : publié partout.
- `status: blocked` + `blocker:` : l'écart du §14 n'est pas clos. **Visible en préproduction** (bandeau « Publication conditionnée ») pour la recette, **absent de la production** (pas de page, pas de sitemap, pas de catalogue publié, pas d'assistant). Une ancienne URL qui y menait redirige vers `/aide`.
- Lever un blocage : passer `status` à `published` et retirer `blocker`, dans le même déploiement que le correctif produit.

### Ajouter ou modifier un article

1. Créer `src/content/aide/articles/AID-<DOMAINE>-<NNN>.md` (copier un article voisin). L'ID ne change jamais ; le titre et le slug peuvent changer.
2. Slug modifié : ajouter l'ancienne URL à `redirectFrom` (obligatoire, §2.2).
3. `npm run test` puis `npm run build` : le build liste tous les défauts (article lié inexistant, doublon, valeur hors référentiel, vocabulaire interne T1–T5, e-mail, lien privé…).

Le Markdown accepte : paragraphes, `## Intertitre`, étapes `1. **Titre** — texte`, encadrés `> **À savoir** — texte` (et « Limites et points d'attention », « Prérequis », « Résultat attendu »), définitions `**Terme** — texte`, **gras** et liens `[texte](/aide/slug)`. Rien d'autre, et jamais de HTML.

### Mode intégré (application mobile)

`?integre=app` masque l'en-tête et le pied du site, affiche « Retour à Verebona » et se conserve pendant la navigation. Dans un cadre, le retour envoie `{ type: 'verebona:help:close' }` à l'application ; seule l'origine de `VITE_APP_URL` peut encadrer le site.

## Données structurées (JSON-LD)

L'accueil déclare à Google un graphe `Organization` + `WebSite`. CDC _Données structurées Google — Organization & WebSite_.

| Fichier                         | Rôle                                                                                       |
| ------------------------------- | ------------------------------------------------------------------------------------------ |
| `src/config/structured-data.ts` | **source unique** : identité, logo, description, construction du graphe                    |
| `vite.config.ts`                | injecte le `<script type="application/ld+json">` dans `index.html` (production uniquement) |
| `tests/structured-data.test.ts` | recette automatisée des critères AC-01 à AC-06 et AC-08                                    |

Le domaine et l'URL d'accueil viennent de `sitemap.rules.ts` : une seule constante porte le domaine pour le sitemap, le canonical et le balisage (§6, « centraliser pour éviter une divergence »).

**Injection au build, pas à l'exécution.** Le §6 exige un balisage lisible sans exécuter de logique côté client. Le site étant une SPA, le seul point où il existe avant le JavaScript est `index.html`. Conséquence : `index.html` servant toutes les routes, le balisage accompagne aussi `/aide` et `/contact`. Ce ne sont pas des doublons contradictoires — un seul graphe existe, et ses `@id` et `url` désignent l'accueil. Pour le restreindre strictement à `/`, il faudrait injecter côté `server.cjs` selon le chemin demandé.

**Rien hors production** (§6, AC-08) : `structuredDataScript(indexable)` renvoie `null` en préproduction, où la page conserve son `noindex`.

### Faire évoluer le balisage

- **Description** : la garder courte. Le §10 classe en risque haut le fait d'y déverser le catalogue fonctionnel, et le §3 interdit d'y présenter comme disponible une fonction qui ne l'est pas encore.
- **`sameAs`** : aujourd'hui vide, donc non émis. Renseigner `SAME_AS` uniquement avec des profils officiels vérifiés, jamais un compte personnel ou non maîtrisé.
- **Logo** : `public/assets/app-icon.png` (180 × 180). Le remplacer suppose de garder un PNG public, stable et ≥ 112 × 112 — un test le vérifie.
- **`@id`** : stables et référencés par `publisher`. Ne pas les modifier.
- **Adresse, téléphone, `legalName`, identifiants légaux** : hors besoin, à n'ajouter que si l'information est publique et vérifiée (§4).

### Recette sur l'environnement déployé

```bash
curl -s https://www.verebona.fr/ | grep -A1 'application/ld+json'
curl -sI https://www.verebona.fr/assets/app-icon.png   # 200, image/png, sans auth
```

Puis : valider le bloc dans le [Schema Markup Validator](https://validator.schema.org/) et le test des résultats enrichis de Google ; dans Search Console, inspecter `https://www.verebona.fr/`, lancer un test en direct, demander une réindexation, et vérifier après recrawl la cohérence du nom de site.

## Conventions de style

Le design est repris **1:1** du prototype validé : les styles sont **inline** dans les templates (les valeurs exactes de la maquette). Seuls vivent dans `style.css` : polices, resets, keyframes et media-queries responsive. Les styles dynamiques passent par `:style`, les effets de survol par la directive `v-hover`.

## À brancher côté produit (TODO)

- **Authentification** : les liens « Se connecter » / « Créer votre compte » sont des placeholders (`href="#"` / ancre `#pricing`). Les pointer vers votre flux d'auth (route dédiée ou l'app `app.verebona.com`).
- **Formulaire de contact** : `useContact().sendContact()` bascule seulement sur l'écran de succès. Y ajouter l'envoi réel (API / service mail) quand disponible.
- **Contenu légal** : textes de démonstration à faire valider juridiquement.

## Pré-rendu de l'accueil

L'accueil est livré avec son contenu dans le HTML initial (H1, paragraphe, bénéfices, signature), sans dépendre de l'exécution du JavaScript.

| Fichier                    | Rôle                                                                                                    |
| -------------------------- | ------------------------------------------------------------------------------------------------------- |
| `src/entry-prerender.ts`   | rend la route `/` avec `vue/server-renderer` (build SSR dans `node_modules/.prerender`, supprimé après) |
| `scripts/prerender.mjs`    | injecte le rendu dans `dist/index.html` et produit `dist/spa.html` (coquille des autres routes)         |
| `src/config/head.rules.ts` | titre et meta description par route ; description de l'accueil selon le mode `prelaunch` / `full`       |
| `server.cjs`               | sert `dist/index.html` sur `/` et `dist/spa.html` pour les autres routes                                |

Le navigateur monte ensuite l'application normalement (`createApp`, pas d'hydratation) : le DOM est identique.

Variable optionnelle **`CANONICAL_HOST`** (production uniquement, ex. `www.verebona.fr`) : redirige en une seule 301 toute requête HTTP ou sur un autre hôte vers `https://www.verebona.fr` + chemin. À ne pas définir en préproduction.
