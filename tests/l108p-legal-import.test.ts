/**
 * Chantier 108P-L — dépose des textes juridiques depuis l'export du Google Doc
 * (`scripts/legal-importer-textes.mjs`, `scripts/lib/legal-import.mjs`).
 *
 * Tous les textes ci-dessous sont FACTICES (« Bloc factice… ») : jamais un
 * texte juridique. Les exports sont fabriqués au format réel de Google Docs
 * (« Page Web » : classes `cN`, liens `google.com/url?q=`, listes
 * `lst-kix_…-N`, commentaires `cmnt`) et Word (.docx : zip, `w:p`, `w:t`,
 * styles « heading N », numérotation).
 */
import { describe, expect, it } from 'vitest'
import { crc32 } from 'node:zlib'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { makeLegalRoot as makeRoot, repo, runScript } from './helpers/legal-fixture'
import { copyFileSync, mkdirSync } from 'node:fs'

/** Racine factice + configuration de découpage du dépôt (lue par l'outil). */
function makeLegalRoot(opts?: Parameters<typeof makeRoot>[0]): string {
  const root = makeRoot(opts)
  mkdirSync(path.join(root, 'src/content/legal/import'), { recursive: true })
  copyFileSync(path.join(repo, 'src/content/legal/import/decoupage.json'), path.join(root, 'src/content/legal/import/decoupage.json'))
  return root
}
import {
  IMPORT_REPORT_FILE, IMPORT_TARGETS, convertExport, depositedFingerprint, fragmentText, readZip, textFingerprint, words,
} from '../scripts/lib/legal-import.mjs'
import { checkFragment, hasMarker, loadLegalSources, LEGAL_TEXT_MARKER } from '../scripts/lib/legal-core.mjs'

const config = JSON.parse(readFileSync(path.join(repo, 'src/content/legal/import/decoupage.json'), 'utf8'))
const NBSP = ' '
const NNBSP = ' '

/** Export « Page Web » au format Google Docs (texte factice). */
function googleHtml(opts: { preamble?: boolean; footnote?: boolean; extraTitle?: string; comment?: boolean } = {}): string {
  return `<html><head><meta content="text/html; charset=UTF-8" http-equiv="content-type"><style type="text/css">ol{margin:0;padding:0}.c1{font-weight:700}.c2{font-style:italic}.c3{color:#1155cc;text-decoration:underline}.c4{margin-left:36pt}.title{padding-top:0pt}</style></head><body class="c9 doc-content">
${opts.preamble ? '<p class="c0"><span>Note interne factice avant les blocs</span></p>' : ''}
<p class="c0 title" id="h.t1"><span>Mentions légales</span></p>
<h1 class="c5" id="h.a"><span>1. Éditeur factice</span></h1>
<p class="c0"><span>Bloc factice A, paragraphe un${NBSP}: contenu</span><span class="c1"> en gras factice</span><span> et </span><span class="c2">italique factice</span><span>.</span></p>
${opts.comment ? '<p class="c0"><span>Phrase factice commentée</span><sup><a href="#cmnt1" id="cmnt_ref1">[a]</a></sup></p>' : ''}
<p class="c0"><span>Contact factice : </span><span class="c3"><a class="c7" href="https://www.google.com/url?q=https://www.example.org/page&amp;sa=D&amp;source=editors&amp;ust=1">www.example.org/page</a></span><span> ou </span><span class="c3"><a href="mailto:factice@example.org">factice@example.org</a></span></p>
<p class="c0 title"><span>CGUV — partie 1/2</span></p>
<h1><span>1. Objet factice</span></h1>
<p class="c0"><span>Bloc factice B, premier paragraphe « guillemets${NNBSP}» et l’apostrophe.</span></p>
<ul class="c8 lst-kix_abc123-0 start"><li class="c4 li-bullet-0"><span>Point factice un</span></li><li class="c4 li-bullet-0"><span>Point factice deux</span></li></ul>
<ul class="c8 lst-kix_abc123-1 start"><li class="c4 li-bullet-0"><span>Sous-point factice</span></li></ul>
<ol class="c8 lst-kix_def456-0 start" start="1"><li><span>Étape factice</span></li></ol>
<h2><span>1.1 Sous-titre factice</span></h2>
<p class="c0"><span>Ligne factice${opts.footnote ? '<sup><a href="#ftnt1" id="ftnt_ref1">[1]</a></sup>' : ''}</span></p>
<p class="c0"><span></span></p>
${opts.extraTitle ? `<p class="c0 title"><span>${opts.extraTitle}</span></p><p><span>Texte factice orphelin</span></p>` : ''}
<p class="c0 title"><span>Politique de confidentialité (1/2)</span></p>
<p class="c0"><span>Bloc factice C.</span></p>
<p class="c0 title"><span>CGUV — partie 2/2</span></p>
<h1><span>2. Suite factice</span></h1>
<p class="c0"><span>Bloc factice B, suite.</span></p>
<p class="c0 title"><span>Politique de confidentialité (2/2)</span></p>
<table class="c10"><tr><td><p><span>Cellule factice 1</span></p></td><td><p><span>Cellule factice 2</span></p></td></tr></table>
<p class="c0 title"><span>Sous-traitants et prestataires</span></p>
<p class="c0"><span>Bloc factice D.</span></p>
<p class="c0 title"><span>Parrainage</span></p>
<p class="c0"><span>Bloc factice E.</span></p>
${opts.comment ? '<div><p><a href="#cmnt_ref1" id="cmnt1">[a]</a><span>Commentaire factice à ne jamais importer</span></p></div>' : ''}
${opts.footnote ? '<div><p><a href="#ftnt_ref1" id="ftnt1">[1]</a><span>Note factice</span></p></div>' : ''}
</body></html>`
}

/* ── .docx factice (zip « stocké », sans dépendance) ── */
function zip(files: Record<string, string>): Buffer {
  const locals: Buffer[] = []
  const centrals: Buffer[] = []
  let offset = 0
  for (const [name, content] of Object.entries(files)) {
    const data = Buffer.from(content, 'utf8')
    const n = Buffer.from(name, 'utf8')
    const crc = crc32(data)
    const lh = Buffer.alloc(30)
    lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt32LE(crc, 14); lh.writeUInt32LE(data.length, 18); lh.writeUInt32LE(data.length, 22); lh.writeUInt16LE(n.length, 26)
    const ch = Buffer.alloc(46)
    ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6); ch.writeUInt32LE(crc, 16); ch.writeUInt32LE(data.length, 20); ch.writeUInt32LE(data.length, 24); ch.writeUInt16LE(n.length, 28); ch.writeUInt32LE(offset, 42)
    locals.push(lh, n, data)
    centrals.push(ch, n)
    offset += 30 + n.length + data.length
  }
  const cd = Buffer.concat(centrals)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(Object.keys(files).length, 8); end.writeUInt16LE(Object.keys(files).length, 10); end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(offset, 16)
  return Buffer.concat([...locals, cd, end])
}
const NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"'
const t = (s: string) => `<w:t xml:space="preserve">${s}</w:t>`
const p = (style: string | null, runs: string) => `<w:p>${style ? `<w:pPr><w:pStyle w:val="${style}"/></w:pPr>` : ''}${runs}</w:p>`
const r = (s: string, rpr = '') => `<w:r>${rpr ? `<w:rPr>${rpr}</w:rPr>` : ''}${t(s)}</w:r>`
const li = (s: string, numId: string, ilvl = '0') => `<w:p><w:pPr><w:numPr><w:ilvl w:val="${ilvl}"/><w:numId w:val="${numId}"/></w:numPr></w:pPr>${r(s)}</w:p>`
function docx(extraBody = ''): Buffer {
  const body = [
    p('Titre', r('Mentions légales')),
    p('Titre1', r('1. Éditeur factice')),
    p(null, r(`Bloc factice A, paragraphe un${NBSP}: contenu`) + r(' en gras factice', '<w:b/>') + r(' et ') + r('italique factice', '<w:i/>') + r('.')),
    p(null, r('Contact factice : ') + `<w:hyperlink r:id="rId9">${r('www.example.org/page', '<w:u w:val="single"/>')}</w:hyperlink>`),
    p('Titre', r('CGUV — partie 1/2')),
    p('Titre1', r('1. Objet factice')),
    li('Point factice un', '1'), li('Point factice deux', '1'), li('Étape factice', '2'),
    p('Titre', r('Politique de confidentialité')),
    p(null, r('Bloc factice C.')),
    `<w:tbl><w:tr><w:tc>${p(null, r('Cellule factice 1'))}</w:tc><w:tc>${p(null, r('Cellule factice 2'))}</w:tc></w:tr></w:tbl>`,
    p('Titre', r('Sous-traitants et prestataires')), p(null, r('Bloc factice D.')),
    p('Titre', r('Parrainage')), p(null, r('Bloc factice E.')),
    extraBody,
    '<w:sectPr/>',
  ].join('')
  return zip({
    '[Content_Types].xml': '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>',
    'word/document.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document ${NS}><w:body>${body}</w:body></w:document>`,
    'word/styles.xml': `<?xml version="1.0"?><w:styles ${NS}><w:style w:type="paragraph" w:styleId="Titre"><w:name w:val="Title"/></w:style><w:style w:type="paragraph" w:styleId="Titre1"><w:name w:val="heading 1"/></w:style></w:styles>`,
    'word/numbering.xml': `<?xml version="1.0"?><w:numbering ${NS}><w:abstractNum w:abstractNumId="0"><w:lvl w:ilvl="0"><w:numFmt w:val="bullet"/></w:lvl></w:abstractNum><w:abstractNum w:abstractNumId="1"><w:lvl w:ilvl="0"><w:numFmt w:val="decimal"/></w:lvl></w:abstractNum><w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num><w:num w:numId="2"><w:abstractNumId w:val="1"/></w:num></w:numbering>`,
    'word/_rels/document.xml.rels': '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId9" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="https://www.example.org/page" TargetMode="External"/></Relationships>',
  })
}

const convert = (buf: Buffer, name: string, cfg = config) => convertExport(buf, name, cfg, { checkFragment })

describe('L108P-IMP — conversion de forme, jamais de fond', () => {
  it('L108P-IMP-01 — export Google « Page Web » : 5 contenus, structure et mise en forme conservées, fidélité mot pour mot', () => {
    const res = convert(Buffer.from(googleHtml({ comment: true })), 'export.html')
    expect(res.refusals).toEqual([])
    expect(res.ok).toBe(true)
    expect(Object.keys(res.fragments).sort()).toEqual([...IMPORT_TARGETS].sort())
    const m = res.fragments['mentions-legales']
    expect(m).toContain('<h2>1. Éditeur factice</h2>')
    expect(m).toContain('<strong>en gras factice</strong>')
    expect(m).toContain('<em>italique factice</em>')
    expect(m).toContain('<a href="https://www.example.org/page">www.example.org/page</a>')
    expect(m).toContain('<a href="mailto:factice@example.org">factice@example.org</a>')
    expect(m).toContain(`paragraphe un${NBSP}: contenu`) // insécable conservé
    expect(m).not.toMatch(/<h1|Mentions légales|google\.com|Commentaire factice|\[a\]/)
    // CGUV : parties 1/2 et 2/2 mises bout à bout, titres de bloc retirés, listes imbriquées.
    const c = res.fragments.cguv
    expect(c).not.toMatch(/partie 1\/2|partie 2\/2/)
    expect(c.indexOf('Objet factice')).toBeLessThan(c.indexOf('Suite factice'))
    expect(c).toMatch(/<ul>\n<li>Point factice un<\/li>\n<li>Point factice deux\n<ul>\n<li>Sous-point factice<\/li>\n<\/ul><\/li>\n<\/ul>/)
    expect(c).toContain('<ol>\n<li>Étape factice</li>\n</ol>')
    expect(c).toContain('<h3>1.1 Sous-titre factice</h3>')
    expect(c).toContain(`« guillemets${NNBSP}» et l’apostrophe`)
    expect(res.fragments.confidentialite).toContain('<table>')
    expect(res.fragments.confidentialite).toContain('<td><p>Cellule factice 2</p></td>')
    for (const f of Object.values(res.fragments)) expect(checkFragment(f, 'x')).toEqual([])
    expect(res.report.commentairesIgnores).toBe(1)
    expect(res.report.fidelite.ok).toBe(true)
  })

  it('L108P-IMP-02 — .docx : même texte que l’export HTML (gras, italique, liens, listes, tableau)', () => {
    const res = convert(docx(), 'export.docx')
    expect(res.refusals).toEqual([])
    expect(res.fragments['mentions-legales']).toContain('<strong>en gras factice</strong>')
    expect(res.fragments['mentions-legales']).toContain('<a href="https://www.example.org/page">www.example.org/page</a>')
    expect(res.fragments.cguv).toContain('<ul>\n<li>Point factice un</li>\n<li>Point factice deux</li>\n</ul>')
    expect(res.fragments.cguv).toContain('<ol>\n<li>Étape factice</li>\n</ol>')
    expect(res.fragments.confidentialite).toContain('<td><p>Cellule factice 1</p></td>')
    const html = convert(Buffer.from(googleHtml()), 'export.html')
    // Contenus identiques dans les deux exports factices → même texte, quel que soit le format.
    for (const k of ['sous-traitants', 'parrainage'] as const) expect(textFingerprint(fragmentText(res.fragments[k]))).toBe(textFingerprint(fragmentText(html.fragments[k])))
  })

  it('L108P-IMP-03 — archive .zip « Page Web » lue sans dépendance', () => {
    const buf = zip({ 'Fichier.html': googleHtml(), 'images/': '' })
    expect([...readZip(buf).keys()]).toContain('Fichier.html')
    expect(convert(buf, 'Fichier.zip').ok).toBe(true)
  })

  it('L108P-IMP-04 — refus explicites (rien n’est inventé) : notes, préambule, bloc sans contenu, suivi des modifications, image, lien http', () => {
    expect(convert(Buffer.from(googleHtml({ footnote: true })), 'e.html').refusals.join('\n')).toMatch(/notes de bas de page/)
    expect(convert(Buffer.from(googleHtml({ preamble: true })), 'e.html').refusals.join('\n')).toMatch(/texte avant le premier bloc/)
    const pre = convert(Buffer.from(googleHtml({ preamble: true })), 'e.html', { ...config, preambule: 'ignorer' })
    expect(pre.ok).toBe(true)
    expect(pre.report.texteIgnore.join(' ')).toContain('Note interne factice')
    expect(convert(Buffer.from(googleHtml({ extraTitle: 'Annexe factice' })), 'e.html').refusals.join('\n')).toMatch(/« Annexe factice » : aucun contenu ne correspond/)
    expect(convert(docx(p(null, '<w:ins w:id="1"><w:r><w:t>ajout</w:t></w:r></w:ins>')), 'e.docx').refusals.join('\n')).toMatch(/suivi des modifications/)
    expect(convert(docx(p(null, '<w:r><w:drawing/></w:r>')), 'e.docx').refusals.join('\n')).toMatch(/image/)
    const http = googleHtml().replace('https://www.google.com/url?q=https://www.example.org/page', 'http://www.example.org/page')
    expect(convert(Buffer.from(http), 'e.html').refusals.join('\n')).toMatch(/lien « http:\/\/www\.example\.org\/page/)
    const missing = googleHtml().replace(/<p class="c0 title"><span>Parrainage<\/span><\/p>\n<p class="c0"><span>Bloc factice E.<\/span><\/p>/, '')
    expect(convert(Buffer.from(missing), 'e.html').refusals.join('\n')).toMatch(/contenu « parrainage » absent/)
  })

  it('L108P-IMP-05 — contrôle de fidélité : un élément inconnu porteur de texte n’est jamais perdu en silence', () => {
    const odd = googleHtml().replace('<p class="c0"><span>Bloc factice D.</span></p>', '<p class="c0"><span>Bloc factice D.</span></p><aside>Mot factice perdu</aside>')
    const res = convert(Buffer.from(odd), 'e.html')
    expect(res.ok).toBe(false)
    expect(res.refusals.join('\n')).toMatch(/élément <aside>|CONTRÔLE DE FIDÉLITÉ/)
  })

  it('L108P-IMP-06 — comparaison de mots : insécables = blancs, rien d’autre n’est normalisé', () => {
    expect(words(`a${NBSP}b  c`)).toEqual(['a', 'b', 'c'])
    expect(textFingerprint('l’apostrophe')).not.toBe(textFingerprint("l'apostrophe"))
  })
})

describe('L108P-IMP — dépose dans le dépôt (procédure réelle du PO)', () => {
  const exportFile = (root: string, content: Buffer | string, name = 'export.html') => {
    const f = path.join(root, name)
    writeFileSync(f, content)
    return f
  }

  it('L108P-IMP-10 — essai à blanc : rien d’écrit ; --ecrire : 4 fragments + <article> de la version non figée ; rapport ; --verifier', () => {
    const root = makeLegalRoot({ withMarkers: true })
    const f = exportFile(root, googleHtml())
    const before = readFileSync(path.join(root, 'src/content/legal/cguv/versions/2026-10-30-v1.html'), 'utf8')
    const dry = runScript(root, 'legal-importer-textes.mjs', [f])
    expect(dry.code, dry.out).toBe(0)
    expect(dry.out).toMatch(/essai à blanc réussi/)
    expect(readFileSync(path.join(root, 'src/content/legal/parrainage.html'), 'utf8')).toContain(LEGAL_TEXT_MARKER)

    const w = runScript(root, 'legal-importer-textes.mjs', [f, '--ecrire'])
    expect(w.code, w.out).toBe(0)
    const sources = loadLegalSources(root)
    expect(sources.documents.filter((d) => d.source).every((d) => !d.pending)).toBe(true)
    const after = readFileSync(path.join(root, 'src/content/legal/cguv/versions/2026-10-30-v1.html'), 'utf8')
    expect(hasMarker(after)).toBe(false)
    // Seul l'intérieur de <article> a changé : gabarit (en-tête, méta de version) intact.
    expect(after.slice(0, after.indexOf('<article>'))).toBe(before.slice(0, before.indexOf('<article>')))
    expect(after.slice(after.indexOf('</article>'))).toBe(before.slice(before.indexOf('</article>')))
    expect(sources.versions.find((v) => v.code === '2026-10-30-v1')?.status).toBe('decision-a-fournir')
    const report = JSON.parse(readFileSync(path.join(root, IMPORT_REPORT_FILE), 'utf8'))
    expect(report.cibles.cguv).toMatchObject({ version: '2026-10-30-v1', fichier: 'src/content/legal/cguv/versions/2026-10-30-v1.html' })
    expect(runScript(root, 'legal-importer-textes.mjs', [f, '--verifier']).out).toMatch(/comparaison OK/)

    // Retouche à la main après l'import → détectée.
    const mp = path.join(root, 'src/content/legal/mentions-legales.html')
    writeFileSync(mp, readFileSync(mp, 'utf8').replace('Bloc factice A', 'Bloc retouché A'))
    expect(depositedFingerprint(readFileSync(mp, 'utf8'))).not.toBe(report.cibles['mentions-legales'].texteSha256)
    const v = runScript(root, 'legal-importer-textes.mjs', [f, '--verifier'])
    expect(v.code).toBe(1)
    expect(v.out).toMatch(/mentions-legales : DIFFÉRENT de l’export/)
    // Second dépôt refusé sans --remplacer (texte déjà en place).
    expect(runScript(root, 'legal-importer-textes.mjs', [f, '--ecrire']).out).toMatch(/déjà rempli/)
  })

  it('L108P-IMP-11 — export non fidèle ou version CGUV figée : REFUS, aucun fichier modifié', () => {
    const root = makeLegalRoot({ withMarkers: true })
    const bad = exportFile(root, googleHtml({ footnote: true }))
    const r1 = runScript(root, 'legal-importer-textes.mjs', [bad, '--ecrire'])
    expect(r1.code).toBe(1)
    expect(r1.out).toMatch(/REFUSÉ — rien n'a été écrit/)
    expect(existsSync(path.join(root, IMPORT_REPORT_FILE))).toBe(false)
    expect(readFileSync(path.join(root, 'src/content/legal/mentions-legales.html'), 'utf8')).toContain(LEGAL_TEXT_MARKER)

    const frozen = makeLegalRoot() // version 2026-10-30-v1 figée
    const r2 = runScript(frozen, 'legal-importer-textes.mjs', [exportFile(frozen, googleHtml()), '--ecrire', '--cguv-code', '2026-10-30-v1', '--remplacer'])
    expect(r2.code).toBe(1)
    expect(r2.out).toMatch(/déjà figée/)
  })
})

describe('L108P-IMP — état du dépôt', () => {
  it('L108P-IMP-20 — tout contenu déposé vient d’un import vérifié et n’a pas été retouché depuis', () => {
    const reportAbs = path.join(repo, IMPORT_REPORT_FILE)
    const report = existsSync(reportAbs) ? JSON.parse(readFileSync(reportAbs, 'utf8')) : { cibles: {} }
    const sources = loadLegalSources(repo)
    for (const d of sources.documents.filter((x) => x.source)) {
      if (d.pending) continue // encore « à fournir »
      const entry = report.cibles[d.key]
      expect(entry, `${d.source} rempli sans passer par legal:importer-textes`).toBeTruthy()
      expect({ f: d.source, sha: depositedFingerprint(d.raw) }).toEqual({ f: d.source, sha: entry.texteSha256 })
    }
    for (const v of sources.versions.filter((x) => x.meta.origin === 'site' && x.bytes && !hasMarker(x.text) && !x.locked)) {
      const entry = report.cibles.cguv
      expect(entry?.version, `${v.htmlRel} rempli sans passer par legal:importer-textes`).toBe(v.code)
      expect(depositedFingerprint(v.text)).toBe(entry.texteSha256)
    }
  })
})
