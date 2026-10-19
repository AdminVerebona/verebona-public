/**
 * Section Fonctionnalités (#features) — lot 71P : fusion de la visite
 * « Verebona en six vues » (lots 69P / 70P) et des six anciennes cartes
 * Fonctionnalités, en NEUF vues illustrées (décision PO du 19/10).
 *
 * Textes : ceux des anciennes cartes Fonctionnalités quand ils correspondent
 * (agenda, espace à jour, dossier, Duo), sinon ceux de la visite. Mêmes biens
 * et mêmes dates que les autres illustrations du site (héros, « Comment ça
 * marche », démonstration de l'application).
 */
export const FEATURES = [
  { key: 'bien', title: 'La fiche de chaque bien', text: 'Photo, catégorie, documents et échéances : tout ce qui concerne un bien au même endroit.' },
  { key: 'docs', title: 'Des documents classés', text: 'Factures, contrats, garanties : rangés par catégorie et rattachés au bon bien.' },
  { key: 'infos', title: 'Des informations extraites', text: 'Déposez une facture : Verebona en lit le bien, la catégorie, le montant et la date.' },
  { key: 'agenda', title: 'Un agenda des échéances', text: 'Toutes les dates liées à vos biens réunies dans un agenda unique, alimenté automatiquement.' },
  { key: 'cout', title: 'Le coût de possession', text: 'Achat, entretien, assurance : voyez ce que chaque bien vous coûte depuis son achat.' },
  { key: 'question', title: 'Verebona vous répond', text: 'Posez une question sur vos biens : la réponse s’appuie sur vos propres documents.' },
  { key: 'ajour', title: 'Un espace toujours à jour', text: 'Repérez d’un coup d’œil les fiches incomplètes et complétez-les en quelques secondes.' },
  { key: 'dossier', title: 'Un dossier complet en un clic', text: 'Exportez un dossier structuré — vente, assurance, succession — prêt à partager.' },
  { key: 'duo', title: 'L’espace Duo', text: 'Collaborez avec une autre personne dans un espace commun, sans perdre en organisation.' },
] as const

export type FeatureKey = (typeof FEATURES)[number]['key']

/** Échéances : l'état est toujours écrit en toutes lettres (pas la couleur seule). */
export const FEATURE_EVENTS = [
  { d: '17', m: 'OCT', title: 'Révision annuelle', asset: 'Vélo Cargo', state: 'En retard', late: true },
  { d: '26', m: 'OCT', title: 'Contrôle technique', asset: 'Voiture familiale', state: 'À venir', late: false },
  { d: '15', m: 'JAN', title: 'Renouvellement du bail', asset: 'Appartement Lyon', state: 'À venir', late: false },
]

/** Coût de possession du Vélo Cargo : 1 890 + 170 + 120 = 2 180 € (montants validés par le PO). */
export const FEATURE_COSTS = [
  { label: 'Achat', amount: '1 890 €', pct: 87 },
  { label: 'Entretien', amount: '170 €', pct: 8 },
  { label: 'Assurance', amount: '120 €', pct: 5 },
]
