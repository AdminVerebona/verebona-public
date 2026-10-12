// @vitest-environment node
/**
 * Rubrique Ressources — corpus et contrôles de publication (CDC Ressources V6
 * §4, §5, §7, §10, §11, §17 ; ADM-03, ADM-07, ADM-08, ADM-09 ; T07 à T10, T18,
 * T22 à T32).
 *
 * Le corpus réel est chargé tel que le build le charge ; les cas d'échec
 * modifient UNE copie en mémoire d'un fichier.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { loadRessourceCorpus, readRessourceSources, RESSOURCES_REGISTRY_FILE } from '../ressources.build'
import { loadRessources, titleSimilarity } from '../src/ressources/corpus'
import {
  articlesToReview, buildRessourceRoutes, checkRessourceRegistry, isVisibleIn, ressourcesSitemapPaths, visibleArticles,
} from '../src/ressources/outputs'
import { parseRessourceBody } from '../src/ressources/markdown'

const root = process.cwd()
const { files, categories } = readRessourceSources(root)
const corpus = loadRessourceCorpus(root)
const registry = JSON.parse(readFileSync(path.join(root, RESSOURCES_REGISTRY_FILE), 'utf8'))

/** Corpus avec un fichier modifié (`edit`) ou ajouté (`extra`). */
function variant(id: string | null, edit: (raw: string) => string, extra: Array<{ path: string; raw: string }> = []) {
  const fs = files.map((f) => (id && f.path.endsWith(`/${id}.md`) ? { ...f, raw: edit(f.raw) } : f))
  return loadRessources([...fs, ...extra], categories)
}
const raw = (id: string) => files.find((f) => f.path.endsWith(`/${id}.md`))!.raw
const messages = (r: ReturnType<typeof loadRessources>) => r.issues.map((i) => `${i.articleId} ${i.field} ${i.message}`).join('\n')

describe('Catalogue canonique (§4, §16, §26)', () => {
  it('31 articles publiés, 31 identifiants et 31 slugs uniques, aucun défaut ni titre proche', () => {
    const r = loadRessources(files, categories)
    expect(r.issues).toEqual([])
    expect(r.warnings).toEqual([])
    expect(corpus.articles).toHaveLength(31)
    expect(new Set(corpus.articles.map((a) => a.id)).size).toBe(31)
    expect(new Set(corpus.articles.map((a) => a.slug)).size).toBe(31)
    expect(corpus.articles.every((a) => a.status === 'published')).toBe(true)
  })

  it('7 familles, effectifs du §4 ; O01 à O06 rangés dans leur famille réelle (NAV-07)', () => {
    const count = (slug: string) => corpus.articles.filter((a) => a.category === slug).length
    expect(corpus.categories.map((c) => c.slug)).toEqual([
      'factures-preuves-achat', 'garanties-reparations', 'echeances-maintenance', 'assurance-sinistres',
      'achat-revente', 'logement-travaux', 'couts-arbitrages',
    ])
    expect([count('factures-preuves-achat'), count('garanties-reparations'), count('echeances-maintenance'), count('assurance-sinistres'),
      count('achat-revente'), count('logement-travaux'), count('couts-arbitrages')]).toEqual([3, 3, 10, 5, 3, 4, 3])
    const cat = (id: string) => corpus.articles.find((a) => a.id === id)!.category
    expect([cat('O01'), cat('O02'), cat('O03'), cat('O04'), cat('O05'), cat('O06')])
      .toEqual(['echeances-maintenance', 'assurance-sinistres', 'couts-arbitrages', 'echeances-maintenance', 'echeances-maintenance', 'logement-travaux'])
  })

  it('livrables de chaque page (§17) : réponse, sections, checklist, exemple, 2 questions, transition, liens, sources', () => {
    for (const a of corpus.articles) {
      expect(a.intro.length, a.id).toBeGreaterThan(0)
      expect(a.sections.length, a.id).toBeGreaterThanOrEqual(5)
      expect(a.checklist.length, a.id).toBeGreaterThan(0)
      expect(a.example.length, a.id).toBeGreaterThan(0)
      expect(a.faq, a.id).toHaveLength(2)
      expect(a.cta.length, a.id).toBeGreaterThan(0)
      expect(a.related.length, a.id).toBeGreaterThanOrEqual(2)
      expect(a.related.length, a.id).toBeLessThanOrEqual(3)
      expect(a.sources.length, a.id).toBeGreaterThan(0)
      for (const s of a.sources) expect(s.url, a.id).toMatch(/^https:\/\//)
      expect(a.reviewedAt, a.id).toBe('2026-10-12')
      expect(a.reviewOwner, a.id).toBe('Équipe éditoriale Verebona')
      expect(a.seoTitle.endsWith(' | Verebona'), a.id).toBe(true)
    }
  })

  it('H1, title, meta description et intention : 0 doublon (T31, T32)', () => {
    for (const k of ['h1', 'seoTitle', 'metaDescription', 'intent'] as const) {
      expect(new Set(corpus.articles.map((a) => a[k])).size, k).toBe(31)
    }
  })

  it('textes repris du CDC sans fautes d’accent connues ni apostrophes droites', () => {
    const tout = files.map((f) => f.raw).join('\n')
    expect(tout).not.toMatch(/\b(méme|étre|aprés|régles?|piéces?|repéres?|chaudiére|modéle|premiére)\b/)
    expect(tout.replace(/\(https?:\/\/[^)]+\)/g, '')).not.toMatch(/[A-Za-zÀ-ÿ]'[A-Za-zÀ-ÿ]/)
  })
})

describe('Frontières éditoriales et contenus sensibles (§5, T21 à T29)', () => {
  const texte = (id: string) => raw(id)
  it('T22 — E02 : calendrier catégorie L, renvoi M1 vers E01', () => {
    expect(texte('E02')).toMatch(/catégorie L/i)
    expect(corpus.articles.find((a) => a.id === 'E02')!.related).toContain('E01')
  })
  it('T23 — E05 / O05 : obligation de visite distincte du renouvellement du contrat', () => {
    expect(corpus.articles.find((a) => a.id === 'O05')!.intent).not.toBe(corpus.articles.find((a) => a.id === 'E05')!.intent)
    expect(corpus.articles.find((a) => a.id === 'O05')!.boundary).toMatch(/E05/)
  })
  it('T28 — L02 : Verebona n’est jamais présenté comme un CIL certifié', () => {
    expect(texte('L02')).not.toMatch(/Verebona (est|constitue) (un|votre) (CIL|carnet)/i)
  })
  it('T21 — O03 et C01 : aucune promesse de calcul de coût automatique livré', () => {
    for (const id of ['O03', 'C01']) {
      const cta = corpus.articles.find((a) => a.id === id)!.cta.map((b) => JSON.stringify(b)).join(' ')
      expect(cta, id).toMatch(/ne sera annoncé qu’après validation|dépendra des fonctionnalités/)
    }
  })
  it('ED-04 — un exemple concret par page, rendu sous l’étiquette « Exemple illustratif »', () => {
    const vue = readFileSync(path.join(root, 'src/views/ressources/RessourceArticleView.vue'), 'utf8')
    expect(vue).toContain('Exemple illustratif')
  })
})

describe('Contrôles bloquants avant publication (§11, ADM-03, ADM-08, ADM-09)', () => {
  it('T07 — deux articles avec le même slug : refus bloquant et message explicite', () => {
    const copie = raw('A01').replace(/^id: A01$/m, 'id: Z99').replace(/^h1: .*$/m, 'h1: Autre titre').replace(/^seoTitle: .*$/m, 'seoTitle: Autre | Verebona')
      .replace(/^metaDescription: .*$/m, 'metaDescription: Autre description.').replace(/^intent: .*$/m, 'intent: Autre intention')
    const r = variant(null, (x) => x, [{ path: 'src/content/ressources/articles/Z99.md', raw: copie }])
    expect(messages(r)).toMatch(/Z99 slug Slug déjà utilisé par A01/)
  })

  it('T08 — deux titles SEO identiques : bloqué ; titre seulement proche : alerte', () => {
    const r = variant('A02', (x) => x.replace(/^seoTitle: .*$/m, raw('A01').match(/^seoTitle: .*$/m)![0]))
    expect(messages(r)).toMatch(/A02 seoTitle Title SEO déjà utilisé par A01/)
    expect(titleSimilarity('Comment conserver ses factures de voiture ?', 'Comment conserver ses factures de voiture longtemps ?')).toBeGreaterThan(0.6)
  })

  it('T18 / ADM-09 — HTML ou script dans un article : refusé au build', () => {
    for (const inj of ['<script>alert(1)</script>', '<img src=x onerror=alert(1)>', '[clic](javascript:alert(1))']) {
      const r = variant('A01', (x) => x.replace('\n## 1. Retrouver', `\n${inj}\n\n## 1. Retrouver`))
      expect(messages(r), inj).toMatch(/HTML ou script interdit|non HTTPS/)
    }
    // Le rendu n'utilise jamais v-html.
    for (const f of ['src/views/ressources/RessourceArticleView.vue', 'src/views/ressources/RessourcesIndexView.vue', 'src/components/ressources/RessourceBlocks.vue', 'src/components/ressources/RessourceCta.vue']) {
      expect(readFileSync(path.join(root, f), 'utf8'), f).not.toMatch(/v-html=/)
    }
  })

  it('ADM-08 — article publié sans source ou sans date de revue : publication refusée', () => {
    const sansSource = variant('A01', (x) => x.replace(/## Sources officielles[\s\S]*$/, '## Sources officielles\n'))
    expect(messages(sansSource)).toMatch(/A01 sources Article publié sans source officielle/)
    const sansRevue = variant('A01', (x) => x.replace(/^reviewedAt: .*\n/m, ''))
    expect(messages(sansRevue)).toMatch(/A01 reviewedAt Article publié sans date de revue/)
  })

  it('SEO-08 — lien interne vers une page inexistante : bloqué', () => {
    const r = variant('A01', (x) => x.replace('Vous ne retrouvez plus', 'Voir [ce guide](/ressources/page-inconnue). Vous ne retrouvez plus'))
    expect(messages(r)).toMatch(/Lien interne cassé : \/ressources\/page-inconnue/)
  })

  it('§7 — article lié inexistant, auto-référence ou plus de trois liés : bloqué', () => {
    expect(messages(variant('A01', (x) => x.replace(/^related: .*$/m, 'related: [A01, Z42]')))).toMatch(/A01 related .*lui-même[\s\S]*Article lié inconnu : Z42/)
    expect(messages(variant('A01', (x) => x.replace(/^related: .*$/m, 'related: [A02, A03, G01, G02]')))).toMatch(/4 article\(s\) lié\(s\)/)
  })

  it('§10 — H2 en double sur une page, FAQ de plus de deux questions : bloqué', () => {
    const p = parseRessourceBody('Intro.\n\n## Titre\n\nA.\n\n## Titre\n\nB.')
    expect(p.errors.join()).toMatch(/Intertitre en double/)
    const faq = variant('A01', (x) => x.replace('## Et avec Verebona ?', '**Troisième question ?**\n\nRéponse.\n\n## Et avec Verebona ?'))
    expect(messages(faq)).toMatch(/FAQ : 3 questions/)
  })
})

describe('Workflow et environnements (§11, NAV-02, SEC-04)', () => {
  const statut = (s: string) => variant('A01', (x) => x.replace(/^status: published$/m, `status: ${s}`).replace(/^reviewedAt: .*\n/m, ''))
  it('brouillon : invisible partout ; en relecture / approuvé : prévisualisés en préproduction seulement', () => {
    for (const s of ['draft', 'review', 'approved']) {
      const r = statut(s)
      const a = r.articles.find((x) => x.id === 'A01')!
      expect(isVisibleIn(a, 'production'), s).toBe(false)
      expect(isVisibleIn(a, 'preprod'), s).toBe(s !== 'draft')
    }
  })
  it('un article publié ne peut pas lier un article non publié (lien mort en production)', () => {
    const r = variant('A02', (x) => x.replace(/^status: published$/m, 'status: review'))
    expect(messages(r)).toMatch(/A01 related Lié à A02, qui n'est pas publié/)
  })
  it('statut inconnu : bloqué', () => {
    expect(messages(statut('en-ligne'))).toMatch(/Statut « en-ligne » inconnu/)
  })
})

describe('URLs publiées : 301, 410, registre (NAV-03, SEO-05, ADM-07, T09, T10)', () => {
  it('le registre versionné est à jour', () => {
    expect(checkRessourceRegistry(corpus, registry)).toEqual([])
  })

  it('T09 — renommer un slug publié SANS redirection : build bloqué', () => {
    const r = variant('A01', (x) => x.replace(/^slug: .*$/m, 'slug: preuve-achat-perdue'))
    expect(checkRessourceRegistry(r, registry).join()).toMatch(/A01 : l’URL publiée \/ressources\/retrouver-facture-ticket-perdu ne mène plus à rien/)
  })

  it('T09 — renommer AVEC redirection : 301 ancien → nouveau, une seule URL active', () => {
    const r = variant('A01', (x) => x.replace(/^slug: .*$/m, 'slug: preuve-achat-perdue').replace(/^redirectFrom: \[\]$/m, 'redirectFrom: [retrouver-facture-ticket-perdu]'))
    expect(r.issues).toEqual([])
    const reg = { ...registry, A01: [...registry.A01, '/ressources/preuve-achat-perdue'] }
    expect(checkRessourceRegistry(r, reg)).toEqual([])
    expect(buildRessourceRoutes(r, 'production').redirects).toEqual({ '/ressources/retrouver-facture-ticket-perdu': '/ressources/preuve-achat-perdue' })
  })

  it('T10 — archiver sans remplacement : 410, retiré du sitemap et des listes', () => {
    const r = variant('C02', (x) => x.replace(/^status: published$/m, 'status: archived').replace(/^redirectFrom: \[\]$/m, 'redirectFrom: []\narchive: 410'))
    // Les articles publiés qui le liaient doivent retirer le lien.
    expect(messages(r)).toMatch(/Lié à C02, archivé/)
    const unlinked = loadRessources(
      files.map((f) => {
        if (f.path.endsWith('/C02.md')) return { ...f, raw: f.raw.replace(/^status: published$/m, 'status: archived').replace(/^redirectFrom: \[\]$/m, 'redirectFrom: []\narchive: 410') }
        return { ...f, raw: f.raw.replace(/^related: \[(.*)\]$/m, (_, l: string) => `related: [${l.split(', ').map((x) => (x === 'C02' ? 'A01' : x)).filter((x, i, t) => t.indexOf(x) === i && !f.path.endsWith(`/${x}.md`)).join(', ')}]`) }
      }),
      categories,
    )
    const routes = buildRessourceRoutes(unlinked, 'production')
    expect(routes.gone).toEqual(['/ressources/reparer-ou-remplacer-electromenager'])
    expect(ressourcesSitemapPaths(unlinked)).not.toContain('/ressources/reparer-ou-remplacer-electromenager')
    expect(visibleArticles(unlinked, 'production').map((a) => a.id)).not.toContain('C02')
    expect(checkRessourceRegistry(unlinked, registry)).toEqual([])
  })

  it('ADM-07 — archiver avec 301 vers l’intention canonique : redirection, pas de chaîne', () => {
    const r = variant('A02', (x) => x.replace(/^status: published$/m, 'status: archived').replace(/^redirectFrom: \[\]$/m, 'redirectFrom: []\narchive: 301:A01'))
    const routes = buildRessourceRoutes(r, 'production')
    expect(routes.redirects['/ressources/conserver-factures-tickets-caisse']).toBe('/ressources/retrouver-facture-ticket-perdu')
    expect(messages(variant('A02', (x) => x.replace(/^status: published$/m, 'status: archived').replace(/^redirectFrom: \[\]$/m, 'redirectFrom: []\narchive: 301:Z11'))))
      .toMatch(/Redirection vers Z11/)
  })
})

describe('ADM-10 — contenus à revoir', () => {
  it('signale les articles dont la revue a plus d’un an', () => {
    expect(articlesToReview(corpus, '2026-12-01')).toEqual([])
    expect(articlesToReview(corpus, '2027-10-13').length).toBe(31)
  })
})
