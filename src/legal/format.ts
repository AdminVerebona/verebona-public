/**
 * Dates de la rubrique « Légal » — JJ/MM/AAAA, fuseau de Paris explicite : le
 * pré-rendu (serveur de build) et le navigateur affichent le même jour.
 */
const FMT = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', day: '2-digit', month: '2-digit', year: 'numeric' })

export function formatLegalDate(value: string | null | undefined): string {
  if (!value) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-')
    return `${d}/${m}/${y}`
  }
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : FMT.format(date)
}
