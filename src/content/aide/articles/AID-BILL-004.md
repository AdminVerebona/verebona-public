---
id: AID-BILL-004
title: Changer d’offre
slug: changer-offre
category: abonnement-facturation-parrainage
summary: Programmer un passage vers Standard, Premium ou Premium Duo depuis un abonnement existant.
tags: [abonnement, changement offre]
offers: [standard, premium, premium_duo]
roles: [owner]
rolesLabel: Titulaire du compte
platforms: [web, mobile]
authState: [public_help, connected_action]
screens: [Mon compte > Offres, Mon abonnement]
objectTypes: [abonnement]
permissions: Aucun prérequis pour lire l’article
relatedArticles: [AID-BILL-005, AID-DUO-005]
seoTitle: Changer d’offre | Aide Verebona
metaDescription: Programmer un passage vers Standard, Premium ou Premium Duo depuis un abonnement existant.
canonical: /aide/changer-offre
indexable: true
lang: fr-FR
synonyms: [abonnement, changement offre, changer, offre, plan, facture, paiement, Stripe, parrainage]
status: published
validatedAt: 2026-09-26
appVersion: V1
updatedAt: 2026-09-26
---

Le changement d’offre est programmé par le serveur à partir de l’offre cible, de la périodicité et de l’état réel de l’abonnement. L’écran affiche la date de prise d’effet renvoyée par le serveur et permet d’annuler un changement encore programmé.

> **À savoir** — Passer à une offre aux quotas inférieurs ne supprime ni ne désactive aucun bien. Si votre compte dépasse alors la limite de biens de la nouvelle offre, tous vos biens restent consultables, exportables et transmissibles, mais leur modification est suspendue jusqu’à ce que vous repassiez sous la limite.

## Procédure

1. **Ouvrez les offres** — Repérez l’offre actuelle et l’offre cible.
2. **Choisissez la périodicité souhaitée** — Mensuelle ou annuelle.
3. **Programmez le changement** — Verebona affiche la date d’effet ou « prochaine échéance ».
4. **Vérifiez le changement programmé** — Le récapitulatif apparaît dans Mon abonnement.
5. **Annulez si nécessaire** — Utilisez « Annuler » avant la prise d’effet lorsque cette action est disponible.

## Détails et cas particuliers

**Au-dessus de la limite de biens** — Toute modification d’un bien (informations, vignette, pièces, équipements, valorisation) est refusée avec un message qui rappelle la limite de l’offre. Aucun bien n’est désigné d’office : c’est vous qui choisissez.

**Revenir sous la limite** — Supprimez les biens dont vous n’avez plus besoin, après les avoir exportés ou transmis si nécessaire, ou choisissez une offre suffisante. La modification redevient possible dès que le nombre de biens ne dépasse plus la limite.

**Passage en Standard** — Standard ne permet qu’un seul utilisateur : les membres d’un compte partagé sont retirés et les invitations en attente annulées. Leurs données restent dans le compte.

> **Limites et points d’attention** — Tant que la limite est dépassée, l’ajout de nouveaux biens reste également impossible.
