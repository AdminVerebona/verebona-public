// @vitest-environment node
/**
 * Chantier 104P — sources de la rubrique « Légal », versions des CGUV,
 * immuabilité, procédures du PO et manifeste (contrat site public ↔ application).
 */
import { describe, expect, it } from 'vitest'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import {
  CGUV_LOCK_FILE, LEGAL_DOCUMENTS, LEGAL_TEXT_MARKER, buildCguvManifest, checkFragment, checkManifestContract,
  displayHtml, loadLegalSources, publishedVersions, serializeManifest, sha256Hex,
} from '../scripts/lib/legal-core.mjs'
import { publishLegalToDist } from '../scripts/lib/legal-publish.mjs'
import { fakeAppArchive, fillVersion, makeLegalRoot, repo, runScript } from './helpers/legal-fixture'

const SITE = 'https://www.verebona.fr'

describe('L104P-SRC — sources du dépôt', () => {
  const sources = loadLegalSources(repo)

  it('L104P-SRC-01 — aucune erreur de structure ni d’immuabilité ; une source unique par contenu', () => {
    expect(sources.errors).toEqual([])
    expect(LEGAL_DOCUMENTS.map((d) => d.path)).toEqual([
      '/legal/mentions-legales', '/legal/cguv', '/legal/confidentialite', '/legal/sous-traitants', '/legal/parrainage',
    ])
    expect(LEGAL_DOCUMENTS.map((d) => d.tabLabel)).toEqual(['Mentions légales', 'CGUV', 'Confidentialité', 'Sous-traitants et prestataires', 'Parrainage'])
    for (const d of LEGAL_DOCUMENTS.filter((x) => x.source)) expect(existsSync(path.join(repo, d.source!)), d.source!).toBe(true)
  })

  it('L104P-SRC-02 — tant qu’un texte porte le marqueur, il est « à fournir » et jamais publié', () => {
    for (const d of sources.documents.filter((x) => x.pending)) {
      expect(sources.pending.some((p) => p.includes(d.source!))).toBe(true)
    }
    for (const v of sources.versions.filter((x) => x.status === 'texte-a-fournir')) {
      expect(publishedVersions(sources).map((p) => p.code)).not.toContain(v.code)
    }
  })

  it('L104P-SRC-03 — 2026-10-30-v1 existe (version du site) ; 2026-07-30-v1 est une archive de l’application, jamais régénérée', () => {
    const v = sources.versions.find((x) => x.code === '2026-10-30-v1')
    expect(v?.meta.origin).toBe('site')
    const a = sources.versions.find((x) => x.code === '2026-07-30-v1')
    expect(a?.meta.origin).toBe('archive-application')
    expect(a?.meta.requiresReacceptance).toBe(false)
    // Tant que l'original n'est pas importé : ni texte, ni publication.
    if (!a?.bytes) {
      expect(a?.status).toBe('archive-absente')
      expect(publishedVersions(sources).map((p) => p.code)).not.toContain('2026-07-30-v1')
    }
  })

  it('L104P-SRC-04 — Git ne convertit jamais les fins de ligne des textes figés', () => {
    expect(readFileSync(path.join(repo, '.gitattributes'), 'utf8')).toMatch(/^src\/content\/legal\/cguv\/versions\/\*\.html -text$/m)
  })
})

describe('L104P-IMM — immuabilité des versions publiées (verrou versionné)', () => {
  const sources = loadLegalSources(repo)
  const lock = JSON.parse(readFileSync(path.join(repo, CGUV_LOCK_FILE), 'utf8'))

  it('L104P-IMM-01 — chaque version du verrou : fichier présent, SHA-256 et métadonnées inchangés', () => {
    for (const [code, entry] of Object.entries(lock.versions as Record<string, { sha256: string; meta: Record<string, unknown> }>)) {
      const file = path.join(repo, 'src/content/legal/cguv/versions', `${code}.html`)
      expect(existsSync(file), code).toBe(true)
      expect({ code, sha256: sha256Hex(readFileSync(file)) }).toEqual({ code, sha256: entry.sha256 })
      const meta = JSON.parse(readFileSync(file.replace(/\.html$/, '.json'), 'utf8'))
      for (const [k, v] of Object.entries(entry.meta)) expect({ code, k, v: meta[k] ?? null }).toEqual({ code, k, v })
    }
    expect(sources.errors.filter((e) => e.includes('IMMUABILITÉ'))).toEqual([])
  })

  it('L104P-IMM-02 — historique Git du verrou : aucune empreinte publiée n’a jamais changé ni disparu', () => {
    let revs: string[] = []
    try {
      revs = execFileSync('git', ['rev-list', 'HEAD', '--', CGUV_LOCK_FILE], { cwd: repo, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).split('\n').filter(Boolean)
    } catch { /* pas de Git (archive) : contrôle sans objet */ }
    for (const rev of revs) {
      const old = JSON.parse(execFileSync('git', ['show', `${rev}:${CGUV_LOCK_FILE}`], { cwd: repo, encoding: 'utf8' }))
      for (const [code, entry] of Object.entries(old.versions as Record<string, { sha256: string }>)) {
        expect({ rev, code, sha256: lock.versions[code]?.sha256 }).toEqual({ rev, code, sha256: entry.sha256 })
      }
    }
  })

  it('L104P-IMM-03 — détection : un octet modifié, une date ou la décision modifiée après publication → build interrompu', () => {
    const root = makeLegalRoot()
    expect(loadLegalSources(root).errors).toEqual([])
    const html = path.join(root, 'src/content/legal/cguv/versions/2026-10-30-v1.html')
    const original = readFileSync(html)
    writeFileSync(html, Buffer.concat([original, Buffer.from(' ')]))
    expect(loadLegalSources(root).errors.join('\n')).toMatch(/IMMUABILITÉ — empreinte/)
    writeFileSync(html, original)
    const json = html.replace(/\.html$/, '.json')
    const meta = JSON.parse(readFileSync(json, 'utf8'))
    writeFileSync(json, JSON.stringify({ ...meta, requiresReacceptance: true, changeSummary: 'x' }, null, 2))
    expect(loadLegalSources(root).errors.join('\n')).toMatch(/IMMUABILITÉ — « requiresReacceptance » modifié/)
  })

  it('L104P-IMM-04 — une version publiée supprimée est détectée', () => {
    const root = makeLegalRoot()
    const dir = path.join(root, 'src/content/legal/cguv/versions')
    execFileSync('rm', [path.join(dir, '2026-10-30-v1.html'), path.join(dir, '2026-10-30-v1.json')])
    expect(loadLegalSources(root).errors.join('\n')).toMatch(/jamais supprimée/)
  })
})

describe('L104P-PROC — procédures du PO', () => {
  it('L104P-PROC-01 — nouvelle version : gabarit avec marqueur ; figer refusé tant que texte ou décision manquent', () => {
    const root = makeLegalRoot()
    expect(runScript(root, 'legal-nouvelle-cguv.mjs', ['2026-10-30-v1']).code).toBe(1) // code jamais réutilisé
    expect(runScript(root, 'legal-nouvelle-cguv.mjs', ['2026-10-01-v1']).code).toBe(1) // antérieur à la dernière
    expect(runScript(root, 'legal-nouvelle-cguv.mjs', ['2026-11-15-v1']).code).toBe(0)
    const html = readFileSync(path.join(root, 'src/content/legal/cguv/versions/2026-11-15-v1.html'), 'utf8')
    expect(html).toContain(LEGAL_TEXT_MARKER)
    expect(html).toContain('<meta name="verebona-cguv-version" content="2026-11-15-v1">')
    const refus = runScript(root, 'legal-figer-cguv.mjs', ['2026-11-15-v1'])
    expect(refus.code).toBe(1)
    expect(refus.out).toMatch(/texte des CGUV 2026-11-15-v1 à fournir/)
    expect(refus.out).toMatch(/requiresReacceptance/)
    fillVersion(root, '2026-11-15-v1', { requiresReacceptance: true, changeSummary: 'Résumé factice.' })
    expect(runScript(root, 'legal-figer-cguv.mjs', ['2026-11-15-v1']).code).toBe(0)
    const s = loadLegalSources(root)
    expect(s.errors).toEqual([])
    expect(publishedVersions(s).map((v) => v.code)).toEqual(['2026-11-15-v1', '2026-10-30-v1'])
  })

  it('L104P-PROC-02 — substantielle sans résumé : non publiable', () => {
    const root = makeLegalRoot()
    runScript(root, 'legal-nouvelle-cguv.mjs', ['2026-11-15-v1'])
    fillVersion(root, '2026-11-15-v1', { requiresReacceptance: true, changeSummary: '' })
    expect(runScript(root, 'legal-figer-cguv.mjs', ['2026-11-15-v1']).code).toBe(1)
  })

  it('L104P-PROC-03 — import d’archive : refusé si l’empreinte diffère ; sinon octets copiés tels quels (CRLF compris), version listée', () => {
    const root = makeLegalRoot()
    const dir = mkdtempSync(path.join(tmpdir(), 'verebona-archive-'))
    const file = path.join(dir, 'archive.html')
    const bytes = fakeAppArchive('2026-07-30-v1')
    writeFileSync(file, bytes)
    const sha = sha256Hex(bytes)

    const bad = runScript(root, 'import-cguv-archive.mjs', [file, '--code', '2026-07-30-v1', '--sha256', 'a'.repeat(64)])
    expect(bad.code).toBe(1)
    expect(bad.out).toMatch(/REFUSÉ — empreinte du fichier/)
    expect(existsSync(path.join(root, 'src/content/legal/cguv/versions/2026-07-30-v1.html'))).toBe(false)

    const ok = runScript(root, 'import-cguv-archive.mjs', [file, '--code', '2026-07-30-v1', '--sha256', sha.toUpperCase()])
    expect(ok.code, ok.out).toBe(0)
    const copied = readFileSync(path.join(root, 'src/content/legal/cguv/versions/2026-07-30-v1.html'))
    expect(copied.equals(bytes)).toBe(true)
    // Idempotent ; un autre fichier pour le même code est refusé.
    expect(runScript(root, 'import-cguv-archive.mjs', [file, '--code', '2026-07-30-v1', '--sha256', sha]).code).toBe(0)
    writeFileSync(file, Buffer.concat([bytes, Buffer.from('\n')]))
    expect(runScript(root, 'import-cguv-archive.mjs', [file, '--code', '2026-07-30-v1', '--sha256', sha256Hex(readFileSync(file))]).code).toBe(1)

    const s = loadLegalSources(root)
    expect(s.errors).toEqual([])
    const archive = publishedVersions(s).find((v) => v.code === '2026-07-30-v1')!
    expect(archive.sha256).toBe(sha)
    expect(archive.meta).toMatchObject({ origin: 'archive-application', requiresReacceptance: false, publishedAt: '2026-07-30T00:00:00Z' })
    // Affichage : le contenu de <article>, sans le bouton ni le script de l'archive.
    expect(displayHtml(archive.text)).toContain('Article factice')
    expect(displayHtml(archive.text)).not.toContain('onclick')
  })
})

describe('L104P-HTML — structure des textes collés', () => {
  it('L104P-HTML-01 — titres, paragraphes, listes, tableaux et liens admis ; script, style, h1 et attributs refusés', () => {
    expect(checkFragment('<h2>T</h2><p>a <strong>b</strong> <a href="https://x.fr">l</a> <a href="mailto:dpo@verebona.com">m</a></p><table><tr><td colspan="2">c</td></tr></table>', 'x')).toEqual([])
    expect(checkFragment('<script>alert(1)</script>', 'x')).toEqual(['x : balise <script> interdite'])
    expect(checkFragment('<h1>T</h1>', 'x')).toEqual(['x : balise <h1> interdite'])
    expect(checkFragment('<p style="color:red" onclick="x()">t</p>', 'x')).toHaveLength(2)
    expect(checkFragment('<a href="javascript:alert(1)">t</a>', 'x')[0]).toMatch(/lien/)
  })
})

describe('L104P-MAN — manifeste verebona-legal-cguv-versions-v1 (contrat § 4)', () => {
  function publishFixture(site = SITE) {
    const root = makeLegalRoot()
    runScript(root, 'legal-nouvelle-cguv.mjs', ['2026-11-15-v1'])
    fillVersion(root, '2026-11-15-v1', { requiresReacceptance: true, changeSummary: 'Résumé factice.' })
    runScript(root, 'legal-figer-cguv.mjs', ['2026-11-15-v1'])
    const dist = path.join(root, 'dist')
    // Pages pré-rendues minimales (le pré-rendu réel est contrôlé au build).
    const pages = ['mentions-legales', 'cguv', 'confidentialite', 'sous-traitants', 'parrainage', 'cguv/version-inconnue', 'cguv/versions/2026-10-30-v1', 'cguv/versions/2026-11-15-v1']
    for (const p of pages) {
      mkdirSync(path.dirname(path.join(dist, 'legal/.pages', `${p}.html`)), { recursive: true })
      writeFileSync(path.join(dist, 'legal/.pages', `${p}.html`), `<html><h1>${p}</h1></html>`)
    }
    const r = publishLegalToDist({ root, dist, siteOrigin: site, now: new Date('2026-11-15T09:00:00Z') })
    return { root, dist, ...r }
  }

  it('L104P-MAN-01 — généré depuis les sources : champs, permaliens, textUrl, version courante = la plus récente', () => {
    const { manifest, dist } = publishFixture()
    expect(manifest).toMatchObject({ schema: 'verebona-legal-cguv-versions-v1', document: 'CGUV', current: '2026-11-15-v1', generatedAt: '2026-11-15T09:00:00.000Z' })
    const [v1, v0] = (manifest as { versions: Array<Record<string, unknown>> }).versions
    expect(v1).toMatchObject({
      code: '2026-11-15-v1',
      permalink: 'https://www.verebona.fr/legal/cguv/versions/2026-11-15-v1',
      textUrl: 'https://www.verebona.fr/legal/cguv/versions/2026-11-15-v1.html',
      publishedAt: '2026-11-15T08:00:00Z', effectiveAt: '2026-11-15T08:00:00Z',
      requiresReacceptance: true, changeSummary: 'Résumé factice.', title: 'Conditions générales d’utilisation et de vente',
    })
    expect(v0).toMatchObject({ code: '2026-10-30-v1', requiresReacceptance: false })
    expect(v0.changeSummary).toBeUndefined()
    // sha256 = octets réellement écrits dans dist/
    for (const v of [v1, v0]) {
      expect(sha256Hex(readFileSync(path.join(dist, 'legal/cguv/versions', `${v.code}.html`)))).toBe(v.sha256)
    }
    expect(checkManifestContract(manifest, SITE)).toEqual([])
    expect(readFileSync(path.join(dist, 'legal/cguv/versions.json'), 'utf8')).toBe(serializeManifest(manifest))
  })

  it('L104P-MAN-02 — mêmes empreintes en préproduction et en production ; seules les URL changent', () => {
    const prod = publishFixture('https://www.verebona.fr').manifest as { versions: Array<{ sha256: string; permalink: string }> }
    const pre = publishFixture('https://preprod.verebona.fr').manifest as { versions: Array<{ sha256: string; permalink: string }> }
    expect(pre.versions.map((v) => v.sha256)).toEqual(prod.versions.map((v) => v.sha256))
    expect(pre.versions[0].permalink).toBe('https://preprod.verebona.fr/legal/cguv/versions/2026-11-15-v1')
    expect(checkManifestContract(pre, 'https://preprod.verebona.fr')).toEqual([])
    expect(checkManifestContract(pre, 'https://www.verebona.fr').join(' ')).toMatch(/origine/)
  })

  it('L104P-MAN-03 — règles du contrat : refus en entier si un champ manque ou dévie', () => {
    const { manifest } = publishFixture()
    const m = manifest as Record<string, unknown> & { versions: Array<Record<string, unknown>> }
    const clone = () => JSON.parse(JSON.stringify(m))
    const cases: Array<[string, (x: typeof m) => void]> = [
      ['schéma', (x) => { x.schema = 'autre' }],
      ['document', (x) => { x.document = 'CGU' }],
      ['current absent', (x) => { x.current = '2026-12-01-v1' }],
      ['current non le plus récent', (x) => { x.current = '2026-10-30-v1' }],
      ['liste vide', (x) => { x.versions = [] }],
      ['sha256 majuscules', (x) => { x.versions[0].sha256 = String(x.versions[0].sha256).toUpperCase() }],
      ['décision non booléenne', (x) => { x.versions[0].requiresReacceptance = 'true' }],
      ['permalien http', (x) => { x.versions[0].permalink = String(x.versions[0].permalink).replace('https:', 'http:') }],
      ['textUrl d’une autre version', (x) => { x.versions[0].textUrl = x.versions[1].textUrl }],
      ['date sans fuseau', (x) => { x.versions[0].publishedAt = '2026-11-15 08:00' }],
      ['code en double', (x) => { x.versions[1].code = x.versions[0].code }],
    ]
    for (const [label, mutate] of cases) {
      const x = clone()
      mutate(x)
      expect({ label, ok: checkManifestContract(x, SITE).length === 0 }).toEqual({ label, ok: false })
    }
  })

  it('L104P-MAN-04 — aucune version publiable : pas de manifeste (jamais une liste vide)', () => {
    const root = makeLegalRoot({ withMarkers: true })
    const dist = path.join(root, 'dist')
    for (const p of ['mentions-legales', 'cguv', 'confidentialite', 'sous-traitants', 'parrainage', 'cguv/version-inconnue']) {
      mkdirSync(path.dirname(path.join(dist, 'legal/.pages', `${p}.html`)), { recursive: true })
      writeFileSync(path.join(dist, 'legal/.pages', `${p}.html`), '<html></html>')
    }
    const r = publishLegalToDist({ root, dist, siteOrigin: SITE })
    expect(r.manifest).toBeNull()
    expect(existsSync(path.join(dist, 'legal/cguv/versions.json'))).toBe(false)
    expect(() => buildCguvManifest([], SITE)).toThrow(/aucune version/)
  })

  const appRepo = process.env.VEREBONA_APP_REPO
  it.skipIf(!appRepo)('L104P-MAN-05 — lu SANS ERREUR par le code de l’application (cguv-manifest.ts › parseCguvManifest)', async () => {
    const { parseCguvManifest } = await import('@/services/legal/cguv-manifest')
    for (const site of ['https://www.verebona.fr', 'https://preprod.verebona.fr']) {
      const { manifest } = publishFixture(site)
      const parsed = parseCguvManifest(JSON.parse(serializeManifest(manifest)), { NEXT_PUBLIC_PUBLIC_SITE_URL: site })
      expect(parsed).toMatchObject({ ok: true })
      if (!parsed.ok) return
      expect(parsed.manifest.current).toBe('2026-11-15-v1')
      expect(parsed.manifest.versions.map((v: { code: string }) => v.code)).toEqual(['2026-11-15-v1', '2026-10-30-v1'])
      expect(parsed.manifest.versions.every((v: { textUrl: string | null }) => v.textUrl !== null)).toBe(true)
    }
  })
})

describe('L104P-BUILD — chaîne de build', () => {
  const { scripts } = JSON.parse(readFileSync(path.join(repo, 'package.json'), 'utf8')) as { scripts: Record<string, string> }

  it('L104P-BUILD-01 — build et build:preprod : après le pré-rendu, publication (manifeste écrit en dernier) puis contrôle bloquant', () => {
    for (const name of ['build', 'build:preprod']) {
      // check-preview-chunk.mjs reste le dernier maillon (tests/preview-chunk.test.ts) : il ne fait que lire dist/.
      expect(scripts[name]).toMatch(/node scripts\/prerender\.mjs && .*node scripts\/publish-legal\.mjs && node scripts\/check-legal-texts\.mjs && node scripts\/check-preview-chunk\.mjs$/)
    }
  })

  it('L104P-BUILD-02 — contrôle bloquant : échoue avec marqueurs, passe avec des textes complets et figés', () => {
    const pending = runScript(makeLegalRoot({ withMarkers: true }), 'check-legal-texts.mjs', ['--sources'])
    expect(pending.code).toBe(1)
    expect(pending.out).toMatch(/Textes juridiques et décisions du PO à fournir/)
    expect(pending.out).toMatch(/mentions-legales\.html : texte « Mentions légales » à fournir/)
    const ready = runScript(makeLegalRoot(), 'check-legal-texts.mjs', ['--sources'])
    expect(ready.out).toMatch(/conforme/)
    expect(ready.code).toBe(0)
  })

  it('L104P-BUILD-03 — termes interdits dans un texte du site : bloquant (CGSU, Contact DPO, 2025…)', () => {
    const root = makeLegalRoot()
    writeFileSync(path.join(root, 'src/content/legal/mentions-legales.html'), '<p>Contact DPO : x. Mise à jour 2025. Offre Pro. Standard gratuite. CGSU.</p>')
    const r = runScript(root, 'check-legal-texts.mjs', ['--sources'])
    expect(r.code).toBe(1)
    for (const t of ['Contact DPO', '2025', 'Pro', 'Standard gratuit', 'CGSU']) expect(r.out).toContain(`« ${t} » interdit`)
  })
})
