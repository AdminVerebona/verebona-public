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
status: blocked
blocker: Le comportement historique de certains downgrades a inactivé des biens au-delà du quota alors que le service d’entitlements documente une conservation en lecture/export. Harmonisation obligatoire avant MEP.
---

Le changement d’offre est programmé par le serveur à partir de l’offre cible, de la périodicité et de l’état réel de l’abonnement. L’écran doit afficher la date de prise d’effet renvoyée par le serveur et permettre d’annuler un changement encore programmé.

> **À savoir** — Si la nouvelle offre possède des quotas inférieurs, vos données ne doivent pas être supprimées simplement parce que le quota baisse. Le comportement de dépassement doit rester cohérent avec les droits effectifs.

## Procédure

1. **Ouvrez les offres** — Repérez l’offre actuelle et l’offre cible.
2. **Choisissez la périodicité souhaitée** — Mensuelle ou annuelle.
3. **Programmez le changement** — Verebona affiche la date d’effet ou « prochaine échéance ».
4. **Vérifiez le changement programmé** — Le récapitulatif apparaît dans Mon abonnement.
5. **Annulez si nécessaire** — Utilisez « Annuler » avant la prise d’effet lorsque cette action est disponible.
