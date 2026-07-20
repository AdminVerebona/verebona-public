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
  { q: "Verebona gère-t-il uniquement les logements ?", a: "Non.\nVerebona centralise tous vos biens : logements, véhicules, matériel professionnel, outillage, équipements de loisirs…\n\nChaque bien sert de point d'ancrage pour organiser les documents, informations et événements qui lui sont associés." },
  { q: "Mes données sont-elles sécurisées ?", a: "Oui.\nVos données sont hébergées en France sur une infrastructure sécurisée. Elles sont chiffrées lors de leur transmission et de leur stockage.\n\nVerebona ne vend ni ne loue vos données à des tiers. Vous restez propriétaire des contenus que vous importez et gardez la maîtrise de vos données : vous pouvez les récupérer ou les supprimer à tout moment, sous réserve des éventuelles obligations légales de conservation." },
  { q: "Puis-je récupérer mes données si je mets fin à mon abonnement ?", a: "Oui.\nLa fin de votre abonnement ne vous prive pas de vos informations. Verebona vous permet de récupérer vos données afin d'éviter tout verrouillage." },
  { q: "Comment fonctionne l'essai gratuit ?", a: "L'essai dure 7 jours, sans carte bancaire et sans engagement, et donne accès aux fonctionnalités Premium : analyse et organisation automatiques, agenda Verebona, dossiers prêts à utiliser, synchronisation d'agenda et réponses à vos questions.\n\nPendant l'essai, vous pouvez enregistrer jusqu'à 2 biens et 30 documents.\n\nUn seul essai par compte." },
  { q: "Que se passe-t-il après les 7 jours d'essai ?", a: "À la fin de l'essai, vous choisissez l'offre et la périodicité qui vous conviennent — mensuelle ou annuelle — puis vous renseignez votre carte bancaire pour activer votre abonnement.\n\nSans action de votre part, aucun abonnement n'est souscrit et aucun paiement n'est déclenché." },
  { q: "Les documents générés par Verebona ont-ils une valeur juridique ?", a: "Non.\nVerebona est une plateforme de centralisation et d'organisation documentaire. Les dossiers et exports générés servent à structurer, synthétiser et transmettre vos informations.\n\nIls ne constituent ni une certification, ni une validation juridique, ni un conseil juridique. Les documents originaux que vous importez conservent leur éventuelle valeur propre, mais celle-ci n'est ni vérifiée ni garantie par Verebona." },
  { q: "Que comprennent les dossiers prêts à utiliser ?", a: "Ce sont des dossiers générés à partir des informations et documents associés à vos biens : dossier complet du bien, dossier de vente ou de cession, dossier d'estimation pour l'assurance, dossier d'indemnisation en cas de sinistre, ainsi que d'autres dossiers pratiques à venir.\n\nIls sont réservés aux offres Premium et Premium Duo." },
]

const caseGroups = [
  { label: "Au quotidien", cases: [
    { badge: "Documents", title: "Retrouver une facture, un contrat ou une garantie", scenario: "Vous cherchez une information précise sans savoir dans quel dossier, email ou appareil elle se trouve.", without: ["Documents dispersés entre emails, dossiers et espaces cloud", "Temps perdu à rechercher la bonne version", "Informations importantes difficiles à retrouver rapidement"], withSteps: ["Documents centralisés et rattachés au bon bien", "Informations clés extraites et organisées automatiquement"] },
    { badge: "Agenda", title: "Suivre ses échéances et ses entretiens", scenario: "Vous devez suivre les garanties, assurances, contrôles, renouvellements et opérations d'entretien de vos biens.", without: ["Dates réparties entre documents, emails et agendas", "Risque d'oublier un renouvellement ou un entretien", "Saisie et suivi manuels des échéances"], withSteps: ["Dates détectées automatiquement dans les documents", "Échéances regroupées dans l'agenda Verebona", "Rappels centralisés et synchronisation avec l'agenda personnel en Premium"] },
    { badge: "Duo", title: "Gérer ses biens à deux", scenario: "Vous gérez ensemble un logement, des véhicules ou des équipements dans un espace commun.", without: ["Documents répartis entre plusieurs comptes et appareils", "Informations difficiles à partager et à maintenir à jour", "Échéances et actions suivies séparément"], withSteps: ["Un espace commun pour les biens et les documents", "Une vision partagée des échéances et des éléments à traiter", "Toutes les informations accessibles aux deux utilisateurs"] },
    { badge: "Valeur", title: "Documenter la valeur de ses biens", scenario: "Vous souhaitez conserver les justificatifs permettant de connaître et de prouver la valeur de vos biens.", without: ["Factures, photos et preuves d'achat incomplètes", "Valeur difficile à justifier plusieurs années après l'achat", "Inventaire réalisé dans l'urgence en cas de besoin"], withSteps: ["Prix, factures et justificatifs associés à chaque bien", "Informations et preuves regroupées dans un inventaire structuré", "Dossiers d'estimation et d'assurance prêts à utiliser en Premium"] },
  ]},
  { label: "Quand un événement arrive", cases: [
    { badge: "Revente", title: "Revendre un bien facilement", scenario: "Vous souhaitez vendre un véhicule, un équipement ou un objet avec toutes les informations utiles.", without: ["Factures, références et caractéristiques difficiles à retrouver", "Annonce préparée à partir d'informations incomplètes", "Échanges répétés avec l'acheteur pour fournir les justificatifs"], withSteps: ["Informations et documents du bien déjà centralisés", "Caractéristiques, historique et justificatifs immédiatement disponibles", "Dossier de vente prêt à utiliser en Premium"] },
    { badge: "Sinistre", title: "Faire face à un vol ou à un sinistre", scenario: "Vous devez déclarer un sinistre et prouver ce que vous possédiez, dans quel état et à quelle valeur.", without: ["Reconstitution de mémoire longue et incertaine", "Factures et preuves d'achat introuvables au moment critique", "Dossier incomplet pouvant compliquer l'indemnisation"], withSteps: ["Biens, photos et justificatifs déjà centralisés", "Informations filtrables par bien, pièce ou catégorie", "Dossier d'indemnisation prêt à transmettre en Premium"] },
    { badge: "Déménagement", title: "Préparer un déménagement", scenario: "Vous changez de logement et devez organiser vos biens, vos documents et vos échéances.", without: ["Inventaire réalisé au dernier moment", "Contrats et justificatifs répartis entre plusieurs dossiers", "Risque d'oublier un équipement, une échéance ou une formalité"], withSteps: ["Inventaire des biens déjà disponible et structuré", "Documents et contrats regroupés par logement ou équipement", "Informations utiles accessibles pendant toute la transition"] },
    { badge: "Succession", title: "Préparer une succession ou une transmission", scenario: "Vous devez transmettre une vision claire des biens, des documents et des informations utiles.", without: ["Patrimoine difficile à reconstituer", "Documents dispersés ou inconnus des proches", "Démarches ralenties par des informations manquantes"], withSteps: ["Inventaire centralisé des biens et justificatifs", "Informations structurées et facilement transmissibles", "Export complet permettant de préparer les démarches"] },
  ]},
  { label: "Pour les professionnels", cases: [
    { badge: "Pro", title: "Créer un inventaire professionnel valorisé", scenario: "Vous devez suivre le matériel, les équipements et les justificatifs nécessaires à votre activité.", without: ["Inventaire incomplet ou tenu dans plusieurs fichiers", "Factures et références difficiles à relier aux équipements", "Justification complexe en cas de vente, de sinistre ou de contrôle"], withSteps: ["Matériel et justificatifs centralisés dans un même espace", "Informations structurées par équipement", "Inventaire valorisé prêt à être exploité ou transmis"] },
  ]},
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

  const ucGroups = computed(() => {
    let i = 0
    return caseGroups.map((grp) => ({
      label: grp.label,
      items: grp.cases.map((u) => {
        const idx = i++
        const on = uc.value === idx
        return {
          badge: u.badge,
          title: u.title,
          scenario: u.scenario,
          without: u.without,
          withSteps: u.withSteps,
          open: on,
          onClick: () => { uc.value = uc.value === idx ? -1 : idx },
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
    }))
  })

  return {
    nav, dots, slideLabel, isDashboard, isBiens, isEvents, isDocs, prev, next,
    faqItems, ucGroups,
    showMascot: true,
    showMockup: true,
  }
}
