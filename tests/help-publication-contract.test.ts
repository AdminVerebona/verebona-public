/**
 * Contrat de publication des articles d'aide — CDC Assistant §10.3, §10.4 ;
 * décision PO D-O (lot 21).
 *
 * Un article PUBLIÉ porte sa date de validation ; le corpus de l'assistant
 * (`/aide/corpus-t2.json`) et le catalogue exposent statut, date de
 * validation, routes et actions autorisées, version de l'application. Le
 * build échoue sur un article publié sans date de validation.
 */
import { describe, expect, it } from 'vitest'
import { readHelpSources } from '../help.build'
import { loadCorpus } from '../src/help/corpus'
import { buildCatalog, buildT2Corpus } from '../src/help/outputs'

const root = process.cwd()
const { files, categories } = readHelpSources(root)
const result = loadCorpus(files, categories)

function withRaw(id: string, edit: (raw: string) => string) {
  const patched = files.map((f) => (f.path.endsWith(`/${id}.md`) ? { ...f, raw: edit(f.raw) } : f))
  return loadCorpus(patched, categories)
}

describe('contrat de publication (§10.3, D-O)', () => {
  it('tout article publié du corpus réel porte une date de validation et une version', () => {
    const publies = result.articles.filter((a) => a.status === 'published')
    expect(publies.length).toBeGreaterThan(90)
    for (const a of publies) {
      expect(a.validatedAt, a.id).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(a.appVersion, a.id).toBe('V1')
    }
  })

  it('article publié SANS date de validation : défaut de build', () => {
    const r = withRaw('AID-ACCOUNT-001', (raw) => raw.replace(/^validatedAt:.*\n/m, ''))
    const issues = r.issues.filter((i) => i.articleId === 'AID-ACCOUNT-001')
    expect(issues).toEqual([expect.objectContaining({ field: 'validatedAt', message: expect.stringMatching(/Obligatoire pour un article publié/) })])
  })

  it('date de validation illisible, route ou action hors catalogue : défauts de build', () => {
    const r = withRaw('AID-ACCOUNT-001', (raw) => raw
      .replace(/^validatedAt:.*$/m, 'validatedAt: 26/09/2026')
      .replace(/^appVersion:.*$/m, 'appVersion: V1\nallowedRoutes: [/mon-compte, mon-compte]\nallowedActions: [OPEN_ACCOUNT, DELETE_EVERYTHING]'))
    const champs = r.issues.filter((i) => i.articleId === 'AID-ACCOUNT-001').map((i) => i.field).sort()
    expect(champs).toEqual(['allowedActions', 'allowedRoutes', 'validatedAt'])
  })

  it('validation antérieure à la dernière mise à jour (updatedAt) : article à revalider', () => {
    const r = withRaw('AID-ACCOUNT-001', (raw) => raw
      .replace(/^updatedAt:.*$/m, 'updatedAt: 2026-09-20')
      .replace(/^validatedAt:.*$/m, 'validatedAt: 2026-09-19'))
    const issues = r.issues.filter((i) => i.articleId === 'AID-ACCOUNT-001')
    expect(issues).toEqual([expect.objectContaining({ field: 'validatedAt', message: expect.stringMatching(/antérieure à la dernière mise à jour.*revalider/) })])
    // Même jour, ou validation postérieure : accepté.
    const ok = withRaw('AID-ACCOUNT-001', (raw) => raw
      .replace(/^updatedAt:.*$/m, 'updatedAt: 2026-09-20')
      .replace(/^validatedAt:.*$/m, 'validatedAt: 2026-09-20'))
    expect(ok.issues).toEqual([])
  })

  it('date de validation future : défaut de build', () => {
    const r = withRaw('AID-ACCOUNT-001', (raw) => raw.replace(/^validatedAt:.*$/m, 'validatedAt: 2999-01-01'))
    const issues = r.issues.filter((i) => i.articleId === 'AID-ACCOUNT-001')
    expect(issues).toEqual([expect.objectContaining({ field: 'validatedAt', message: expect.stringMatching(/future/) })])
  })

  it('corpus réel : aucune validation antérieure à updatedAt ni future (dates V1 recopiées de updatedAt)', () => {
    const aujourdHui = new Date().toISOString().slice(0, 10)
    for (const f of files) {
      const v = /^validatedAt:\s*(\S+)/m.exec(f.raw)?.[1]
      const u = /^updatedAt:\s*(\S+)/m.exec(f.raw)?.[1]
      if (!v || !u) continue
      expect(v >= u && v <= aujourdHui, f.path).toBe(true)
    }
  })

  it('article bloqué : la date de validation n’est pas exigée', () => {
    const bloque = result.articles.find((a) => a.status === 'blocked')!
    expect(bloque.validatedAt).toBeNull()
    expect(result.issues).toEqual([])
  })

  it('corpus T2 et catalogue : statut, date de validation, routes, actions, version', () => {
    const r = withRaw('AID-ACCOUNT-001', (raw) => raw
      .replace(/^appVersion:.*$/m, 'appVersion: V1\nallowedRoutes: [/mon-compte]\nallowedActions: [OPEN_ACCOUNT]'))
    expect(r.issues).toEqual([])
    const t2 = buildT2Corpus(r, 'production', 'v', '2026-10-01T00:00:00Z')
    const a = t2.articles.find((x) => x.id === 'AID-ACCOUNT-001')!
    expect(a).toMatchObject({ status: 'published', validatedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/), allowedRoutes: ['/mon-compte'], allowedActions: ['OPEN_ACCOUNT'], appVersion: 'V1' })
    // Production : seuls les publiés, tous avec leur date.
    expect(t2.articles.every((x) => x.status === 'published' && x.validatedAt)).toBe(true)
    const cat = buildCatalog(r, 'production', 'v', 'https://www.verebona.fr', '2026-10-01T00:00:00Z')
    expect(cat.articles.find((x) => x.id === 'AID-ACCOUNT-001')).toMatchObject({ validatedAt: a.validatedAt, appVersion: 'V1', allowedActions: ['OPEN_ACCOUNT'] })
  })
})
