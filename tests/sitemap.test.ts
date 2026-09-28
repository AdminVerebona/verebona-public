/**
 * Sitemap et robots.txt — CDC Sitemap §6, §7, §9, §10 ; CDC Centre d'aide SEO-02.
 */
import { describe, expect, it } from 'vitest'
import { INDEXABLE_PATHS, SITEMAP_URL, buildRobotsTxt, buildSitemapXml, canonicalUrl } from '../src/config/sitemap.rules'
import { loadHelpCorpus } from '../help.build'
import { helpSitemapPaths } from '../src/help/outputs'

const corpus = loadHelpCorpus(process.cwd())
const help = helpSitemapPaths(corpus, 'production')
const xml = buildSitemapXml([...INDEXABLE_PATHS, ...help])
const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])

describe('sitemap.xml de production', () => {
  it('est un urlset XML valide, sans lastmod/changefreq/priority (§6, §7)', () => {
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')).toBe(true)
    expect(xml).not.toMatch(/lastmod|changefreq|priority/)
  })

  it("contient l'accueil, /aide, les thèmes et les seuls articles publiés indexables (SEO-02)", () => {
    expect(locs).toContain('https://www.verebona.fr/')
    expect(locs).toContain('https://www.verebona.fr/aide')
    const published = corpus.articles.filter((a) => a.status === 'published' && a.indexable)
    for (const a of published) expect(locs).toContain(canonicalUrl(a.canonical))
    for (const a of corpus.articles.filter((x) => x.status !== 'published')) {
      expect(locs).not.toContain(canonicalUrl(a.canonical))
    }
    expect(locs).toContain('https://www.verebona.fr/aide/parrainage') // AID-BILL-010 publié (GAP-07)
    expect(locs).toContain('https://www.verebona.fr/aide/supprimer-un-bien') // AID-ASSET-007 publié (GAP-05)
    expect(locs).toContain('https://www.verebona.fr/aide/supprimer-compte') // AID-ACCOUNT-006 publié (suppression différée de 30 jours)
  })

  it("n'expose que des URLs canoniques de production, sans doublon (§10)", () => {
    expect(new Set(locs).size).toBe(locs.length)
    for (const l of locs) {
      expect(l).toMatch(/^https:\/\/www\.verebona\.fr\//)
      expect(l).not.toMatch(/preprod|localhost|[?#]/)
    }
  })
})

describe('canonicalUrl', () => {
  it('retire query, fragment et slash final, sauf pour la racine', () => {
    expect(canonicalUrl('/aide/?q=x#top')).toBe('https://www.verebona.fr/aide')
    expect(canonicalUrl('/')).toBe('https://www.verebona.fr/')
  })
})

describe('robots.txt', () => {
  it('production : Allow et une seule ligne Sitemap (§9)', () => {
    const txt = buildRobotsTxt(true)
    expect(txt).toContain('Allow: /')
    expect(txt.match(/Sitemap:/g)).toHaveLength(1)
    expect(txt).toContain(SITEMAP_URL)
  })

  it('hors production : Disallow et aucun sitemap annoncé (§10)', () => {
    expect(buildRobotsTxt(false)).toBe('User-agent: *\nDisallow: /\n')
  })
})
