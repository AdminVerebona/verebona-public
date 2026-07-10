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

| Chemin | Vue | Note |
| --- | --- | --- |
| `/` | HomeView | landing complète |
| `/aide` | HelpView | Centre d'aide |
| `/contact` | ContactView | formulaire (front-only) |
| `/mentions-legales` | LegalView | onglet Mentions légales |
| `/cgu` | LegalView | onglet CGSU |
| `/confidentialite` | LegalView | onglet Confidentialité |
| `/:pathMatch(.*)*` | NotFoundView | 404 |

- Les liens **header/footer** utilisent `useNav()` : les pages passent par `router.push`, et les 4 liens de section de la home (Pourquoi / Fonctionnalités / Tarifs / FAQ) routent vers `/` puis défilent vers l'ancre.
- Le **fil d'Ariane** des sous-pages et le lien « Accueil » naviguent via le router.
- La page **légale** est unique : les 3 onglets sont 3 routes distinctes (bon pour le SEO / partage de liens), l'onglet actif est déduit du chemin dans `useLegal()`.

## Conventions de style

Le design est repris **1:1** du prototype validé : les styles sont **inline** dans les templates (les valeurs exactes de la maquette). Seuls vivent dans `style.css` : polices, resets, keyframes et media-queries responsive. Les styles dynamiques passent par `:style`, les effets de survol par la directive `v-hover`.

## À brancher côté produit (TODO)

- **Authentification** : les liens « Se connecter » / « Créer votre compte » sont des placeholders (`href="#"` / ancre `#pricing`). Les pointer vers votre flux d'auth (route dédiée ou l'app `app.verebona.com`).
- **Formulaire de contact** : `useContact().sendContact()` bascule seulement sur l'écran de succès. Y ajouter l'envoi réel (API / service mail) quand disponible.
- **Contenu légal** : textes de démonstration à faire valider juridiquement.
