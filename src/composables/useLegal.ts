import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { cguvCurrent, cguvVersions, documents } from 'virtual:legal'
import type { CguvVersionView, LegalDocKey, LegalDocumentView } from '../legal/types'

/**
 * Rubrique « Légal » — page unique à cinq onglets (chantier 104P, contrat
 * site public ↔ application § 2). Chaque onglet a sa propre URL :
 *   /legal/mentions-legales  /legal/cguv  /legal/confidentialite
 *   /legal/sous-traitants    /legal/parrainage
 * et chaque version des CGUV son permalien /legal/cguv/versions/{code}.
 *
 * Les contenus viennent EXCLUSIVEMENT de `virtual:legal` (sources
 * `src/content/legal/`, fournies par le PO) : aucun texte juridique en dur.
 */
export function useLegal() {
  const route = useRoute()

  const activeKey = computed<LegalDocKey>(() => (route.meta.legalTab as LegalDocKey | undefined) ?? 'mentions-legales')
  const activeDoc = computed<LegalDocumentView>(() => documents.find((d) => d.key === activeKey.value) ?? documents[0])

  const isVersionRoute = computed(() => route.name === 'legal-cguv-version')
  const requestedCode = computed(() => (isVersionRoute.value ? String(route.params.code ?? '') : ''))

  const current = computed<CguvVersionView | null>(() => cguvVersions.find((v) => v.code === cguvCurrent) ?? null)
  /** Version du permalien : EXACTEMENT ce code, jamais une autre (null = 404 explicite). */
  const version = computed<CguvVersionView | null>(() =>
    isVersionRoute.value ? cguvVersions.find((v) => v.code === requestedCode.value) ?? null : null,
  )

  const heading = computed(() => {
    if (isVersionRoute.value) return version.value ? `CGUV — version ${version.value.code}` : 'Version des CGUV introuvable'
    return activeDoc.value.title
  })

  return {
    documents,
    cguvVersions,
    activeKey,
    activeDoc,
    isVersionRoute,
    requestedCode,
    current,
    version,
    heading,
    crumbLabel: 'Informations légales',
  }
}
