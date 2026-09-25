---
id: AID-AI-006
title: Ce que Verebona ne doit pas faire automatiquement
slug: limites-automatisations
category: ia-automatisations
summary: Identifier les actions qui nécessitent une règle explicite ou une décision utilisateur.
tags: [ia, garde-fous]
offers: [standard, premium, premium_duo]
roles: [all]
rolesLabel: Tous
platforms: [web, mobile]
authState: [public_help, connected_action]
screens: [À traiter, Fiche bien, Document, Assistant]
objectTypes: []
permissions: Aucun prérequis pour lire l’article
relatedArticles: [AID-AI-003, AID-TODO-001]
seoTitle: Ce que Verebona ne doit pas faire automatiquement | Aide Verebona
metaDescription: Identifier les actions qui nécessitent une règle explicite ou une décision utilisateur.
canonical: /aide/limites-automatisations
indexable: true
lang: fr-FR
synonyms: [ia, garde-fous, verebona, doit, pas, automatiquement, intelligence artificielle, automatique, analyse, enrichissement]
status: published
---

L’automatisation n’a pas pour objectif de remplir tous les champs ou de décider à la place de l’utilisateur. Plusieurs garde-fous sont indispensables pour éviter des modifications silencieuses ou des demandes inutiles.

## Détails et cas particuliers

**Pas d’action sans règle** — L’absence d’un champ facultatif ne doit pas générer une action simplement parce qu’il est vide.

**Pas d’écrasement humain** — Une valeur que vous avez explicitement validée n’est pas remplacée automatiquement.

**Pas de fusion silencieuse** — Un doublon documentaire ambigu nécessite une décision.

**Pas de conseil interdit** — L’assistant ne donne pas de conseil juridique, fiscal, médical ou assurantiel personnalisé.

**Pas de source externe pour vos données** — Une question sur votre compte doit s’appuyer sur vos données accessibles et les outils autorisés, pas sur des suppositions externes.
