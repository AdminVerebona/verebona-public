// @vitest-environment node
/**
 * EDITOR-02 — la date publiée (`updatedAt`, saisie à la main et seule
 * source sur l'hébergeur sans `.git`) ne doit jamais être antérieure au
 * dernier commit de contenu de l'article. Contrôle : `npm run check:help-dates`.
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
// @ts-expect-error module JS sans déclaration de types
import { ARTICLES_DIR, checkHelpDates, findStaleArticles, frontmatterUpdatedAt, lastContentCommitDates } from '../scripts/check-help-dates.mjs'

const article = (updatedAt: string | null, body = 'Texte.') =>
  `---\nid: AID-X\ntitle: T\n${updatedAt ? `updatedAt: ${updatedAt}\n` : ''}---\n\n${body}\n`

describe('frontmatterUpdatedAt', () => {
  it('lit la date du frontmatter, pas celle du corps', () => {
    expect(frontmatterUpdatedAt(article('2026-09-20'))).toBe('2026-09-20')
    expect(frontmatterUpdatedAt(article(null, 'updatedAt: 2026-01-01'))).toBeNull()
    expect(frontmatterUpdatedAt('pas de frontmatter')).toBeNull()
  })
})

describe('lastContentCommitDates', () => {
  const M = '\u001ecommit '
  const log = [
    `${M}2026-09-27`, '',
    'diff --git a/a.md b/a.md', '--- a/a.md', '+++ b/a.md', '@@ -3 +3 @@',
    '-updatedAt: 2026-09-20', '+updatedAt: 2026-09-27',
    `${M}2026-09-26`, '',
    'diff --git a/a.md b/a.md', '--- a/a.md', '+++ b/a.md', '@@ -5 +5 @@', '-Ancien', '+Nouveau',
    'diff --git a/b.md b/b.md', '--- a/b.md', '+++ b/b.md', '@@ -1 +1 @@', '-x', '+y',
    'diff --git a/gone.md b/gone.md', '--- a/gone.md', '+++ /dev/null', '@@ -1 +0,0 @@', '-z',
    `${M}2026-09-01`, '',
    'diff --git a/b.md b/b.md', '--- /dev/null', '+++ b/b.md', '@@ -0,0 +1 @@', '+x',
  ].join('\n')

  it('garde le commit de contenu le plus récent ; un commit qui ne touche que updatedAt est ignoré', () => {
    const d = lastContentCommitDates(log)
    expect(d.get('a.md')).toBe('2026-09-26')
    expect(d.get('b.md')).toBe('2026-09-26')
    expect(d.has('gone.md')).toBe(false)
  })
})

describe('findStaleArticles', () => {
  const dates = new Map([['a.md', '2026-09-26'], ['b.md', '2026-09-26']])
  it('updatedAt égal ou postérieur au commit : OK', () => {
    expect(findStaleArticles([{ path: 'a.md', updatedAt: '2026-09-26' }, { path: 'b.md', updatedAt: '2026-09-30' }], dates)).toEqual([])
  })
  it('updatedAt antérieur : périmé ; absent ou invalide : signalé', () => {
    const p = findStaleArticles([
      { path: 'a.md', updatedAt: '2026-09-25' },
      { path: 'b.md', updatedAt: null },
      { path: 'c.md', updatedAt: '26/09/2026' },
    ], dates)
    expect(p.map((x: { path: string; reason: string }) => `${x.path}:${x.reason}`)).toEqual(['a.md:stale', 'b.md:missing', 'c.md:missing'])
  })
  it('article jamais commité (nouveau fichier) : pas de faux positif', () => {
    expect(findStaleArticles([{ path: 'new.md', updatedAt: '2026-01-01' }], new Map())).toEqual([])
  })
})

describe('checkHelpDates (dépôt Git réel)', () => {
  let dir = ''
  afterEach(() => { if (dir) rmSync(dir, { recursive: true, force: true }) })

  const repo = () => {
    dir = mkdtempSync(path.join(tmpdir(), 'help-dates-'))
    mkdirSync(path.join(dir, ARTICLES_DIR), { recursive: true })
    return dir
  }
  const write = (name: string, raw: string) => writeFileSync(path.join(dir, ARTICLES_DIR, name), raw)
  const commit = (date: string) => {
    const env = { ...process.env, GIT_AUTHOR_DATE: `${date}T12:00:00+02:00`, GIT_COMMITTER_DATE: `${date}T12:00:00+02:00` }
    execFileSync('git', ['add', '-A'], { cwd: dir, env })
    execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-qm', date], { cwd: dir, env })
  }

  it('sans .git (build hébergeur) : ignoré sans erreur', () => {
    repo()
    write('AID-A.md', article('2020-01-01'))
    expect(checkHelpDates(dir).status).toBe('skipped')
  })

  it('échoue si le contenu change sans avancer updatedAt, passe une fois la date avancée', () => {
    repo()
    execFileSync('git', ['init', '-q'], { cwd: dir })
    write('AID-A.md', article('2026-09-01'))
    write('AID-B.md', article('2026-09-01'))
    commit('2026-09-01')
    expect(checkHelpDates(dir).status).toBe('ok')

    write('AID-A.md', article('2026-09-01', 'Texte corrigé.'))
    commit('2026-09-10')
    const r = checkHelpDates(dir)
    expect(r.status).toBe('failed')
    expect(r.problems).toEqual([expect.objectContaining({ path: `${ARTICLES_DIR}/AID-A.md`, updatedAt: '2026-09-01', committed: '2026-09-10' })])
    expect(r.message).toContain('AID-A.md')

    // Correction de la date seule, commitée plus tard : ne crée pas de nouvelle
    // exigence (seul le commit de contenu du 10 compte).
    write('AID-A.md', article('2026-09-10', 'Texte corrigé.'))
    commit('2026-09-12')
    expect(checkHelpDates(dir).status).toBe('ok')
  })
})
