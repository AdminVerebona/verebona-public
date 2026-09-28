/**
 * Contrôle de la date de mise à jour publiée — CDC Centre d'aide EDITOR-02.
 *
 * Sur l'hébergeur, le build n'a pas `.git` : `dateModified` / `updatedAt`
 * publiés viennent alors du frontmatter `updatedAt`, saisi à la main. Ce
 * contrôle, exécuté en CI (où l'historique Git est disponible), échoue si
 * l'`updatedAt` d'un article est ANTÉRIEUR à la date du dernier commit qui a
 * modifié son contenu : un article retouché sans avancer sa date serait
 * publié avec une date fausse.
 *
 * « Contenu » : toute ligne du fichier sauf la ligne `updatedAt:` elle-même.
 * Un commit qui ne fait qu'ajouter ou corriger `updatedAt` (ex. : lot3, qui a
 * introduit le champ sur tout le corpus) ne rend donc pas l'article « modifié ».
 *
 *   npm run check:help-dates
 *
 * Sans `.git` (archive, build hébergeur) : contrôle ignoré, code 0.
 * Clone superficiel (`fetch-depth: 1`) : erreur, l'historique est incomplet.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

export const ARTICLES_DIR = 'src/content/aide/articles'
const COMMIT_MARK = '\u001ecommit '
const DATE = /^\d{4}-\d{2}-\d{2}$/
const UPDATED_AT_LINE = /^updatedAt:\s*\S*\s*$/

/** `updatedAt` du frontmatter (AAAA-MM-JJ), ou null. */
export function frontmatterUpdatedAt(raw) {
  const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw)
  if (!fm) return null
  const m = /^updatedAt:\s*["']?([^"'\s]+)["']?\s*$/m.exec(fm[1])
  return m ? m[1] : null
}

/**
 * Analyse `git log --format=<COMMIT_MARK>%cs -p --unified=0` (du plus récent
 * au plus ancien) et renvoie, par fichier, la date du dernier commit qui a
 * modifié autre chose que la ligne `updatedAt:`.
 */
export function lastContentCommitDates(log) {
  const out = new Map()
  let date = ''
  let file = null
  let inHunk = false
  for (const line of log.split('\n')) {
    if (line.startsWith(COMMIT_MARK)) {
      date = line.slice(COMMIT_MARK.length).trim()
      file = null
      inHunk = false
    } else if (line.startsWith('diff --git ')) {
      file = null
      inHunk = false
    } else if (!inHunk && line.startsWith('+++ ')) {
      // `+++ /dev/null` : fichier supprimé, sans objet.
      file = line.startsWith('+++ b/') ? line.slice(6) : null
    } else if (line.startsWith('@@ ')) {
      inHunk = true
    } else if (inHunk && file && !out.has(file) && (line.startsWith('+') || line.startsWith('-'))) {
      const content = line.slice(1)
      if (!UPDATED_AT_LINE.test(content)) out.set(file, date)
    }
  }
  return out
}

/**
 * Articles dont la date publiée est absente, invalide ou antérieure au
 * dernier commit de contenu. Les dates AAAA-MM-JJ se comparent comme chaînes.
 */
export function findStaleArticles(articles, commitDates) {
  const problems = []
  for (const { path: p, updatedAt } of articles) {
    const committed = commitDates.get(p)
    if (!updatedAt || !DATE.test(updatedAt)) {
      problems.push({ path: p, updatedAt: updatedAt ?? null, committed: committed ?? null, reason: 'missing' })
    } else if (committed && updatedAt < committed) {
      problems.push({ path: p, updatedAt, committed, reason: 'stale' })
    }
  }
  return problems
}

function git(root, args) {
  return execFileSync('git', args, {
    cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024,
  })
}

/**
 * Exécute le contrôle sur `root`.
 * @returns {{ status: 'skipped' | 'ok' | 'failed', message: string, problems: Array<object> }}
 */
export function checkHelpDates(root) {
  if (!existsSync(path.join(root, '.git'))) {
    return { status: 'skipped', message: 'pas de dépôt Git (.git absent) : contrôle des dates ignoré', problems: [] }
  }
  try {
    if (git(root, ['rev-parse', '--is-shallow-repository']).trim() === 'true') {
      return {
        status: 'failed',
        message: 'clone superficiel : historique incomplet, dates non vérifiables (actions/checkout : fetch-depth: 0)',
        problems: [],
      }
    }
  } catch (e) {
    return { status: 'skipped', message: `Git indisponible (${e.message.split('\n')[0]}) : contrôle ignoré`, problems: [] }
  }

  const names = readdirSync(path.join(root, ARTICLES_DIR)).filter((n) => n.endsWith('.md')).sort()
  const articles = names.map((n) => {
    const p = `${ARTICLES_DIR}/${n}`
    return { path: p, updatedAt: frontmatterUpdatedAt(readFileSync(path.join(root, p), 'utf8')) }
  })
  const log = git(root, [
    '-c', 'core.quotePath=false', 'log', `--format=${COMMIT_MARK}%cs`, '-p', '--unified=0',
    '--no-renames', '--no-color', '--', ARTICLES_DIR,
  ])
  const problems = findStaleArticles(articles, lastContentCommitDates(log))
  if (problems.length === 0) {
    return { status: 'ok', message: `${articles.length} article(s) : updatedAt à jour`, problems }
  }
  const lines = problems.map((p) => (p.reason === 'missing'
    ? `  - ${p.path} : updatedAt absent ou invalide (« ${p.updatedAt ?? ''} »)`
    : `  - ${p.path} : updatedAt ${p.updatedAt} antérieur au dernier commit (${p.committed}) — avancer updatedAt`))
  return {
    status: 'failed',
    message: `${problems.length} article(s) avec une date de mise à jour périmée (EDITOR-02) :\n${lines.join('\n')}`,
    problems,
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
  const r = checkHelpDates(root)
  const out = `[check:help-dates] ${r.message}`
  if (r.status === 'failed') {
    console.error(out)
    process.exit(1)
  }
  console.log(out)
}
