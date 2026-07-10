import { ref, computed } from 'vue'

// Centre d'aide — accordion of help questions grouped by category.
const aideOpen = ref(-1)

const aideData = [
  { c: 'Premiers pas', q: 'Comment créer mon premier bien ?', a: "Depuis votre tableau de bord, cliquez sur « Ajouter un bien », choisissez une catégorie (logement, véhicule, matériel…) puis renseignez les informations principales. Vous pourrez enrichir la fiche à tout moment." },
  { c: 'Premiers pas', q: 'Comment importer mes documents ?', a: "Ouvrez la fiche d'un bien, section Documents, puis glissez-déposez vos fichiers (PDF, images). L'analyse automatique vous propose un classement et détecte les dates clés." },
  { c: 'Compte & abonnement', q: "Comment changer d'offre ?", a: "Rendez-vous dans Paramètres → Abonnement. Le changement prend effet immédiatement pour une montée en gamme, ou à la fin de la période en cours pour une baisse." },
  { c: 'Compte & abonnement', q: 'Comment résilier mon abonnement ?', a: "Dans Paramètres → Abonnement → Résilier. Vous conservez l'accès jusqu'à la fin de la période payée et pouvez exporter vos données avant l'échéance." },
  { c: 'Données & sécurité', q: 'Comment exporter toutes mes données ?', a: "Dans Paramètres → Données → Exporter. Vous recevez une archive complète (fiches, documents, historique) prête à conserver ou transférer." },
  { c: 'Données & sécurité', q: 'Qui peut voir mes informations ?', a: "Vous seul, sauf partage explicite (offre Duo ou accès invité encadré). Vos contenus ne sont jamais cédés à des tiers." },
]

export function useHelp() {
  const aideItems = computed(() =>
    aideData.map((f, i) => {
      const open = aideOpen.value === i
      return {
        c: f.c,
        q: f.q,
        a: f.a,
        open,
        onClick: () => { aideOpen.value = aideOpen.value === i ? -1 : i },
        chevron: `display:inline-block;font-size:18px;color:#2563EB;transition:transform .25s;transform:rotate(${open ? '180deg' : '0deg'})`,
        rowStyle: `border:1px solid ${open ? 'rgba(37,99,235,.4)' : '#E6EBF3'};border-radius:14px;background:${open ? 'rgba(37,99,235,.05)' : '#fff'};box-shadow:0 2px 8px rgba(15,27,51,.04);overflow:hidden;transition:all .2s`,
      }
    }),
  )
  return { aideItems, crumbLabel: "Centre d'aide" }
}
