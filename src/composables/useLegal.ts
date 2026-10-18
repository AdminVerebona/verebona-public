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

  return {
    isMentions, isCGU, isConfid, legalTitle,
    crumbLabel: 'Informations légales',
  }
}
