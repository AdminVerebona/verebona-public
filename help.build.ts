/**
 * Lecture du corpus sur disque — côté Node uniquement (build et tests).
 *
 * Le reste de la chaîne (`src/help/*`) est pur et ne sait rien du disque ;
 * ce module est le seul à lire des fichiers et à interroger Git.
 */
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { formatIssues, loadCorpus, type Corpus, type SourceFile } from './src/help/corpus'

export const HELP_CONTENT_DIR = 'src/content/aide'

/**
 * Date du dernier commit de chaque fichier — EDITOR-02 : « les dates
 * techniques de mise à jour proviennent du dépôt ». Aucune saisie manuelle.
 *
 * Sans historique Git (archive, plateforme qui ne transmet pas `.git`), la
 * date est absente plutôt qu'inventée : une date de build ferait croire que
 * tous les articles viennent d'être revus.
 */
function gitDates(root: string, files: string[]): Map<string, string> {
  const out = new Map<string, string>()
  try {
    const log = execFileSync(
      'git', ['log', '--format=@%cI', '--name-only', '--', `${HELP_CONTENT_DIR}/articles`],
      { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 32 * 1024 * 1024 },
    )
    let date = ''
    for (const line of log.split('\n')) {
      if (line.startsWith('@')) date = line.slice(1)
      else if (line && !out.has(line) && files.includes(line)) out.set(line, date)
    }
  } catch {
    // Pas de Git : dates absentes.
  }
  return out
}

export function readHelpSources(root: string): { files: SourceFile[]; categories: unknown } {
  const dir = path.join(root, HELP_CONTENT_DIR, 'articles')
  const names = readdirSync(dir).filter((n) => n.endsWith('.md')).sort()
  const rel = names.map((n) => `${HELP_CONTENT_DIR}/articles/${n}`)
  const dates = gitDates(root, rel)
  return {
    files: rel.map((p) => ({ path: p, raw: readFileSync(path.join(root, p), 'utf8'), updatedAt: dates.get(p) ?? null })),
    categories: JSON.parse(readFileSync(path.join(root, HELP_CONTENT_DIR, 'categories.json'), 'utf8')),
  }
}

/** Charge et valide le corpus ; lève avec la liste complète des défauts (§16.1). */
export function loadHelpCorpus(root: string): Corpus {
  const { files, categories } = readHelpSources(root)
  const { issues, ...corpus } = loadCorpus(files, categories)
  if (issues.length > 0) {
    throw new Error(
      `[centre d'aide] ${issues.length} défaut(s) dans le corpus — build interrompu (CDC §16.1) :\n${formatIssues(issues)}`,
    )
  }
  return corpus
}

/** Commit déployé : Scalingo le fournit dans SOURCE_VERSION. */
export function deployedCommit(root: string): string | null {
  const fromEnv = process.env.SOURCE_VERSION || process.env.GIT_COMMIT || process.env.COMMIT_SHA
  if (fromEnv) return fromEnv
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  } catch {
    return null
  }
}
