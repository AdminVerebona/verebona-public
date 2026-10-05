// @vitest-environment node
/**
 * Sélecteur de prévisualisation absent du bundle de production — CDC 8, O2.
 *
 * `vite.config.ts` fige `__VB_CAN_PREVIEW_SITE_MODE__` d'après VITE_ENVIRONMENT
 * (jamais d'après le `mode` Vite : Scalingo construit la préproduction en mode
 * `production`). Le contenu de `dist/` est contrôlé après chaque build par
 * `scripts/check-preview-chunk.mjs`.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { resolveConfig } from 'vite'

const root = process.cwd()
const saved = process.env.VITE_ENVIRONMENT

afterEach(() => {
  if (saved === undefined) delete process.env.VITE_ENVIRONMENT
  else process.env.VITE_ENVIRONMENT = saved
})

async function canPreview(mode: string, environment: string | undefined) {
  if (environment === undefined) delete process.env.VITE_ENVIRONMENT
  else process.env.VITE_ENVIRONMENT = environment
  const config = await resolveConfig(
    { configFile: path.join(root, 'vite.config.ts'), logLevel: 'silent' },
    'build',
    mode,
  )
  return config.define?.__VB_CAN_PREVIEW_SITE_MODE__
}

describe('__VB_CAN_PREVIEW_SITE_MODE__ (vite.config.ts)', () => {
  it.each([
    ['production', undefined, 'false'], // npm run build (.env.production)
    ['production', 'preprod', 'true'], // Scalingo préprod : mode production, VITE_ENVIRONMENT=preprod
    ['preprod', undefined, 'true'], // npm run build:preprod (.env.preprod)
    ['preprod', 'production', 'false'], // la variable de la plateforme l'emporte
    ['production', 'staging', 'false'], // inconnu → production (fallback sûr)
    ['development', undefined, 'true'], // npm run dev (.env.development)
  ])('mode %s, VITE_ENVIRONMENT=%s → %s', async (mode, environment, expected) => {
    expect(await canPreview(mode, environment)).toBe(expected)
  })
})

describe('contrôle de dist/ après build', () => {
  it('build et build:preprod finissent par scripts/check-preview-chunk.mjs', () => {
    const { scripts } = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'))
    for (const name of ['build', 'build:preprod']) {
      expect(scripts[name]).toMatch(/&& node scripts\/check-preview-chunk\.mjs$/)
    }
  })

  it('le sélecteur n’est importé que derrière CAN_PREVIEW_SITE_MODE', () => {
    const app = readFileSync(path.join(root, 'src/App.vue'), 'utf8')
    expect(app).toMatch(/CAN_PREVIEW_SITE_MODE\s*\?\s*defineAsyncComponent\(\(\) => import\('\.\/components\/PreviewModeSwitch\.vue'\)\)/)
    const site = readFileSync(path.join(root, 'src/config/site.ts'), 'utf8')
    expect(site).toContain('__VB_CAN_PREVIEW_SITE_MODE__ ??')
  })
})
