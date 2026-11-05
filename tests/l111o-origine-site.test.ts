// Lot 111O — origine du manifeste des CGUV par environnement (inscriptions bloquées en préprod le 05/11/2026).
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolveSiteOrigin } from '../scripts/lib/legal-core.mjs'

describe('L111O — origine du site publiée dans le manifeste', () => {
  it('sans variable : déduite de VITE_ENVIRONMENT', () => {
    expect(resolveSiteOrigin('production', undefined)).toBe('https://www.verebona.fr')
    expect(resolveSiteOrigin('preprod', undefined)).toBe('https://preprod.verebona.fr')
  })
  it('préproduction avec l’origine de la prod : build en échec explicite', () => {
    expect(() => resolveSiteOrigin('preprod', 'https://www.verebona.fr')).toThrow(/VITE_ENVIRONMENT=preprod/)
    expect(() => resolveSiteOrigin('preprod', 'https://verebona.fr/')).toThrow(/préproduction/)
    expect(resolveSiteOrigin('preprod', 'https://preprod.verebona.fr/')).toBe('https://preprod.verebona.fr')
  })
  it('URL invalide : erreur explicite', () => {
    expect(() => resolveSiteOrigin('production', 'pas une url')).toThrow(/invalide/)
    expect(() => resolveSiteOrigin('production', 'http://www.verebona.fr')).toThrow(/invalide/)
  })
  it('.env.production ne fige plus l’origine (lue aussi par le build de préprod sur Scalingo)', () => {
    expect(readFileSync('.env.production', 'utf8')).not.toMatch(/^VITE_PUBLIC_SITE_URL=/m)
  })
})
