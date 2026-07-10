import { ref, computed } from 'vue'

/* ============================================================
   useLanding — reactive state + derived values for the home page
   interactive bits: the app mockup carousel, the FAQ accordion and
   the use-cases accordion. Ported 1:1 from the prototype renderVals().
   Module-level refs make the state shared across the home sections.
   ============================================================ */

const slide = ref(0) // app mockup: 0 dashboard / 1 biens / 2 events / 3 docs
const faq = ref(-1) // open FAQ index (-1 = none)
const uc = ref(0) // open use-case index (-1 = none)

const labels = ['Tableau de bord', 'Mes biens', 'Mes événements', 'Mes documents']

const tabStyle = (a: boolean) =>
  `display:flex;align-items:center;gap:11px;padding:9px 12px;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer;transition:all .15s;text-align:left;font-family:'Instrument Sans',sans-serif;border:1px solid ${a ? 'rgba(59,130,246,.35)' : 'transparent'};background:${a ? 'rgba(37,99,235,.14)' : 'transparent'};color:${a ? '#7EB0FF' : '#8892A6'}`

const dotStyle = (a: boolean) =>
  `height:6px;border-radius:99px;transition:all .25s;cursor:pointer;border:0;padding:0;width:${a ? '26px' : '6px'};background:${a ? '#2563EB' : 'rgba(148,163,184,.4)'}`

const faqData = [
  { q: 'Verebona gère-t-il uniquement les logements ?', a: "Non.\nVerebona centralise tous vos biens : logements, véhicules, matériel pro, outillage, loisirs…\n\nChaque bien sert de point d'ancrage pour organiser les documents, informations et événements associés." },
  { q: 'Quelle est la différence entre les offres ?', a: "Standard inclut 2 biens actifs et l'analyse IA des documents.\nPremium augmente les quotas (jusqu'à 200 analyses/an) et les fonctionnalités avancées.\nPremium Duo permet de gérer un même espace à deux sur un quota commun." },
  { q: 'Les documents générés par Verebona ont-ils une valeur juridique ?', a: "Non.\nVerebona est une plateforme de centralisation et d'organisation documentaire.\n\nLes documents importés ne sont ni certifiés, ni validés, ni garantis juridiquement par Verebona." },
  { q: 'Mes données sont-elles sécurisées ?', a: "Oui.\nVos données sont hébergées sur une infrastructure sécurisée et protégées par des mécanismes de chiffrement lors du stockage et des échanges.\n\nVous restez l'unique propriétaire des contenus que vous importez." },
  { q: "Dois-je m'abonner dès le début ?", a: "Oui.\nVous choisissez votre offre dès l'inscription, avec 2 mois offerts (3 mois en cas de parrainage) — aucun paiement aujourd'hui, carte bancaire requise." },
  { q: 'Puis-je récupérer mes données si je mets fin à mon abonnement ?', a: "Oui. L'arrêt de l'abonnement ne doit pas vous priver de vos informations. Verebona prévoit des modalités de récupération de vos données pour éviter tout verrouillage." },
]

const useCases = [
  { badge: 'Duo', title: 'Vie à deux & Biens communs', scenario: 'Vous gérez ensemble un logement, une voiture ou des équipements dans un espace commun partagé.', without: ['Coordination difficile entre les parties', 'Aucune vue centralisée des biens partagés', 'Risque de désaccord sur les dépenses'], withSteps: ["Gestion centralisée et partage d'informations sécurisé.", 'Tableau de bord commun pour un suivi clair.', 'Historique des transactions et accords accessible.'] },
  { badge: 'Sinistre', title: 'Incendie, dégât des eaux, cambriolage', scenario: 'Vous devez déclarer un sinistre et prouver ce que vous aviez, où, et à quelle valeur.', without: ['Reconstitution de mémoire fastidieuse', 'Factures introuvables au moment critique', 'Dossier incomplet → indemnisation réduite'], withSteps: ["Filtre instantané par pièce et par type d'objet.", "Export prêt à partager (liste + photos + preuves d'achat).", 'Envoi en quelques minutes à l\'assureur.'] },
  { badge: 'Vol', title: 'Vélo ou smartphone volé', scenario: 'Vous déposez plainte puis activez une assurance (habitation ou spécifique).', without: ['Numéro de série introuvable', 'Preuve d\'achat et date manquantes', 'Dépôt de plainte ralenti, assurance bloquée'], withSteps: ['La fiche contient déjà modèle, numéro de série/IMEI, photos, facture.', 'Génération d\'un récapitulatif « plainte / assurance » en un clic.', 'Ajout des infos du vol (date, lieu, n° de PV) dans l\'historique.'] },
  { badge: 'Revente', title: 'Électroménager & high-tech', scenario: 'Vous revendez (Leboncoin, Back Market…) et voulez inspirer confiance.', without: ['Annonce réécrite à la main sans données précises', 'Facture et garantie introuvables', 'Allers-retours avec les acheteurs, délais rallongés'], withSteps: ['Filtre par catégorie, état, garantie active.', 'Fiche synthétique copiable (modèle, date d\'achat, preuve, garantie).', 'Meilleure transparence → moins de questions des acheteurs.'] },
  { badge: 'Déménagement', title: 'Transfert de contrats & inventaire', scenario: 'Vous changez de logement et devez résilier/transférer des contrats sans oublier de dates.', without: ['Contrats dispersés, échéances ratées', 'Inventaire difficile à constituer', 'Stress, pénalités, pertes de temps'], withSteps: ['Contrats centralisés avec dates clés (préavis, échéances).', 'Inventaire par pièce avant/après utile pour l\'assurance.', 'Rappels automatiques pour éviter les oublis.'] },
  { badge: 'Succession', title: 'Transmission patrimoniale', scenario: 'Lors d\'une succession, il faut établir un inventaire (valeurs + preuves) pour le notaire.', without: ['Semaines de recherche pour reconstituer l\'inventaire', 'Estimations approximatives, documents introuvables', 'Tensions possibles entre les parties'], withSteps: ['Biens importants déjà documentés (valeur, photos, preuves).', 'Export complet formaté et partageable.', 'Accès encadré et clair pour les personnes concernées.'] },
  { badge: 'Pro', title: 'Inventaire valorisé (indépendants, artisans)', scenario: 'Vous devez justifier des achats (outillage, matériel, véhicule) en cas de contrôle.', without: ['Factures éparpillées, justificatifs illisibles', 'Aucune vue consolidée du matériel pro', 'Risque de redressement fiscal'], withSteps: ['Chaque bien enregistré avec facture, date, valeur.', 'Tag « usage professionnel » pour filtrer.', 'Export consolidé prêt à fournir.'] },
]

const ucPill = (on: boolean) =>
  "font-family:'Space Mono',monospace;font-size:10px;letter-spacing:.06em;text-transform:uppercase;padding:3px 8px;border-radius:6px;white-space:nowrap;flex-shrink:0;border:1px solid " +
  (on ? 'rgba(59,130,246,.5)' : 'rgba(148,163,184,.22)') +
  ';background:' + (on ? 'rgba(59,130,246,.2)' : 'rgba(148,163,184,.1)') +
  ';color:' + (on ? '#93C5FD' : '#94A3B8')

export function useLanding() {
  const nav = computed(() => labels.map((_, i) => ({ style: tabStyle(i === slide.value), onClick: () => { slide.value = i } })))
  const dots = computed(() => labels.map((_, i) => ({ style: dotStyle(i === slide.value), onClick: () => { slide.value = i } })))

  const slideLabel = computed(() => labels[slide.value])
  const isDashboard = computed(() => slide.value === 0)
  const isBiens = computed(() => slide.value === 1)
  const isEvents = computed(() => slide.value === 2)
  const isDocs = computed(() => slide.value === 3)
  const prev = () => { slide.value = (slide.value + 3) % 4 }
  const next = () => { slide.value = (slide.value + 1) % 4 }

  const faqItems = computed(() =>
    faqData.map((f, i) => {
      const open = faq.value === i
      return {
        q: f.q,
        a: f.a,
        open,
        onClick: () => { faq.value = faq.value === i ? -1 : i },
        chevron: `display:inline-block;font-size:18px;transition:transform .25s;transform:rotate(${open ? '180deg' : '0deg'})`,
        rowStyle: `border:1px solid ${open ? 'rgba(37,99,235,.4)' : '#E6EBF3'};border-radius:14px;background:${open ? 'rgba(37,99,235,.05)' : '#fff'};box-shadow:0 2px 8px rgba(15,27,51,.04);overflow:hidden;transition:all .2s`,
      }
    }),
  )

  const ucItems = computed(() =>
    useCases.map((u, i) => {
      const on = uc.value === i
      return {
        badge: u.badge,
        title: u.title,
        scenario: u.scenario,
        without: u.without,
        withSteps: u.withSteps,
        open: on,
        onClick: () => { uc.value = uc.value === i ? -1 : i },
        badgeStyle: ucPill(on),
        headerStyle:
          'display:flex;align-items:center;gap:13px;width:100%;text-align:left;padding:16px 20px;cursor:pointer;transition:all .15s;background:' +
          (on ? 'rgba(59,130,246,.08)' : 'transparent') +
          ';border:none;border-left:3px solid ' + (on ? '#3B82F6' : 'transparent'),
        titleStyle:
          "flex:1;font-family:'Instrument Sans',sans-serif;font-size:15.5px;font-weight:600;letter-spacing:-.01em;color:" +
          (on ? '#fff' : '#C3CDDE'),
        chevStyle:
          'transition:transform .2s;transform:rotate(' + (on ? '90deg' : '0deg') +
          ');color:' + (on ? '#60A5FA' : '#5A6577') + ';flex-shrink:0',
      }
    }),
  )

  return {
    nav, dots, slideLabel, isDashboard, isBiens, isEvents, isDocs, prev, next,
    faqItems, ucItems,
    showMascot: true,
    showMockup: true,
  }
}
