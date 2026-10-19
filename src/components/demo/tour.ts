/**
 * Données de la visite de l'application en six vues (lot 69P, page publique
 * mobile). Mêmes biens et mêmes dates que les autres illustrations du site
 * (héros, « Comment ça marche », mockup de l'application).
 */
export const TOUR_VIEWS = [
  { key: 'bien', title: 'La fiche de chaque bien', text: 'Photo, catégorie, documents et échéances : tout ce qui concerne un bien au même endroit.' },
  { key: 'docs', title: 'Des documents classés', text: 'Factures, contrats, garanties : rangés par catégorie et rattachés au bon bien.' },
  { key: 'infos', title: 'Des informations extraites', text: 'Déposez une facture : Verebona en lit le bien, la catégorie, le montant et la date.' },
  { key: 'agenda', title: 'Un agenda des échéances', text: 'Entretiens, contrôles, renouvellements : les dates sont repérées et rappelées à temps.' },
  { key: 'cout', title: 'Le coût de possession', text: 'Achat, entretien, assurance : voyez ce que chaque bien vous coûte depuis son achat.' },
  { key: 'question', title: 'Verebona vous répond', text: 'Posez une question sur vos biens : la réponse s’appuie sur vos propres documents.' },
] as const

export type TourViewKey = (typeof TOUR_VIEWS)[number]['key']

/** Échéances : l'état est toujours écrit en toutes lettres (pas la couleur seule). */
export const TOUR_EVENTS = [
  { d: '17', m: 'OCT', title: 'Révision annuelle', asset: 'Vélo Cargo', state: 'En retard', late: true },
  { d: '26', m: 'OCT', title: 'Contrôle technique', asset: 'Voiture familiale', state: 'À venir', late: false },
  { d: '15', m: 'JAN', title: 'Renouvellement du bail', asset: 'Appartement Lyon', state: 'À venir', late: false },
]

/** Coût de possession du Vélo Cargo : 1 890 + 170 + 120 = 2 180 €. */
export const TOUR_COSTS = [
  { label: 'Achat', amount: '1 890 €', pct: 87 },
  { label: 'Entretien', amount: '170 €', pct: 8 },
  { label: 'Assurance', amount: '120 €', pct: 5 },
]
