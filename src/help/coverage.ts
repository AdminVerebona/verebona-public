/**
 * Matrice de couverture fonctionnelle — CDC Centre d'aide V1 §12, COVER-01.
 *
 * « Une ligne sans article constitue un défaut de documentation. » La matrice
 * est versionnée (`src/content/aide/coverage.json`) et contrôlée au build de
 * production : chaque ligne doit citer au moins un article PUBLIÉ en
 * production. Seules les lignes de `blockedRows` y échappent, chacune avec la
 * raison de son blocage — et une exception devenue inutile (la ligne est
 * couverte) est elle-même un défaut, pour que la liste ne s'allonge jamais
 * en silence.
 *
 * Fonction pure : aucune lecture de disque.
 */
import type { Corpus } from './corpus'
import { isPublishedIn, type HelpEnvironment } from './outputs'

export interface CoverageRow {
  screen: string
  actions: string
  articles: string[]
}

export interface CoverageMatrix {
  rows: CoverageRow[]
  /** Écran / zone → raison pour laquelle aucun article n'y est publié. */
  blockedRows: Record<string, string>
}

export interface CoverageReport {
  /** Lignes sans article publié ni exception : défauts COVER-01. */
  uncovered: CoverageRow[]
  /** Défauts de la matrice elle-même (ID inconnu, exception inutile…). */
  errors: string[]
  covered: number
  total: number
}

export function readCoverageMatrix(json: unknown): CoverageMatrix {
  const m = json as Partial<CoverageMatrix> | null
  if (!m || !Array.isArray(m.rows)) throw new Error('[centre d’aide] coverage.json : « rows » attendu.')
  return { rows: m.rows, blockedRows: m.blockedRows ?? {} }
}

export function checkCoverage(
  corpus: Corpus,
  matrix: CoverageMatrix,
  env: HelpEnvironment = 'production',
): CoverageReport {
  const byId = new Map(corpus.articles.map((a) => [a.id, a]))
  const errors: string[] = []
  const uncovered: CoverageRow[] = []
  const screens = new Set<string>()
  let covered = 0

  for (const row of matrix.rows) {
    if (screens.has(row.screen)) errors.push(`Ligne « ${row.screen} » en double.`)
    screens.add(row.screen)
    if (!row.articles?.length) errors.push(`Ligne « ${row.screen} » : aucun article cité.`)
    for (const id of row.articles ?? []) {
      if (!byId.has(id)) errors.push(`Ligne « ${row.screen} » : article inconnu ${id}.`)
    }
    const published = (row.articles ?? []).some((id) => {
      const a = byId.get(id)
      return a ? isPublishedIn(a, env) : false
    })
    const blocked = matrix.blockedRows[row.screen]
    if (published) {
      covered++
      if (blocked !== undefined) {
        errors.push(`Ligne « ${row.screen} » couverte : retirer son exception de « blockedRows ».`)
      }
    } else if (blocked === undefined) {
      uncovered.push(row)
    } else if (!blocked.trim()) {
      errors.push(`Ligne « ${row.screen} » : l’exception doit donner sa raison.`)
    }
  }

  for (const screen of Object.keys(matrix.blockedRows)) {
    if (!screens.has(screen)) errors.push(`Exception « ${screen} » : aucune ligne de ce nom dans la matrice.`)
  }

  return { uncovered, errors, covered, total: matrix.rows.length }
}

/** Message de build : vide si la couverture est conforme. */
export function formatCoverage(report: CoverageReport): string {
  return [
    ...report.uncovered.map((r) => `  · « ${r.screen} » (${r.actions}) : aucun article publié parmi ${r.articles.join(', ')}.`),
    ...report.errors.map((e) => `  · ${e}`),
  ].join('\n')
}
