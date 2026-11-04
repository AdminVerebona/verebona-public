/**
 * Lot 105P — Ressources : séparation des corpus avec le Centre d'aide
 * (ticket Ressources §2 « NAV / séparation des corpus », décision PO) et
 * accueil des six nouveaux articles (§4).
 *
 * Les Ressources sont autonomes : AUCUN lien ni mention du Centre d'aide,
 * ni dans les articles (toutes sections, checklist, FAQ, exemple, CTA,
 * related, métadonnées, tableaux, sources), ni dans les catégories, ni dans
 * l'index, les cartes, le sommaire, les pieds d'article, le JSON-LD ou le
 * sitemap de la rubrique. Les cas d'échec modifient UNE copie en mémoire.
 *
 * Hors périmètre (navigation GLOBALE du site, partagée par toutes les pages) :
 * le pied de page commun (AppFooter) garde son lien « Centre d'aide » à côté
 * de « Ressources » (NAV-01, tests/ressources-seo.test.ts).
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { defineComponent, h } from 'vue'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { loadRessourceCorpus, readRessourceSources, RESSOURCES_REGISTRY_FILE } from '../ressources.build'
import { helpCenterMentions, isHelpCenterHref, loadRessources } from '../src/ressources/corpus'
import { ressourceArticleHead, ressourcesIndexHead } from '../src/ressources/head'
import { buildRessourceRoutes, checkRessourceRegistry, ressourcesSitemapPaths, visibleArticles } from '../src/ressources/outputs'

const root = process.cwd()
const { files, categories } = readRessourceSources(root)
const corpus = loadRessourceCorpus(root)
const registry = JSON.parse(readFileSync(path.join(root, RESSOURCES_REGISTRY_FILE), 'utf8')) as Record<string, string[]>

function variant(id: string, edit: (raw: string) => string) {
  return loadRessources(files.map((f) => (f.path.endsWith(`/${id}.md`) ? { ...f, raw: edit(f.raw) } : f)), categories)
}
const messages = (r: ReturnType<typeof loadRessources>) => r.issues.map((i) => `${i.articleId} ${i.field} ${i.message}`).join('\n')
const AIDE = /Centre d’aide|centre d’aide|\/aide/

describe('Lot 105P — corpus réel : zéro lien ou mention du Centre d’aide', () => {
  it('aucun fichier d’article ni aucune catégorie ne mentionne l’aide', () => {
    for (const f of files) expect(helpCenterMentions(f.raw), f.path).toEqual([])
    expect(helpCenterMentions(JSON.stringify(categories))).toEqual([])
    expect(loadRessources(files, categories).issues).toEqual([])
  })

  it('le verbe « aider » reste permis (pas de faux positif)', () => {
    expect(helpCenterMentions('Un relevé bancaire peut aider. Cela aidera un dépanneur. Les aides publiques.')).toEqual([])
    expect(helpCenterMentions('Voir [le guide](/ressources/verifier-garantie-appareil) et [l’accueil](/).')).toEqual([])
    expect(isHelpCenterHref('/ressources/aide-reparation')).toBe(false)
    expect(isHelpCenterHref('/aidez-moi')).toBe(false)
    expect(isHelpCenterHref('https://www.service-public.fr/aide')).toBe(false)
  })

  it('related : 100 % Ressources, jamais un article d’aide', () => {
    const ids = new Set(corpus.articles.map((a) => a.id))
    for (const a of corpus.articles) for (const r of a.related) expect(ids.has(r), `${a.id} → ${r}`).toBe(true)
  })

  it('JSON-LD (index et articles) et sitemap de la rubrique : aucune URL d’aide', () => {
    const cat = new Map(corpus.categories.map((c) => [c.slug, c]))
    expect(JSON.stringify(ressourcesIndexHead())).not.toMatch(AIDE)
    for (const a of corpus.articles) expect(JSON.stringify(ressourceArticleHead(a, cat.get(a.category))), a.id).not.toMatch(AIDE)
    for (const p of ressourcesSitemapPaths(corpus)) expect(p).toMatch(/^\/ressources(\/|$)/)
    const routes = buildRessourceRoutes(corpus, 'production')
    expect(JSON.stringify(routes)).not.toMatch(/\/aide/)
  })

  it('gabarits Ressources (index, article, carte, CTA, blocs) : aucun lien ni libellé d’aide', () => {
    for (const f of ['src/views/ressources/RessourcesIndexView.vue', 'src/views/ressources/RessourceArticleView.vue',
      'src/components/ressources/RessourceCard.vue', 'src/components/ressources/RessourceCta.vue', 'src/components/ressources/RessourceBlocks.vue']) {
      const tpl = /<template>[\s\S]*<\/template>/.exec(readFileSync(path.join(root, f), 'utf8'))![0]
      expect(tpl, f).not.toMatch(AIDE)
    }
  })
})

describe('Lot 105P — tests négatifs : tout lien ou mention de l’aide est REFUSÉ', () => {
  const lien = (href: string) => `[le Centre](${href})`
  const cas: Array<[string, (raw: string) => string]> = [
    ['introduction', (x) => x.replace('Vous ne retrouvez plus', `${lien('/aide')} Vous ne retrouvez plus`)],
    ['section', (x) => x.replace('Pour un achat en ligne,', `Voir ${lien('/aide/importer-documents')}. Pour un achat en ligne,`)],
    ['checklist', (x) => x.replace(/(## Checklist pratique\n\n)/, `$1- Lire ${lien('/aide?q=facture')}\n`)],
    ['exemple', (x) => x.replace(/(## Exemple concret\n\n)/, `$1Voir ${lien('/aide#import')}.\n\n`)],
    ['FAQ', (x) => x.replace(/(## Questions fréquentes\n\n\*\*[^\n]+\*\*\n\n)/, `$1Voir ${lien('/aide/')}. `)],
    ['CTA', (x) => x.replace(/(## Et avec Verebona \?\n\n)/, `$1Voir ${lien('https://www.verebona.fr/aide/importer-documents')}. `)],
    ['CTA (préproduction)', (x) => x.replace(/(## Et avec Verebona \?\n\n)/, `$1Voir ${lien('https://preprod.verebona.fr/aide')}. `)],
    ['tableau', (x) => x.replace('Vous ne retrouvez plus', '| Où | Lien |\n| --- | --- |\n| Aide | /aide/faq |\n\nVous ne retrouvez plus')],
    ['source', (x) => x.replace(/(## Sources et références utiles\n\n)/, '$1- [Aide Verebona](https://www.verebona.fr/aide/factures)\n')],
    ['métadonnée boundary', (x) => x.replace(/^boundary: .*$/m, 'boundary: Pour le produit, voir /aide.')],
    ['métadonnée metaDescription', (x) => x.replace(/^metaDescription: .*$/m, 'metaDescription: Retrouver une preuve d’achat, avec le Centre d’aide Verebona.')],
    ['métadonnée intent', (x) => x.replace(/^intent: .*$/m, 'intent: Lire le help center')],
    ['texte « Centre d’aide »', (x) => x.replace('Vous ne retrouvez plus', 'Consultez le Centre d’aide. Vous ne retrouvez plus')],
  ]
  for (const [where, edit] of cas) {
    it(`lien ou mention dans : ${where}`, () => {
      const r = variant('A01', edit)
      expect(r.issues.length, where).toBeGreaterThan(0)
      expect(messages(r), where).toMatch(/A01 (aide|body|sources) .*Centre d’aide/)
    })
  }

  it('related pointant un article d’aide : refusé', () => {
    const r = variant('A01', (x) => x.replace(/^related: .*$/m, 'related: [A02, AID-DOC-003]'))
    expect(messages(r)).toMatch(/A01 related Article lié inconnu : AID-DOC-003/)
  })

  it('un brouillon n’y échappe pas (contrôle quel que soit le statut)', () => {
    const r = variant('A01', (x) => x.replace(/^status: published$/m, 'status: draft').replace('Vous ne retrouvez plus', `${lien('/aide')} Vous ne retrouvez plus`))
    expect(messages(r)).toMatch(/Centre d’aide/)
  })

  it('catégorie qui renvoie vers l’aide : refusée', () => {
    const cats = (categories as Array<Record<string, unknown>>).map((c, i) => (i === 0 ? { ...c, intro: `${c.intro} Voir le Centre d’aide.` } : c))
    const r = loadRessources(files, cats)
    expect(r.issues.map((i) => i.message).join('\n')).toMatch(/Catégorie factures-preuves-achat — mention du Centre d’aide/)
  })

  it('liens permis : page Ressources publiée, accueil, URL externe HTTPS', () => {
    const r = variant('A01', (x) => x.replace('Vous ne retrouvez plus', '[Garantie](/ressources/verifier-garantie-appareil), [accueil](/), [source](https://www.service-public.fr/particuliers/vosdroits/F11094). Vous ne retrouvez plus'))
    expect(r.issues).toEqual([])
  })
})

// ── Rendu de l'index : l'encart « Centre d'aide » a disparu ──────────────────
// `virtual:ressources` n'existe qu'au build : on fournit à la vue les mêmes
// données (corpus réel, articles visibles en production).
vi.mock('../src/ressources/useRessources', async () => {
  const { loadRessourceCorpus: load } = await import('../ressources.build')
  const { visibleArticles: visible } = await import('../src/ressources/outputs')
  const c = load(process.cwd())
  const articles = visible(c, 'production')
  return {
    useRessources: () => ({
      environment: 'production',
      categories: c.categories.filter((k) => articles.some((a) => a.category === k.slug)),
      articlesOf: (slug: string) => articles.filter((a) => a.category === slug),
      count: articles.length,
    }),
  }
})

describe('Lot 105P — index /ressources rendu', () => {
  afterEach(() => { document.head.innerHTML = '' })
  it('aucun encart « Vous utilisez déjà Verebona ? », aucun lien ni texte vers l’aide', async () => {
    const Stub = defineComponent({ render: () => h('div') })
    const router = createRouter({ history: createMemoryHistory(), routes: ['/', '/ressources', '/ressources/:slug'].map((p) => ({ path: p, component: Stub })) })
    await router.push('/ressources')
    await router.isReady()
    const V = (await import('../src/views/ressources/RessourcesIndexView.vue')).default
    const w = mount(V, { global: { plugins: [router] } })
    await flushPromises()
    expect(w.text()).not.toMatch(/Vous utilisez déjà Verebona|Centre d’aide|Centre d'aide/)
    const hrefs = w.findAll('a').map((a) => a.attributes('href') ?? '')
    expect(hrefs.length).toBeGreaterThan(31)
    for (const href of hrefs) expect(href, href).toMatch(/^(#[a-z-]+|\/|\/ressources\/[a-z0-9-]+)$/)
    expect(w.findAll('.ha-card')).toHaveLength(visibleArticles(corpus, 'production').length)
  })
})

// ── Accueil des six nouveaux articles (ticket Ressources §4) ─────────────────
/**
 * IDs et catégories cibles proposés par le ticket. Les TEXTES viennent du
 * document éditorial du PO (non fourni à ce jour) : rien n'est rédigé ici.
 * Ce test garantit qu'à leur création ces IDs ne collisionnent avec rien
 * (fichier, registre d'URL, redirection) et qu'ils seront rangés dans la
 * catégorie existante prévue.
 */
const NOUVEAUX_105 = [
  { id: 'S05', category: 'assurance-sinistres', sujet: 'Accident de voiture : déclaration, constat et documents' },
  { id: 'L04', category: 'logement-travaux', sujet: 'Acheter un appartement : documents de copropriété à conserver' },
  { id: 'G04', category: 'garanties-reparations', sujet: 'Produit rappelé : vérifier le risque et agir' },
  { id: 'L05', category: 'logement-travaux', sujet: 'Vendre maison/appartement : dossier hors diagnostics' },
  { id: 'C03', category: 'couts-arbitrages', sujet: 'Coût annuel d’un logement : charges, entretien, coûts de détention' },
  { id: 'G05', category: 'garanties-reparations', sujet: 'Équipements installés : garanties, entretien, notices, preuves' },
] as const

describe('Lot 105P — accueil des 6 nouveaux articles (S05, L04, G04, L05, C03, G05)', () => {
  it('IDs au bon format, catégories cibles existantes (aucune catégorie à créer)', () => {
    const cats = new Set(corpus.categories.map((c) => c.slug))
    for (const n of NOUVEAUX_105) {
      expect(n.id).toMatch(/^[A-Z]\d{2}$/)
      expect(cats.has(n.category), n.id).toBe(true)
    }
  })

  it('aucune collision : un ID existant est forcément le nouvel article, dans sa catégorie cible', () => {
    for (const n of NOUVEAUX_105) {
      const a = corpus.articles.find((x) => x.id === n.id)
      if (a) expect(a.category, n.id).toBe(n.category)
      // Registre : clé absente tant que l'article n'est pas publié ; ensuite, son URL seule.
      if (registry[n.id]) expect(a?.status, `${n.id} enregistré sans être publié`).toBe('published')
    }
  })

  it('le pipeline accepte un brouillon à ces IDs sans casser le build, invisible en production', () => {
    const base = files.find((f) => f.path.endsWith('/A01.md'))!.raw
    const extra = NOUVEAUX_105.map((n, i) => ({
      path: `src/content/ressources/articles/${n.id}.md`,
      raw: base
        .replace(/^id: .*$/m, `id: ${n.id}`).replace(/^slug: .*$/m, `slug: brouillon-lot-105-${i}`)
        .replace(/^category: .*$/m, `category: ${n.category}`).replace(/^status: .*$/m, 'status: draft')
        .replace(/^h1: .*$/m, `h1: Brouillon ${n.id} ${'x'.repeat(i)}`).replace(/^seoTitle: .*$/m, `seoTitle: Brouillon ${n.id} | Verebona`)
        .replace(/^metaDescription: .*$/m, `metaDescription: Description provisoire ${n.id}.`).replace(/^intent: .*$/m, `intent: Intention provisoire ${n.id}`)
        .replace(/^reviewedAt: .*\n/m, ''),
    }))
    const r = loadRessources([...files, ...extra], categories)
    expect(r.issues).toEqual([])
    const c = { categories: r.categories, articles: r.articles }
    expect(visibleArticles(c, 'production').map((a) => a.id)).not.toEqual(expect.arrayContaining(['S05']))
    expect(checkRessourceRegistry(c, registry)).toEqual([])
    expect(new Set(r.articles.map((a) => a.id)).size).toBe(files.length + 6)
  })
})
