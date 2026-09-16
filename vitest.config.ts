import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

// Tests hors de `src/` : ils ne participent pas au type-check du build de production.
export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
    restoreMocks: true,
    unstubEnvs: true,
  },
})
