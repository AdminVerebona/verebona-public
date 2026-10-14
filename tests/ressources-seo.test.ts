// @vitest-environment node
/**
 * Ressources — SEO de production (CDC Ressources V6 §12, SEO-02, SEO-03,
 * SEO-04, SEO-06, NAV-01, T11, T31).
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { loadRessourceCorpus } from '../ressources.build'
import { ressourceArticleHead, ressourceNotFoundHead, ressourcesIndexHead } from '../src/ressources/head'
import { ressourcesSitemapPaths } from '../src/ressources/outputs'
import { INDEXABLE_PATHS, buildRobotsTxt, buildSitemapXml, canonicalUrl } from '../src/config/sitemap.rules'
import { ORGANIZATION_ID } from '../src/config/structured-data'

const corpus = loadRessourceCorpus(process.cwd())
const cat = new Map(corpus.categories.map((c) => [c.slug, c]))
const heads = corpus.articles.map((a) => ({ a, h: ressourceArticleHead(a, cat.get(a.category)) }))

describe('SEO-02 — title, description et canonical propres à chaque page', () => {
  it('31 titles, 31 descriptions, 31 canonicals auto-référentes, toutes distinctes de l’index', () => {
    const idx = ressourcesIndexHead()
    expect(idx.canonical).toBe('https://www.verebona.fr/ressources')
    for (const k of ['title', 'description', 'canonical'] as const) {
      const vals = heads.map(({ h }) => h[k])
      expect(new Set(vals).size, k).toBe(31)
      expect(vals, k).not.toContain(idx[k])
    }
    for (const { a, h } of heads) {
      expect(h.canonical).toBe(canonicalUrl(a.path))
      expect(h.noindex).toBe(false)
    }
  })

  it('T11 — paramètres d’URL : la canonical reste unique', () => {
    expect(canonicalUrl('/ressources/retrouver-facture-ticket-perdu?utm_source=x#faq')).toBe('https://www.verebona.fr/ressources/retrouver-facture-ticket-perdu')
  })

  it('page introuvable ou retirée : noindex, sans canonical', () => {
    for (const g of [false, true]) {
      const h = ressourceNotFoundHead(g)
      expect(h.noindex).toBe(true)
      expect(h.canonical).toBeNull()
    }
  })
})

describe('SEO-06 — JSON-LD Article et BreadcrumbList conformes aux faits visibles', () => {
  it('dates du fichier, éditeur Verebona, aucun auteur, pas d’image ni de FAQPage', () => {
    for (const { a, h } of heads) {
      const graph = (h.jsonLd as { '@graph': Array<Record<string, unknown>> })['@graph']
      const art = graph.find((x) => x['@type'] === 'Article')!
      expect(art.headline).toBe(a.h1)
      // Lot 54 : sans date réelle de première mise en ligne, aucune date n'est inventée.
      if (a.publishedAt) expect(art.datePublished).toBe(a.publishedAt)
      else expect(art).not.toHaveProperty('datePublished')
      if (a.updatedAt ?? a.publishedAt) expect(art.dateModified).toBe(a.updatedAt ?? a.publishedAt)
      else expect(art).not.toHaveProperty('dateModified')
      expect(art.inLanguage).toBe('fr-FR')
      expect(art.mainEntityOfPage).toBe(canonicalUrl(a.path))
      // Décision PO D29 / Q28 : aucun auteur, même dans les métadonnées facultatives.
      expect(art).not.toHaveProperty('author')
      expect(art.publisher).toEqual({ '@id': ORGANIZATION_ID })
      expect(art).not.toHaveProperty('image')
      expect(JSON.stringify(h.jsonLd)).not.toContain('FAQPage')
      const bc = graph.find((x) => x['@type'] === 'BreadcrumbList')!
      expect((bc.itemListElement as Array<{ name: string }>).map((i) => i.name)).toEqual(['Accueil', 'Ressources', a.h1])
    }
  })
})

describe('SEO-03 / SEO-04 — sitemap existant étendu, robots inchangé', () => {
  const paths = ressourcesSitemapPaths(corpus)
  const xml = buildSitemapXml([...INDEXABLE_PATHS, ...paths])
  it('index et 31 articles publiés, sans doublon ni lastmod', () => {
    expect(paths).toHaveLength(32)
    expect(xml).toContain('<loc>https://www.verebona.fr/ressources</loc>')
    for (const a of corpus.articles) expect(xml).toContain(`<loc>${canonicalUrl(a.path)}</loc>`)
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
    expect(new Set(locs).size).toBe(locs.length)
    expect(xml).not.toMatch(/lastmod/)
  })
  it('vite.config.ts ajoute les Ressources au sitemap existant (pas de second sitemap)', () => {
    const cfg = readFileSync(path.join(process.cwd(), 'vite.config.ts'), 'utf8')
    expect(cfg).toMatch(/buildSitemapXml\(\[\.\.\.INDEXABLE_PATHS, \.\.\.help, \.\.\.ressources\]\)/)
    expect(cfg.match(/fileName: 'sitemap.xml'/g)).toHaveLength(1)
  })
  it('robots.txt de production autorise tout le site', () => {
    expect(buildRobotsTxt(true)).toContain('Allow: /')
    expect(buildRobotsTxt(true)).not.toMatch(/Disallow/)
  })
})

describe('NAV-01 — lien Ressources unique dans le footer, près du Centre d’aide', () => {
  it('le footer porte un seul lien /ressources, juste après le Centre d’aide', () => {
    const footer = readFileSync(path.join(process.cwd(), 'src/components/AppFooter.vue'), 'utf8')
    expect(footer.match(/link\('\/ressources'\)/g)).toHaveLength(1)
    expect(footer.indexOf("link('/ressources')")).toBeGreaterThan(footer.indexOf("link('/aide')"))
    expect(footer.indexOf("link('/ressources')")).toBeLessThan(footer.indexOf("link('/contact')"))
    const header = readFileSync(path.join(process.cwd(), 'src/components/AppHeader.vue'), 'utf8')
    expect(header).not.toContain('/ressources')
  })
})

describe('D29 / Q28 — aucun auteur affiché', () => {
  it('le gabarit d’article n’affiche ni responsable ni signature ; le JSON-LD n’a pas d’auteur', () => {
    const vue = readFileSync(path.join(process.cwd(), 'src/views/ressources/RessourceArticleView.vue'), 'utf8')
    const template = vue.slice(0, vue.indexOf('<script'))
    expect(template).not.toMatch(/reviewOwner|Par \{\{|Équipe éditoriale/)
    for (const { h } of heads) expect(JSON.stringify(h.jsonLd)).not.toMatch(/"author"|Équipe éditoriale/)
  })
})
