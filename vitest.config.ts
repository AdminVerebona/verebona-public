import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

// Tests hors de `src/` : ils ne participent pas au type-check du build de production.
export default defineConfig({
  plugins: [vue()],
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
