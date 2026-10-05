/**
 * Référentiels fermés du Centre d'aide — CDC Centre d'aide V1 §3, §16.1.
 *
 * « Catégorie, offres, rôles, plateformes, permissions, écrans et types
 * d'objet doivent appartenir aux référentiels autorisés. » Un article qui
 * emploie une valeur absente d'ici fait échouer le build : c'est ce qui
 * empêche une faute de frappe (« premium-duo ») de créer silencieusement une
 * offre que ni la recherche ni l'assistant ne savent filtrer.
 *
 * Ajouter une valeur est un geste délibéré, revu comme du code.
 */

export const OFFERS = ['standard', 'premium', 'premium_duo'] as const
export type Offer = (typeof OFFERS)[number]

export const OFFER_LABELS: Record<Offer, string> = {
  standard: 'Standard',
  premium: 'Premium',
  premium_duo: 'Premium Duo',
}

export const ROLES = [
  'all', 'owner', 'duo_member', 'authorized_user', 'recipient',
  'concerned_user', 'billing_owner', 'referrer',
] as const
export type Role = (typeof ROLES)[number]

export const PLATFORMS = ['web', 'mobile'] as const
export type Platform = (typeof PLATFORMS)[number]

export const AUTH_STATES = ['public_help', 'connected_action', 'identity_check', 'invitation_link'] as const
export type AuthState = (typeof AUTH_STATES)[number]

/**
 * `published` : publiable dès la recette passée.
 * `blocked`   : publication conditionnée à la clôture d'un écart (§14) —
 *               visible en préproduction pour recette, absent de la production.
 */
export const STATUSES = ['published', 'blocked'] as const

/**
 * Actions de l'assistant qu'un article peut autoriser (CDC Assistant §10.3 :
 * « routes ou actions autorisées » ; catalogue fermé §22.4). Reprises du
 * catalogue de l'application : une action hors liste fait échouer le build.
 */
export const ASSISTANT_ACTIONS = [
  'OPEN_ASSET', 'OPEN_DOCUMENT', 'OPEN_DOCUMENTS_PAGE', 'OPEN_SEARCH_RESULTS', 'OPEN_AGENDA', 'OPEN_AGENDA_ITEM',
  'OPEN_TO_PROCESS', 'OPEN_SUPPLIERS', 'OPEN_SUPPLIER', 'OPEN_ACCOUNT', 'OPEN_PRICING', 'OPEN_HELP', 'OPEN_CONTACT',
  'START_ADD_ASSET', 'START_ADD_DOCUMENT', 'START_ADD_AGENDA_ITEM', 'OPEN_EXPORT_AREA',
] as const

/** Route de l'application mentionnée par un article (chemin interne). */
export const APP_ROUTE = /^\/[a-z0-9-]+(\/[a-z0-9-[\]]+)*$/
export type ArticleStatus = (typeof STATUSES)[number]

export const LANGS = ['fr-FR'] as const

/**
 * Mentions « Permissions / prérequis » admises (§16.1). Le champ était un
 * texte libre, non contrôlé : une nouvelle mention s'ajoute ici, relue.
 */
export const PERMISSIONS = ['Aucun prérequis pour lire l’article'] as const

/**
 * Encadrés autorisés dans le corps d'un article, et leur rôle visuel.
 * L'encadré « Limites et points d’attention » est retiré à la demande du PO :
 * il n'est plus autorisé, et le build échoue (« Encadré inconnu ») si un
 * article le réintroduit.
 */
export const CALLOUTS: Record<string, 'info' | 'prerequisite' | 'result'> = {
  'À savoir': 'info',
  'Prérequis': 'prerequisite',
  'Résultat attendu': 'result',
}

/** Écrans et contextes de l'application cités par les articles. */
export const SCREENS = [
  'Accueil', 'Agenda', 'Ajout de document', 'Ajout de documents', 'Ajout rapide', 'Assistant',
  'Assistant Verebona', 'Besoin d’aide', 'Bien', 'Centre d’aide', 'Centre d’aide > Contact',
  'Cloche', 'Compte restreint', 'Connexion', 'Créer un bien', 'Document', 'Duo > Récupération',
  'Duo récupération', 'Détail document', 'Détail échéance', 'E-mail', 'Espace partagé',
  'Fiche bien', 'Fiche bien > Agenda', 'Fiche bien > Documents', 'Fiche bien > Dossiers/Exports',
  'Fiche bien > Dossiers/Exports > Préparer', 'Fiche bien > Dossiers/Exports > Transmission',
  'Fiche bien > Exports', 'Fiche bien > Informations', 'Fiche bien > Pièces', 'Gestion du partage',
  'Historique des enrichissements', 'Informations', 'Inscription', 'Invitation Duo', 'Mes biens',
  'Mes documents', 'Modifier un bien', 'Mon abonnement', 'Mon compte',
  'Mon compte > Historique des enrichissements', 'Mon compte > Informations',
  'Mon compte > Informations / Mon abonnement', 'Mon compte > Informations > 2e utilisateur Duo',
  'Mon compte > Informations > Parrainage', 'Mon compte > Informations > Synchronisation agenda',
  'Mon compte > Informations > Sécurité', 'Mon compte > Informations > Zone dangereuse',
  'Mon compte > Notifications', 'Mon compte > Offres', 'Mon compte > Synchronisation agenda',
  'Mot de passe oublié', 'Navigation compte', 'Navigation générale', 'Notifications', 'Offres',
  'Page de transmission', 'Page publique de transmission', 'Pages légales', 'Parrainage',
  'Portail Stripe', 'Recherche application', 'Recherche globale', 'Recherche mobile',
  'Récupération', 'Réinitialisation', 'Rétractation', 'Stripe Checkout', 'Tiroir document',
  'Vérification e-mail', 'À traiter', 'Équipements',
] as const

/** Types d'objets métier cités par les articles. */
export const OBJECT_TYPES = [
  'abonnement', 'action', 'appareil', 'appartement', 'bien', 'bien immobilier', 'champ',
  'champ métier', 'compte', 'compte Duo', 'contrat', 'demande', 'document', 'donnée',
  'donnée métier', 'données', 'données personnelles', 'duo', 'essai', 'export', 'facture',
  'fichier', 'fournisseur', 'image', 'invitation', 'lien calendrier', 'maison', 'membership',
  'notification', 'paiement', 'parrainage', 'photo', 'pièce', 'récompense', 'session',
  'transmission', 'utilisateur', 'échéance', 'équipement',
] as const

/** Préfixe réservé des pages de thème : aucun article ne peut porter ce slug. */
export const CATEGORY_PATH_PREFIX = '/aide/theme/'
export const RESERVED_SLUGS = ['theme', 'recherche', 'catalogue.json', 'corpus-t2.json']
