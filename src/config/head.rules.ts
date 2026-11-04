/**
 * Titre et meta description par page — règles pures.
 *
 * Même contrat que `sitemap.rules.ts` : aucune lecture de `import.meta.env`,
 * aucun état, aucune dépendance à Vue. Partagé par :
 *   - `vite.config.ts`       (build : head de l'accueil dans `index.html`) ;
 *   - `src/config/head.ts`   (navigateur : head de chaque route) ;
 *   - les tests unitaires (`tests/home-seo.test.ts`).
 *
 * ══════════════════════════════════════════════════════════════════════════
 * LE TITRE DE L'ACCUEIL S'APPLIQUAIT À TOUTES LES PAGES
 *
 * `index.html` est le document unique de la SPA : son `<title>` et sa meta
 * description étaient ceux de toutes les routes. Le titre de l'accueil est
 * désormais propre à l'accueil ; chaque autre page déclare le sien, écrit en
 * entier. Aucun gabarit « %s | Verebona » n'est appliqué automatiquement :
 * c'est ce qui évite le « Verebona | … | Verebona » redouté.
 * ══════════════════════════════════════════════════════════════════════════
 */
import type { SiteMode } from './site-mode.rules'

/** Titre exact de l'accueil (ticket SEO accueil). */
export const HOME_TITLE = 'Verebona | Documents et suivi de vos biens'

/**
 * Meta description de l'accueil selon le statut d'ouverture.
 *
 * Le statut n'est PAS modifié ici : il reste porté par le mode du site
 * (`VITE_DEFAULT_SITE_MODE`). Passer le site en `full` le jour de
 * l'ouverture bascule automatiquement sur la seconde description.
 */
export const HOME_DESCRIPTIONS: Record<SiteMode, string> = {
  prelaunch:
    'Découvrez Verebona : documents, garanties et échéances de vos biens réunis pour simplifier leur suivi, de l’achat à la revente. Disponible bientôt.',
  full: 'Organisez les documents, garanties et échéances de vos biens avec Verebona. Simplifiez leur suivi et vos démarches, de l’achat à la revente.',
}

/**
 * Description des autres pages : celle qu'elles portaient déjà (héritée de
 * `index.html`), inchangée — la mention « Disponible bientôt » est propre à
 * l'accueil.
 */
export const DEFAULT_DESCRIPTION =
  'Verebona centralise vos biens, documents et échéances pour les retrouver facilement, anticiper les dates importantes et valoriser vos biens le moment venu.'

/** Titre neutre du document servi aux routes autres que l'accueil, avant JS. */
export const SHELL_TITLE = 'Verebona'

/** Titres complets par nom de route. Toute route absente reçoit `SHELL_TITLE`. */
export const ROUTE_TITLES: Record<string, string> = {
  contact: 'Contact | Verebona',
  'legal-mentions': 'Mentions légales | Verebona',
  'legal-cguv': 'CGUV — Conditions générales d’utilisation et de vente | Verebona',
  'legal-confid': 'Politique de confidentialité | Verebona',
  'legal-sous-traitants': 'Sous-traitants et prestataires | Verebona',
  'legal-parrainage': 'Parrainage | Verebona',
  'legal-cguv-version': 'Version des CGUV | Verebona',
  'not-found': 'Page introuvable | Verebona',
}

/**
 * Descriptions propres à une route (chantier 105Q). Toute route absente garde
 * `DEFAULT_DESCRIPTION`. Lues par le navigateur et par le pré-rendu.
 */
export const ROUTE_DESCRIPTIONS: Record<string, string> = {
  contact: 'Une question, une suggestion, un partenariat ? Écrivez à l’équipe Verebona depuis le formulaire de contact.',
}

export interface PageHead {
  title: string
  description: string
}

/** Titre du permalien d'une version des CGUV (navigation interne et pré-rendu). */
export function cguvVersionTitle(code: string): string {
  return `CGUV — version ${code} | Verebona`
}

/** Head d'une route donnée. `home` et toute route inconnue sont traitées explicitement. */
export function headForRoute(routeName: string | undefined, mode: SiteMode, params: Record<string, unknown> = {}): PageHead {
  if (routeName === 'home') {
    return { title: HOME_TITLE, description: HOME_DESCRIPTIONS[mode] }
  }
  if (routeName === 'legal-cguv-version' && typeof params.code === 'string') {
    return { title: cguvVersionTitle(params.code), description: DEFAULT_DESCRIPTION }
  }
  return {
    title: (routeName && ROUTE_TITLES[routeName]) || SHELL_TITLE,
    description: (routeName && ROUTE_DESCRIPTIONS[routeName]) || DEFAULT_DESCRIPTION,
  }
}

/** Échappement d'une valeur d'attribut HTML (utilisé au build). */
export function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
