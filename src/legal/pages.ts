/**
 * Pages de la rubrique « Légal » à pré-rendre au build (chantier 104P) : les
 * cinq contenus, un permalien par version publiée des CGUV, et la page 404
 * « version inconnue ». Écrites dans `dist/legal/.pages/` (dossier jamais
 * servi tel quel) et servies par `server.cjs` sous leur URL stable.
 */
import { cguvVersions, documents } from 'virtual:legal'
import { canonicalUrl } from '../config/sitemap.rules'
import { cguvVersionTitle, ROUTE_TITLES } from '../config/head.rules'
import { ROUTE_PATHS } from '../router/route-paths'

export interface LegalPage {
  path: string
  /** Fichier écrit dans dist/, relatif. */
  file: string
  head: { title: string; description: string; canonical: string | null; noindex: boolean; jsonLd: null }
}

/** Chemin rendu pour la page 404 « version inconnue » (aucun code réel ne peut l'égaler). */
export const UNKNOWN_VERSION_RENDER_PATH = '/legal/cguv/versions/version-inconnue'

const DESCRIPTIONS: Record<string, string> = {
  'mentions-legales': 'Mentions légales de Verebona.',
  cguv: 'Conditions générales d’utilisation et de vente (CGUV) de Verebona : version en vigueur.',
  confidentialite: 'Politique de confidentialité de Verebona : traitement des données personnelles.',
  'sous-traitants': 'Sous-traitants et prestataires de Verebona.',
  parrainage: 'Conditions du parrainage Verebona.',
}

const ROUTE_OF: Record<string, keyof typeof ROUTE_PATHS> = {
  'mentions-legales': 'legal-mentions',
  cguv: 'legal-cguv',
  confidentialite: 'legal-confid',
  'sous-traitants': 'legal-sous-traitants',
  parrainage: 'legal-parrainage',
}

export function legalPages(): LegalPage[] {
  return [
    ...documents.map((d) => ({
      path: d.path,
      file: `legal/.pages/${d.key}.html`,
      head: { title: ROUTE_TITLES[ROUTE_OF[d.key]], description: DESCRIPTIONS[d.key], canonical: canonicalUrl(d.path), noindex: false, jsonLd: null },
    })),
    ...cguvVersions.map((v) => ({
      path: v.permalinkPath,
      file: `legal/.pages/cguv/versions/${v.code}.html`,
      // Permalien de preuve : consultable et partageable, hors index (la page
      // de référence est /legal/cguv).
      head: { title: cguvVersionTitle(v.code), description: `Conditions générales d’utilisation et de vente (CGUV) de Verebona, version ${v.code}.`, canonical: canonicalUrl(v.permalinkPath), noindex: true, jsonLd: null },
    })),
    {
      path: UNKNOWN_VERSION_RENDER_PATH,
      file: 'legal/.pages/cguv/version-inconnue.html',
      head: { title: 'Version des CGUV introuvable | Verebona', description: DESCRIPTIONS.cguv, canonical: null, noindex: true, jsonLd: null },
    },
  ]
}
