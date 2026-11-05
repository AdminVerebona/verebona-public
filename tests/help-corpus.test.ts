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
    // Lot 108P : + AID-ASSET-009 (coût total de possession).
    expect(result.articles).toHaveLength(101)
    expect(result.categories).toHaveLength(14)
  })

  it('ne contient aucune occurrence T1–T5, quelle que soit la casse (CONTENT-02)', () => {
    for (const f of files) expect(f.raw, f.path).not.toMatch(/\bT[1-5]\b/i)
  })

  it('ne contient plus aucun encadré « Limites et points d’attention » (décision PO)', () => {
    for (const f of files) expect(f.raw, f.path).not.toMatch(/Limites et points d.attention/i)
    for (const a of result.articles) {
      expect(a.blocks.some((b) => b.kind === 'callout' && /Limites/i.test(b.label)), a.id).toBe(false)
    }
  })

  it('refuse un encadré « Limites et points d’attention » réintroduit dans un article', () => {
    const issues = withRaw('AID-START-001', (raw) => `${raw}\n> **Limites et points d’attention** — Texte.\n`)
    expect(issues.some((i) => i.message.includes('Encadré inconnu'))).toBe(true)
  })

  it('refuse un synonyme « t2 » en minuscules (CONTENT-02)', () => {
    const issues = withRaw('AID-AI-005', (raw) => raw.replace('synonyms: [assistant,', 'synonyms: [t2, assistant,'))
    expect(issues.some((i) => i.message.includes('CONTENT-02'))).toBe(true)
  })

  it('refuse une note de rédaction interne dans un article publié (GAP-15)', () => {
    // Lot 105P : AID-DOC-003 est bloqué (règles non appliquées) — article publié pris à la place.
    const issues = withRaw('AID-DOC-001', (raw) => `${raw}\nLa taille reste à confirmer à la recette dans la route d’import actuelle.\n`)
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

  it('publie la suppression du compte sous 24 heures (AID-ACCOUNT-006, lot 104 : aligné sur l’application)', () => {
    const a = result.articles.find((x) => x.id === 'AID-ACCOUNT-006')!
    expect(a.status).toBe('published')
    expect(a.blocker).toBeNull()
    expect(a.relatedArticles).not.toContain('AID-TRANSFER-006') // encore bloqué : pas de lien mort
    const raw = files.find((f) => f.path.endsWith('/AID-ACCOUNT-006.md'))!.raw
    expect(raw).toContain('**clôturé**')
    expect(raw).toContain('**supprimé définitivement sous 24 heures**')
  })

  it('AID-ASSET-009 : coût total de possession (lot 108P, après #646) — Premium/Duo, réel et estimé distincts', () => {
    const a = result.articles.find((x) => x.id === 'AID-ASSET-009')!
    expect(a.status).toBe('published')
    expect(a.category).toBe('biens')
    expect(a.offers).toEqual(['premium', 'premium_duo'])
    expect(a.canonical).toBe('/aide/cout-total-possession-bien')
    const raw = files.find((f) => f.path.endsWith('/AID-ASSET-009.md'))!.raw
    for (const s of [
      'la rubrique reste verrouillée en Standard',
      'l’achat est compté une fois, la facture reste consultable comme justificatif',
      '40 € documentés et 60 € estimés', 'le TCO retient 140 € réels et aucun complément estimé',
      '« Le coût total est calculé automatiquement à partir du prix d’achat et des dépenses associées au bien. »',
      'Les périodes futures ne sont pas ajoutées au coût déjà cumulé.',
    ]) expect(raw, s).toContain(s)
    // Ancienne règle (#445/#474) : les forfaits n'étaient jamais ajoutés au coût cumulé.
    expect(raw).not.toMatch(/jamais ajoutés au coût cumulé/)
    for (const k of ['coût total de possession', 'TCO', 'dépenses d’usage', 'carburant', 'péages', 'recharge', 'forfait',
      'coût estimé', 'facture en double', 'prix d’achat', 'montant introuvable']) expect(a.synonyms, k).toContain(k)
    expect(result.articles.find((x) => x.id === 'AID-ASSET-003')!.relatedArticles).toContain('AID-ASSET-009')
  })
})
