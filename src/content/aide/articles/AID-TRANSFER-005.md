---
id: AID-TRANSFER-005
title: Exporter les données brutes d’un bien
slug: exporter-donnees-brutes-bien
category: transfert-recuperation
summary: Récupérer les fichiers et données d’un bien dans un export téléchargeable.
tags: [export, récupération, données]
offers: [standard, premium, premium_duo]
roles: [all]
rolesLabel: Tous
platforms: [web, mobile]
authState: [public_help, connected_action]
screens: [Fiche bien > Exports]
objectTypes: [bien, document, donnée]
permissions: Aucun prérequis pour lire l’article
relatedArticles: [AID-TRANSFER-001, AID-TRANSFER-006]
seoTitle: Exporter les données brutes d’un bien | Aide Verebona
metaDescription: Récupérer les fichiers et données d’un bien dans un export téléchargeable.
canonical: /aide/exporter-donnees-brutes-bien
indexable: true
lang: fr-FR
synonyms: [export, récupération, données, exporter, brutes, bien, transfert, transmission, envoyer, recevoir]
status: published
validatedAt: 2026-09-26
appVersion: V1
updatedAt: 2026-09-26
---

L’export de données brutes sert à la récupération et à la portabilité. Il est distinct des dossiers prêts à l’usage : son objectif est de vous remettre les fichiers et les informations d’un bien, pas de produire un dossier présenté pour un tiers. Il est disponible avec toutes les offres.

> **À savoir** — Cet export reste accessible lorsque votre compte est restreint (fin d’essai, paiement à régulariser, rétractation) : vous pouvez toujours récupérer vos données.

## Procédure

1. **Ouvrez le bien** — Allez dans l’onglet « Exports », section « Transfert et récupération ».
2. **Choisissez « Export données brutes »** — Le panneau de préparation s’ouvre.
3. **Sélectionnez le contenu** — Tous les documents et toutes les images du bien sont cochés par défaut ; décochez ceux que vous ne souhaitez pas récupérer.
4. **Cliquez sur « Télécharger »** — Verebona génère un fichier ZIP et lance son téléchargement.
5. **Conservez le fichier** — Rangez-le dans un emplacement sécurisé.

## Détails et cas particuliers

**Récapitulatif** — Le fichier « recap_donnees.txt », à la racine du ZIP, reprend les informations du bien (identification, caractéristiques, valorisation, prix et dates), la liste des documents, les liens web, les équipements, les photos et les échéances de l’agenda.

**Documents et images** — Les fichiers cochés sont rangés dans un dossier « documents », avec un sous-dossier par type de document.

**Photos du bien** — Lorsque la sélection comporte au moins une image, les photos de la galerie du bien sont ajoutées dans un dossier « photos » ; la photo principale est nommée « photo_1_principale ».

**Liens web** — Ils sont cités dans le récapitulatif avec leur adresse ; les pages ne sont pas téléchargées.

**Historique** — L’export apparaît dans « Historique des exports » de l’onglet : vous pouvez le télécharger à nouveau, le relancer en cas d’échec ou le supprimer.

> **Limites et points d’attention** — Le ZIP ne contient ni PDF de présentation ni fichier de données structurées : pour un dossier mis en forme, utilisez un dossier prêt à l’usage ; pour toutes vos données de compte, utilisez l’export de « Mes données ».
