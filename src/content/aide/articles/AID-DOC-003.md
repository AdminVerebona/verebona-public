---
id: AID-DOC-003
title: Formats acceptés et taille maximale
slug: formats-taille-documents
category: documents
summary: Vérifier qu’un fichier peut être importé avant de l’envoyer.
tags: [documents, formats, limites]
offers: [standard, premium, premium_duo]
roles: [all]
rolesLabel: Tous
platforms: [web, mobile]
authState: [public_help, connected_action]
screens: [Ajout de document]
objectTypes: [document, fichier]
permissions: Aucun prérequis pour lire l’article
relatedArticles: [AID-DOC-001, AID-HELP-004]
seoTitle: Formats acceptés et taille maximale | Aide Verebona
metaDescription: Vérifier qu’un fichier peut être importé avant de l’envoyer.
canonical: /aide/formats-taille-documents
indexable: true
lang: fr-FR
synonyms: [documents, formats, limites, acceptés, taille, maximale, document, fichier, justificatif, pièce]
status: published
---

Verebona contrôle le type réel du fichier, son extension, sa taille et son intégrité. Le contrôle ne repose pas uniquement sur le nom du fichier : des vérifications techniques empêchent l’envoi de formats dangereux ou incohérents.

> **À savoir** — L’ancienne aide mentionnait 10 Mo et seulement quelques formats : cette information est obsolète et ne doit pas être reprise.

## Détails et cas particuliers

**Documents** — PDF, DOC, DOCX, XLS, XLSX, TXT et CSV sont actuellement autorisés par le validateur serveur.

**Images** — JPG/JPEG, PNG, GIF et WEBP sont autorisés.

**Vidéos** — MP4/M4V, MOV, AVI, WEBM et MKV sont techniquement autorisés dans le validateur.

**Taille des documents** — 25 Mo maximum par document non vidéo dans la route d’import actuelle.

**Taille des vidéos** — 500 Mo maximum dans la route d’import actuelle.

**Fichiers vides** — Les fichiers de 0 octet sont refusés.

**Extensions dangereuses** — Les exécutables, scripts et plusieurs formats actifs comme HTML, SVG ou XML sont bloqués.

> **Limites et points d’attention** — La liste doit être revalidée lors de la passe finale, car les formats autorisés sont une règle technique susceptible d’évoluer.
