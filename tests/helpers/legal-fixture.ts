/**
 * Sources factices de la rubrique « Légal » pour les tests (chantier 104P).
 *
 * Crée une racine temporaire `src/content/legal/` complète, avec des textes de
 * TEST (« Texte factice… ») — jamais un texte juridique — et y fait passer les
 * vraies procédures (`legal-nouvelle-cguv`, `legal-figer-cguv`,
 * `import-cguv-archive`) : les tests éprouvent le même chemin que le PO.
 */
import { execFileSync } from 'node:child_process'
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

export const repo = process.cwd()
const LEGAL = 'src/content/legal'
const MARKER = '<!-- TEXTE-JURIDIQUE-A-FOURNIR -->'

export function runScript(root: string, script: string, args: string[]): { code: number; out: string } {
  try {
    const out = execFileSync(process.execPath, [path.join(repo, 'scripts', script), ...args], {
      env: { ...process.env, LEGAL_ROOT: root }, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
    })
    return { code: 0, out }
  } catch (e) {
    const err = e as { status?: number; stdout?: string; stderr?: string }
    return { code: err.status ?? 1, out: `${err.stdout ?? ''}${err.stderr ?? ''}` }
  }
}

export const dummyFragment = (label: string) =>
  `<h2>1. ${label} — titre factice</h2>\n<p>Texte factice de test pour ${label}. Il ne contient aucune clause.</p>\n<ul>\n<li>Point factice A.</li>\n<li>Point factice B.</li>\n</ul>\n`

/** Racine avec les cinq contenus remplis et une version des CGUV figée. */
export function makeLegalRoot(opts: { withMarkers?: boolean; code?: string; requiresReacceptance?: boolean } = {}): string {
  const root = mkdtempSync(path.join(tmpdir(), 'verebona-legal-'))
  mkdirSync(path.join(root, LEGAL, 'cguv', 'versions'), { recursive: true })
  copyFileSync(path.join(repo, LEGAL, 'controles.json'), path.join(root, LEGAL, 'controles.json'))
  copyFileSync(path.join(repo, LEGAL, 'documents.json'), path.join(root, LEGAL, 'documents.json'))
  writeFileSync(path.join(root, LEGAL, 'cguv', 'empreintes.lock.json'), JSON.stringify({ schema: 'verebona-legal-cguv-lock-v1', versions: {} }, null, 2) + '\n')
  for (const key of ['mentions-legales', 'confidentialite', 'sous-traitants', 'parrainage']) {
    writeFileSync(path.join(root, LEGAL, `${key}.html`), opts.withMarkers ? `${MARKER}\n` : dummyFragment(key))
  }
  const code = opts.code ?? '2026-10-30-v1'
  const r = runScript(root, 'legal-nouvelle-cguv.mjs', [code])
  if (r.code !== 0) throw new Error(r.out)
  if (!opts.withMarkers) {
    fillVersion(root, code, { requiresReacceptance: opts.requiresReacceptance ?? false })
    const f = runScript(root, 'legal-figer-cguv.mjs', [code])
    if (f.code !== 0) throw new Error(f.out)
  }
  return root
}

/** Remplit une version créée par `legal-nouvelle-cguv` (texte factice + décisions). */
export function fillVersion(root: string, code: string, meta: { requiresReacceptance: boolean; changeSummary?: string }) {
  const html = path.join(root, LEGAL, 'cguv', 'versions', `${code}.html`)
  writeFileSync(html, readFileSync(html, 'utf8').replace(MARKER, dummyFragment(`CGUV ${code}`).trim()))
  const json = path.join(root, LEGAL, 'cguv', 'versions', `${code}.json`)
  const m = JSON.parse(readFileSync(json, 'utf8'))
  const day = code.slice(0, 10)
  Object.assign(m, {
    publishedAt: `${day}T08:00:00Z`,
    effectiveAt: `${day}T08:00:00Z`,
    requiresReacceptance: meta.requiresReacceptance,
    changeSummary: meta.changeSummary ?? (meta.requiresReacceptance ? 'Résumé factice de test.' : null),
  })
  writeFileSync(json, JSON.stringify(m, null, 2) + '\n')
}

/** Archive factice au format de l'application (`legal-html.renderer.ts`), CRLF compris. */
export function fakeAppArchive(code: string): Buffer {
  return Buffer.from(
    `<!DOCTYPE html>\r\n<html lang="fr">\r\n<head>\r\n  <meta charset="utf-8">\r\n  <title>Archive factice — version ${code}</title>\r\n</head>\r\n<body>\r\n  <main>\r\n    <header class="doc-header"><h1>Archive factice</h1>\r\n      <p class="doc-actions"><button type="button" onclick="window.print()">Imprimer</button></p>\r\n    </header>\r\n    <article>\r\n<h2>Article factice</h2>\r\n<p>Ancienne version factice de test (CGVU 2025).</p>\r\n    </article>\r\n  </main>\r\n</body>\r\n</html>\r\n`,
    'utf8',
  )
}
