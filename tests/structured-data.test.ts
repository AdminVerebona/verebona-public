/**
 * Données structurées Organization + WebSite — Mini CDC 2 Données structurées
 * Google §4 à §8, AC-01 à AC-08.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import {
  HOME_URL, ORGANIZATION_ID, ORGANIZATION_LOGO_PATH, WEBSITE_ID, buildJsonLd, buildStructuredData, structuredDataScript,
} from '../src/config/structured-data'
import { loadHelpCorpus } from '../help.build'
import { helpArticleHead } from '../src/help/head'

const graph = buildStructuredData()['@graph']
const ofType = (t: string) => graph.filter((n) => n['@type'] === t)

describe('graphe Organization / WebSite', () => {
  it('un seul Organization et un seul WebSite, reliés par @id (§5, §8.1)', () => {
    expect(ofType('Organization')).toHaveLength(1)
    expect(ofType('WebSite')).toHaveLength(1)
    expect(ORGANIZATION_ID).toBe('https://www.verebona.fr/#organization')
    expect(WEBSITE_ID).toBe('https://www.verebona.fr/#website')
    expect(ofType('WebSite')[0].publisher).toEqual({ '@id': ORGANIZATION_ID })
    expect(HOME_URL).toBe('https://www.verebona.fr/')
  })

  it('logo : URL absolue HTTPS vers un PNG servi d’au moins 112 px (AC-04)', () => {
    const logo = ofType('Organization')[0].logo as string
    expect(logo).toBe(`https://www.verebona.fr${ORGANIZATION_LOGO_PATH}`)
    const png = readFileSync(path.join(process.cwd(), 'public', ORGANIZATION_LOGO_PATH))
    expect(png.subarray(1, 4).toString()).toBe('PNG')
    expect(Math.min(png.readUInt32BE(16), png.readUInt32BE(20))).toBeGreaterThanOrEqual(112)
  })

  it('aucun placeholder, aucune URL hors production, sameAs non inventé (AC-05, §6)', () => {
    const json = buildJsonLd()
    expect(json).not.toMatch(/preprod|localhost|\[URL-|\[À/)
    expect(json).not.toContain('<')
    expect(ofType('Organization')[0]).not.toHaveProperty('sameAs')
  })

  it('rien hors production (AC-08)', () => {
    expect(structuredDataScript(false)).toBeNull()
    expect(structuredDataScript(true)).toBe(buildJsonLd())
  })

  it("accueil seulement : le pré-rendu retire le graphe de la coquille SPA et des pages d'aide (§2, §8.1)", () => {
    const script = readFileSync(path.join(process.cwd(), 'scripts', 'prerender.mjs'), 'utf8')
    expect(script).toMatch(/replace\(\/\\s\*<script type="application\\\/ld\\\+json"/)
  })
})

describe("TechArticle des pages d'aide", () => {
  it('référence la même Organization et ne publie aucun code T1–T5 dans keywords (CONTENT-02)', () => {
    const corpus = loadHelpCorpus(process.cwd())
    for (const a of corpus.articles) {
      const head = helpArticleHead(a, corpus.categories.find((c) => c.slug === a.category))
      const ld = head.jsonLd as Record<string, unknown>
      expect(ld['@type']).toBe('TechArticle')
      expect(ld.publisher).toEqual({ '@id': ORGANIZATION_ID })
      expect(String(ld.keywords)).not.toMatch(/\bT[1-5]\b/i)
    }
  })
})
