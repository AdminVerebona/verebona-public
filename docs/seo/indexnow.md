# IndexNow — notification des pages modifiées (chantier 105Q)

IndexNow permet de **prévenir** Bing (et les autres moteurs du protocole) qu'une page publique a été créée, modifiée ou retirée. C'est une notification, **pas une garantie d'indexation** : Bing décide seul quand explorer et quoi indexer.

État au 02/11/2026 : IndexNow **n'existait pas** sur le site. Il est implémenté, mais **inactif tant que la variable `INDEXNOW_KEY` n'est pas définie** en production.

## Fonctionnement

| Étape | Où | Ce qui se passe |
| --- | --- | --- |
| Build | `scripts/indexnow-prepare.mjs` (dans `npm run build`) | Production seulement. Calcule une empreinte de chaque URL du `sitemap.xml` (titre, description, canonical, robots, texte, liens, images) → `dist/indexnow-manifest.json`. Lit le manifeste **encore en ligne** (`https://www.verebona.fr/indexnow-manifest.json`, version précédente) et écrit la liste des URL ajoutées, modifiées ou retirées dans `dist/.indexnow-pending.json` (non servi). |
| Démarrage | `server.cjs` | Production + `INDEXNOW_KEY` valide seulement : sert la clé à `/<clé>.txt`, puis, après `INDEXNOW_DELAY_SECONDS` (120 s par défaut, le temps que la nouvelle version reçoive le trafic), envoie la liste à `https://api.indexnow.org/indexnow`. |
| Échec | `server.cjs` | 429, 5xx ou erreur réseau : 3 essais (1 min, puis 5 min). 400/403/422 : arrêt immédiat. Chaque échec est écrit dans les logs (`[indexnow] …`). Tant qu'une URL n'est pas notifiée, le manifeste servi la marque `non-notifie` : le déploiement suivant la renverra. |

Règles :

- **jamais en préproduction ni en local** : il faut `dist/.site-env.json` = `production` et `indexable` ; sinon ni clé servie, ni envoi (testé) ;
- **aucun secret dans le dépôt** : la clé vient de la variable d'environnement ;
- seules les URL du sitemap (pages publiques canoniques indexables) et celles qui en sont sorties sont notifiées — jamais l'application, la préproduction, `/contact` (hors sitemap) ni une page `noindex` ;
- un seul conteneur notifie (`CONTAINER` absent ou `web-1` sur Scalingo) ;
- les noms de fichiers hachés et les identifiants techniques ne comptent pas : un déploiement sans changement de contenu n'envoie rien.

Premier déploiement avec la clé : aucun manifeste en ligne (404) → **toutes** les URL du sitemap (136 au 02/11/2026) sont notifiées une fois. Si le site en ligne ne répond pas pendant le build, aucune notification n'est préparée (message dans les logs de build) — rien n'est cassé.

## Mise en service (PO / exploitation)

1. Générer une clé : `node -e "console.log(require('crypto').randomUUID())"` (36 caractères, lettres, chiffres et tirets).
2. Chez l'hébergeur, **application de production uniquement** : `INDEXNOW_KEY=<la clé>`. Ne pas la définir en préproduction (elle y serait de toute façon ignorée).
3. Redéployer. Dans les logs : `[indexnow] actif, N URL à notifier`, puis, ~2 min après, `[indexnow] N URL notifiée(s) (HTTP 200)` ou `(HTTP 202)`.
4. Vérifier la clé : `curl -s https://www.verebona.fr/<la clé>.txt` → la clé.
5. Dans Bing Webmaster Tools, rubrique **IndexNow** : les URL reçues apparaissent (délai possible de quelques heures).

Couper sans retirer la clé : `INDEXNOW_ENABLED=false`. Changer de clé : remplacer la variable et redéployer (l'ancienne cesse d'être servie).

## Relancer à la main

Après un incident (logs `NON notifiée(s)`), le plus simple est de redéployer : les URL marquées `non-notifie` repartent. Pour tout renvoyer : build avec `INDEXNOW_PREVIOUS_MANIFEST=none`.

## Fichiers

- `scripts/lib/indexnow.cjs` — fonctions (statut, empreinte, différence, envoi avec reprise) ;
- `scripts/indexnow-prepare.mjs` — étape de build ;
- `server.cjs` — clé, manifeste servi, envoi au démarrage ;
- `tests/l105q-seo-bing.test.ts` — L105Q-05 (fonctions) et L105Q-06 (`server.cjs` démarré : clé servie en production, jamais en préproduction).
