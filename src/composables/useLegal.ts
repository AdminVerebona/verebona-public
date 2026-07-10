import { computed } from 'vue'
import { useRoute } from 'vue-router'

/**
 * Legal page — a single view with three tabs (mentions / cgu / confid),
 * each mapped to its own route so they are independently linkable & indexable:
 *   /mentions-legales   /cgu   /confidentialite
 */
export function useLegal() {
  const route = useRoute()

  const tab = computed<'mentions' | 'cgu' | 'confid'>(() => {
    if (route.path.includes('cgu')) return 'cgu'
    if (route.path.includes('confidentialite')) return 'confid'
    return 'mentions'
  })

  const isMentions = computed(() => tab.value === 'mentions')
  const isCGU = computed(() => tab.value === 'cgu')
  const isConfid = computed(() => tab.value === 'confid')

  const legalTitle = computed(() =>
    tab.value === 'cgu'
      ? "Conditions générales de service et d'utilisation"
      : tab.value === 'confid'
        ? 'Politique de confidentialité'
        : 'Mentions légales',
  )

  const tabStyle = (a: boolean) =>
    `padding:10px 18px;border-radius:999px;font-size:14px;font-weight:600;cursor:pointer;border:1px solid ${a ? 'rgba(37,99,235,.4)' : '#E2E8F0'};background:${a ? 'rgba(37,99,235,.08)' : '#fff'};color:${a ? '#1D4ED8' : '#64748B'};transition:all .15s`

  const legalMentionsStyle = computed(() => tabStyle(isMentions.value))
  const legalCGUStyle = computed(() => tabStyle(isCGU.value))
  const legalConfidStyle = computed(() => tabStyle(isConfid.value))

  return {
    isMentions, isCGU, isConfid, legalTitle,
    legalMentionsStyle, legalCGUStyle, legalConfidStyle,
    crumbLabel: 'Informations légales',
  }
}
