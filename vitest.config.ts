import { defineConfig, type Plugin } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { legalViewData, loadLegalSources } from './scripts/lib/legal-core.mjs'

/**
 * `virtual:legal` sous Vitest (chantier 104P) : mêmes données que le build,
 * lues dans `src/content/legal/`. Les tests peuvent pointer une autre racine
 * de contenus avec `LEGAL_TEST_ROOT` (sources factices d'un dossier temporaire).
 */
function legalVirtualForTests(): Plugin {
  const RESOLVED = '\0virtual:legal'
  return {
    name: 'verebona-legal-test',
    resolveId: (id) => (id === 'virtual:legal' ? RESOLVED : null),
    load(id) {
      if (id !== RESOLVED) return null
      const data = legalViewData(loadLegalSources(process.env.LEGAL_TEST_ROOT || process.cwd()), { includePending: true }) as Record<string, unknown>
      return Object.entries(data).map(([k, v]) => `export const ${k} = ${JSON.stringify(v)};`).join('\n')
    },
  }
}

/**
 * Lecteur du manifeste de l'APPLICATION (contrat 102B) : si `VEREBONA_APP_REPO`
 * désigne un clone de verebona-app, `@/…` résout ses sources et
 * `tests/l104p-legal-manifeste.test.ts` valide le manifeste du site avec le
 * code même de l'application (sinon, ce test est ignoré ; la copie locale
 * des règles du contrat s'applique toujours).
 */
const appRepo = process.env.VEREBONA_APP_REPO
const appSrc = appRepo && existsSync(path.join(appRepo, 'src')) ? path.join(appRepo, 'src') : null

// Tests hors de `src/` : ils ne participent pas au type-check du build de production.
export default defineConfig({
  plugins: [vue(), legalVirtualForTests()],
  resolve: appSrc ? { alias: [{ find: /^@\//, replacement: `${appSrc}/` }] } : {},
  // Pas de valeur figée sous Vitest : `src/config/site.ts` dérive la
  // prévisualisation de VITE_ENVIRONMENT, que les tests font varier.
  define: { __VB_CAN_PREVIEW_SITE_MODE__: 'null' },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
    restoreMocks: true,
    unstubEnvs: true,
  },
})
