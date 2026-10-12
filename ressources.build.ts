/**
 * Lecture du corpus Ressources sur disque — côté Node uniquement (build et
 * tests). Même principe que `help.build.ts` : le reste de la chaîne
 * (`src/ressources/*`) est pur.
 */
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { formatRessourceIssues, loadRessources, type RessourceCorpus } from './src/ressources/corpus'
import { checkRessourceRegistry, type RessourceSlugRegistry } from './src/ressources/outputs'

export const RESSOURCES_CONTENT_DIR = 'src/content/ressources'
export const RESSOURCES_REGISTRY_FILE = `${RESSOURCES_CONTENT_DIR}/slug-registry.json`

export function readRessourceSources(root: string) {
  const dir = path.join(root, RESSOURCES_CONTENT_DIR, 'articles')
  const names = readdirSync(dir).filter((n) => n.endsWith('.md')).sort()
  return {
    files: names.map((n) => {
      const p = `${RESSOURCES_CONTENT_DIR}/articles/${n}`
      return { path: p, raw: readFileSync(path.join(root, p), 'utf8') }
    }),
    categories: JSON.parse(readFileSync(path.join(root, RESSOURCES_CONTENT_DIR, 'categories.json'), 'utf8')) as unknown,
  }
}

/**
 * Charge et contrôle le corpus ; lève avec la liste complète des défauts —
 * aucune page n'est publiée tant qu'un défaut bloquant subsiste (§11).
 */
export function loadRessourceCorpus(root: string): RessourceCorpus & { warnings: string[] } {
  const { files, categories } = readRessourceSources(root)
  const { issues, warnings, ...corpus } = loadRessources(files, categories)
  const registry = JSON.parse(readFileSync(path.join(root, RESSOURCES_REGISTRY_FILE), 'utf8')) as RessourceSlugRegistry
  const reg = checkRessourceRegistry(corpus, registry)
  if (issues.length || reg.length) {
    throw new Error(
      `[ressources] build interrompu — ${issues.length + reg.length} défaut(s) (CDC Ressources §11) :\n`
        + [formatRessourceIssues(issues), ...reg.map((e) => `  · ${RESSOURCES_REGISTRY_FILE} — ${e}`)].filter(Boolean).join('\n'),
    )
  }
  return { ...corpus, warnings }
}
