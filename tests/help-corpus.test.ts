/**
 * Corpus du Centre d'aide — CDC Centre d'aide V1 §6, §16.1, CONTENT-02, GAP-15.
 *
 * Rejoue sur le corpus RÉEL la validation que `vite.config.ts` applique au
 * build : un défaut éditorial doit casser le test avant de casser le build.
 */
import { describe, expect, it } from 'vitest'
import { readHelpSources } from '../help.build'
import { loadCorpus } from '../src/help/corpus'

const root = process.cwd()
const { files, categories } = readHelpSources(root)
const result = loadCorpus(files, categories)

/** Remplace le texte d'un article du corpus réel pour un cas négatif. */
function withRaw(id: string, edit: (raw: string) => string) {
  const patched = files.map((f) => (f.path.endsWith(`/${id}.md`) ? { ...f, raw: edit(f.raw) } : f))
  return loadCorpus(patched, categories).issues.filter((i) => i.articleId === id)
}

describe('corpus du Centre d\'aide', () => {
  it('passe la validation de build sans aucun défaut (§16.1)', () => {
    expect(result.issues).toEqual([])
    expect(result.articles).toHaveLength(100)
    expect(result.categories).toHaveLength(14)
  })

  it('ne contient aucune occurrence T1–T5, quelle que soit la casse (CONTENT-02)', () => {
    for (const f of files) expect(f.raw, f.path).not.toMatch(/\bT[1-5]\b/i)
  })

  it('refuse un synonyme « t2 » en minuscules (CONTENT-02)', () => {
    const issues = withRaw('AID-AI-005', (raw) => raw.replace('synonyms: [assistant,', 'synonyms: [t2, assistant,'))
    expect(issues.some((i) => i.message.includes('CONTENT-02'))).toBe(true)
  })

  it('refuse une note de rédaction interne dans un article publié (GAP-15)', () => {
    const issues = withRaw('AID-DOC-003', (raw) => `${raw}\nLa taille reste à confirmer à la recette dans la route d’import actuelle.\n`)
    expect(issues.filter((i) => i.message.includes('GAP-15')).length).toBeGreaterThanOrEqual(2)
  })

  it('publie le parrainage sans avantage filleul (GAP-07, AID-BILL-010)', () => {
    const a = result.articles.find((x) => x.id === 'AID-BILL-010')!
    expect(a.status).toBe('published')
    expect(a.blocker).toBeNull()
    const raw = files.find((f) => f.path.endsWith('/AID-BILL-010.md'))!.raw
    expect(raw).toContain('1 mois offert pour vous')
    expect(raw).toContain('Le filleul ne reçoit pas de cadeau de parrainage spécifique')
    expect(raw).not.toMatch(/3 mois d.essai|au lieu de 2/)
  })

  it('publie la suppression d\'un bien avec la règle « tout est supprimé » (GAP-05, AID-ASSET-007)', () => {
    const a = result.articles.find((x) => x.id === 'AID-ASSET-007')!
    expect(a.status).toBe('published')
    expect(a.blocker).toBeNull()
    const raw = files.find((f) => f.path.endsWith('/AID-ASSET-007.md'))!.raw
    expect(raw).toContain('supprime **tout ce qui lui est rattaché**')
    expect(raw).toContain('**définitive et irréversible**')
    expect(raw).toContain('affiche le nombre d’éléments qui seront supprimés')
    expect(raw).toContain('Il n’existe pas d’option pour conserver les documents')
    // Aucune promesse de conservation partielle.
    expect(raw).not.toMatch(/seront (conservés|conservées)|supprimées ou conservées/)
  })

  it('publie la suppression du compte différée de 30 jours (AID-ACCOUNT-006)', () => {
    const a = result.articles.find((x) => x.id === 'AID-ACCOUNT-006')!
    expect(a.status).toBe('published')
    expect(a.blocker).toBeNull()
    expect(a.relatedArticles).not.toContain('AID-TRANSFER-006') // encore bloqué : pas de lien mort
    const raw = files.find((f) => f.path.endsWith('/AID-ACCOUNT-006.md'))!.raw
    expect(raw).toContain('**clôturé**')
    expect(raw).toContain('**supprimé définitivement 30 jours plus tard**')
  })
})
