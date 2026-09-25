/**
 * Réglages éditoriaux du Centre d'aide qui ne sont pas des articles.
 */

/**
 * « Aide fréquente » de l'accueil du Centre d'aide (§11) — mêmes sujets que
 * les accès rapides de « Besoin d'aide » dans l'application (§13), pour qu'un
 * utilisateur retrouve les mêmes entrées des deux côtés. Des IDs, jamais des
 * titres : le titre affiché est toujours celui de l'article.
 */
export const FREQUENT_ARTICLE_IDS = [
  'AID-ASSET-001', 'AID-DOC-001', 'AID-TODO-001', 'AID-AGENDA-006', 'AID-NOTIF-003', 'AID-BILL-001',
] as const

/** Chemins des fichiers produits au build, lus par l'application et le serveur. */
export const CATALOG_PATH = '/aide/catalogue.json'
export const T2_CORPUS_PATH = '/aide/corpus-t2.json'
/** Lu par server.cjs seulement ; non servi (dotfile). */
export const REDIRECTS_FILE = 'aide/.redirects.json'

/** Paramètre du mode intégré à l'application mobile (MOB-01 à MOB-03). */
export const EMBED_PARAM = 'integre'
export const EMBED_VALUE = 'app'
