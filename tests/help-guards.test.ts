/**
 * Garde-fous du Centre d'aide — CDC Centre d'aide V1 COVER-01, ARCH-05, EDITOR-02, §7.
 *
 *   - COVER-01 : chaque ligne de la matrice §12 a un article publié en
 *     production, sauf exception motivée (`coverage.json`, `blockedRows`) ;
 *   - ARCH-05  : aucune URL d'article publiée ne disparaît sans redirection
 *     (`slug-registry.json`) ;
 *   - EDITOR-02 : sans Git au build, la date vient du frontmatter `updatedAt` ;
 *   - §7 : les articles débloqués décrivent le comportement livré.
 */
import { describe, expect, it } from 'vitest'
import { readCoverage, readHelpSources, readSlugRegistry } from '../help.build'
import { loadCorpus } from '../src/help/corpus'
import { checkCoverage } from '../src/help/coverage'
import { buildSlugRegistry, checkSlugRegistry } from '../src/help/slug-registry'
import { buildCatalog } from '../src/help/outputs'
import { helpArticleHead } from '../src/help/head'

const root = process.cwd()
const { files, categories } = readHelpSources(root)
const corpus = loadCorpus(files, categories)
const matrix = readCoverage(root)
const registry = readSlugRegistry(root)

const patched = (id: string, edit: (raw: string) => string) =>
  loadCorpus(files.map((f) => (f.path.endsWith(`/${id}.md`) ? { ...f, raw: edit(f.raw) } : f)), categories)

describe('COVER-01 — matrice de couverture §12', () => {
  it('reprend les 50 lignes de la matrice du CDC', () => {
    expect(matrix.rows).toHaveLength(50)
  })

  it('toute ligne a un article publié en production, hors exceptions motivées', () => {
    const report = checkCoverage(corpus, matrix, 'production')
    expect(report.errors).toEqual([])
    expect(report.uncovered.map((r) => r.screen)).toEqual([])
    expect(report.covered).toBe(48)
  })

  it('seules les lignes liées au cycle d’impayé sont exemptées', () => {
    expect(Object.keys(matrix.blockedRows).sort()).toEqual(['Compte restreint', 'Impayé'])
    for (const reason of Object.values(matrix.blockedRows)) expect(reason.trim().length).toBeGreaterThan(20)
  })

  it('une ligne dont l’article est bloqué sans exception fait échouer le contrôle', () => {
    const c = patched('AID-DOSSIER-007', (raw) => raw.replace('status: published', 'status: blocked\nblocker: test'))
    const report = checkCoverage(c, matrix, 'production')
    expect(report.uncovered.map((r) => r.screen)).toEqual(['CIL'])
  })

  it('une exception devenue inutile est signalée', () => {
    const report = checkCoverage(corpus, { ...matrix, blockedRows: { ...matrix.blockedRows, CIL: 'plus nécessaire' } })
    expect(report.errors.join('\n')).toContain('« CIL » couverte')
  })

  it('un article inconnu dans la matrice est signalé', () => {
    const rows = [...matrix.rows, { screen: 'Test', actions: 'x', articles: ['AID-XXX-999'] }]
    expect(checkCoverage(corpus, { ...matrix, rows }).errors.join('\n')).toContain('AID-XXX-999')
  })
})

describe('ARCH-05 — registre des URLs publiées', () => {
  it('le registre versionné est à jour et cohérent avec le corpus', () => {
    expect(checkSlugRegistry(corpus, registry)).toEqual([])
    expect(buildSlugRegistry(corpus, registry)).toEqual(registry)
  })

  it('changer un slug sans redirection échoue', () => {
    const c = patched('AID-DOC-001', (raw) =>
      raw.replace(/slug: (.+)/, 'slug: nouveau-slug').replace(/canonical: .+/, 'canonical: /aide/nouveau-slug'))
    const errors = checkSlugRegistry(c, registry)
    expect(errors.some((e) => e.includes('AID-DOC-001') && e.includes('ne mène plus à rien'))).toBe(true)
    expect(errors.some((e) => e.includes('/aide/nouveau-slug') && e.includes('absent de slug-registry.json'))).toBe(true)
  })

  it('changer un slug AVEC redirection et registre complété passe', () => {
    const old = corpus.articles.find((a) => a.id === 'AID-DOC-001')!.canonical
    const c = patched('AID-DOC-001', (raw) => {
      const r = raw.replace(/slug: (.+)/, 'slug: nouveau-slug').replace(/canonical: .+/, 'canonical: /aide/nouveau-slug')
      return /^redirectFrom: \[/m.test(r)
        ? r.replace(/^redirectFrom: \[/m, `redirectFrom: [${old}, `)
        : r.replace(/^status: /m, `redirectFrom: [${old}]\nstatus: `)
    })
    expect(c.issues).toEqual([])
    expect(checkSlugRegistry(c, buildSlugRegistry(c, registry))).toEqual([])
  })

  it('supprimer un article sans reprendre ses URLs échoue', () => {
    const c = { ...corpus, articles: corpus.articles.filter((a) => a.id !== 'AID-DOC-001') }
    expect(checkSlugRegistry(c, registry).some((e) => e.startsWith('AID-DOC-001 supprimé'))).toBe(true)
  })

  it('retirer une ancienne redirection échoue', () => {
    const withRedirect = corpus.articles.find((a) => a.redirectFrom.length > 0)!
    const c = patched(withRedirect.id, (raw) => raw.replace(/^redirectFrom: .+\n/m, ''))
    expect(checkSlugRegistry(c, registry).some((e) => e.startsWith(withRedirect.id))).toBe(true)
  })
})

describe('EDITOR-02 — date de mise à jour sans Git', () => {
  const noGit = files.map((f) => ({ ...f, updatedAt: null }))
  const c = loadCorpus(noGit, categories)

  it('chaque article porte une date de repli ; le catalogue et le JSON-LD en ont une', () => {
    expect(c.issues).toEqual([])
    for (const a of c.articles) expect(a.updatedAt, a.id).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    const catalog = buildCatalog(c, 'production', 'v', 'https://www.verebona.fr', '2026-09-26T00:00:00Z')
    expect(catalog.articles.every((e) => e.updatedAt)).toBe(true)
    const a = c.articles.find((x) => x.status === 'published')!
    expect(helpArticleHead(a, undefined).jsonLd?.dateModified).toBe(a.updatedAt)
  })

  it('la date Git reste prioritaire quand elle existe', () => {
    const withGit = loadCorpus(files.map((f) => ({ ...f, updatedAt: '2030-01-02T03:04:05+01:00' })), categories)
    expect(withGit.articles[0].updatedAt).toBe('2030-01-02T03:04:05+01:00')
  })

  it('date absente ou invalide : défaut de build', () => {
    const missing = loadCorpus(noGit.map((f) => (f.path.endsWith('/AID-DOC-001.md')
      ? { ...f, raw: f.raw.replace(/^updatedAt: .+\n/m, '') } : f)), categories)
    expect(missing.issues.some((i) => i.articleId === 'AID-DOC-001' && i.field === 'updatedAt')).toBe(true)
    const invalid = loadCorpus(noGit.map((f) => (f.path.endsWith('/AID-DOC-001.md')
      ? { ...f, raw: f.raw.replace(/^updatedAt: .+$/m, 'updatedAt: 26/09/2026') } : f)), categories)
    expect(invalid.issues.some((i) => i.articleId === 'AID-DOC-001' && i.field === 'updatedAt')).toBe(true)
  })
})

describe('§16.1 — référentiel des permissions', () => {
  it('une mention hors référentiel est un défaut de build', () => {
    const c = patched('AID-DOC-001', (raw) => raw.replace(/^permissions: .+$/m, 'permissions: Réservé aux amis'))
    expect(c.issues.some((i) => i.articleId === 'AID-DOC-001' && i.field === 'permissions')).toBe(true)
  })
})

describe('§7 — articles débloqués : comportement livré', () => {
  const raw = (id: string) => files.find((f) => f.path.endsWith(`/${id}.md`))!.raw
  const status = (id: string) => corpus.articles.find((a) => a.id === id)!.status

  it('publiés : fonctions livrées et vérifiées dans l’application', () => {
    for (const id of [
      'AID-ACCOUNT-002', 'AID-ACCOUNT-004', 'AID-ACCOUNT-005', 'AID-TRANSFER-005', 'AID-DOSSIER-007',
      'AID-BILL-004', 'AID-DUO-005', 'AID-DUO-006', 'AID-ASSET-002', 'AID-ASSET-005', 'AID-ACCOUNT-006',
    ]) expect(status(id), id).toBe('published')
  })

  it('restent bloqués : cycle d’impayé, WebView mobile', () => {
    for (const id of ['AID-BILL-008', 'AID-TRANSFER-006', 'AID-START-005']) {
      expect(status(id), id).toBe('blocked')
    }
  })

  it('AID-START-002 décrit l’inscription sur invitation du pré-lancement', () => {
    const r = raw('AID-START-002')
    expect(r).toContain('seules les personnes invitées peuvent créer un compte')
    expect(r).toContain('« Verebona ouvre bientôt »')
    expect(r).not.toMatch(/Depuis le site ou l’application, choisissez la création de compte/)
  })

  it('AID-ACCOUNT-006 : suppression différée de 30 jours, annulable, avec export', () => {
    const r = raw('AID-ACCOUNT-006')
    for (const s of [
      'supprimé définitivement 30 jours plus tard', '**annuler la suppression**', '**exporter vos données**',
      '« SUPPRIMER MON COMPTE »', 'saisissez votre mot de passe', '« Compte en cours de suppression »',
      '7 jours avant', 'n’est pas réactivé automatiquement', 'les factures, les preuves d’acceptation',
      'demandes de rétractation', 'la trace de votre demande de suppression', 'registre des demandes',
    ]) expect(r, s).toContain(s)
    // Plus d'anonymisation immédiate ni de suppression « sans retour » à la confirmation.
    expect(r).not.toMatch(/anonymisées dans la route|ne peut pas être annulée\. *$/m)
    expect(r).not.toContain('blocker:')
  })

  it('AID-DOSSIER-007 : maisons et appartements uniquement', () => {
    expect(raw('AID-DOSSIER-007')).toContain('pour les maisons et les appartements uniquement')
  })

  it('AID-BILL-004 : aucun bien désactivé après un changement d’offre', () => {
    expect(raw('AID-BILL-004')).toContain('ne supprime ni ne désactive aucun bien')
  })

  it('AID-TRANSFER-005 : contenu réel du ZIP', () => {
    const r = raw('AID-TRANSFER-005')
    for (const s of ['recap_donnees.txt', '« documents »', '« photos »', 'photo_1_principale']) expect(r).toContain(s)
  })
})
