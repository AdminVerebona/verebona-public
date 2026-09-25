---
id: AID-BILL-008
title: Que se passe-t-il après un échec de paiement ?
slug: echec-paiement
category: abonnement-facturation-parrainage
summary: Comprendre les restrictions, le délai de régularisation et la récupération des données après un impayé.
tags: [facturation, impayé, récupération]
offers: [standard, premium, premium_duo]
roles: [all]
rolesLabel: Tous
platforms: [web, mobile]
authState: [public_help, connected_action]
screens: [Mon abonnement, Compte restreint, Récupération]
objectTypes: [abonnement, compte, bien]
permissions: Aucun prérequis pour lire l’article
relatedArticles: [AID-TRANSFER-006, AID-BILL-009, AID-DUO-005]
seoTitle: Que se passe-t-il après un échec de paiement ? | Aide Verebona
metaDescription: Comprendre les restrictions, le délai de régularisation et la récupération des données après un impayé.
canonical: /aide/echec-paiement
indexable: true
lang: fr-FR
synonyms: [facturation, impayé, récupération, passe, après, échec, paiement, abonnement, offre, plan]
status: blocked
blocker: CRITIQUE : ce cycle général à 90 jours n’est pas complètement implémenté aujourd’hui ; publication interdite tant que le comportement réel n’est pas aligné.
---

La règle cible validée pour Verebona est la suivante : dès l’échec de paiement, les fonctions normales et payantes sont suspendues, mais le compte reste accessible. Pendant 90 jours, l’utilisateur peut régulariser, transmettre ses biens et récupérer/exporter ses données. Une régularisation pendant ce délai réactive l’usage normal.

## Détails et cas particuliers

**J0** — Suspension immédiate des fonctions normales ; accès au compte conservé.

**J0 à J+90** — Régularisation possible. Transmission et récupération/export doivent rester accessibles.

**Régularisation** — Les droits normaux reprennent après confirmation du paiement.

**J+90** — Sans régularisation, accès retiré et suppression des données métier/utilisateur par défaut, hors données à conserver légalement et sauvegardes suivant leur rotation normale.

> **Limites et points d’attention** — Ne pas confondre ce délai de 90 jours avec les 30 jours d’export après une rétractation.
