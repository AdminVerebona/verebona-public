/**
 * Import des textes juridiques depuis l'export du Google Doc du PO
 * (chantier 108P-L, ticket « livraison complète et vérifiable des
 * informations légales »).
 *
 * ══════════════════════════════════════════════════════════════════════════
 * CONVERSION DE FORME, JAMAIS DE FOND
 *
 * Entrées acceptées (export du Google Doc, sans retouche) :
 *   · « Fichier › Télécharger › Page Web (.html, compressé) » → `.zip` ou le
 *     `.html` qu'il contient ;
 *   · « Fichier › Télécharger › Microsoft Word (.docx) » → `.docx`.
 *
 * Le module transforme la STRUCTURE (titres, paragraphes, listes, tableaux,
 * gras / italique / souligné, liens) en fragments HTML simples conformes au
 * format de `src/content/legal/README.md`. Il ne touche JAMAIS au texte :
 * aucun mot ajouté, retiré, corrigé ou déplacé, aucune typographie modifiée
 * (espaces insécables, apostrophes, guillemets conservés tels quels).
 *
 * Contrôle de fidélité (bloquant) : la suite des mots du document source,
 * extraite INDÉPENDAMMENT du convertisseur (texte brut du DOM HTML / des
 * balises `w:t` du docx), doit être EXACTEMENT la suite des mots des
 * fragments produits (relus par un analyseur HTML). Seuls écarts admis, tous
 * listés dans le rapport : les titres de bloc retirés (le titre de la page
 * porte déjà le nom du contenu) et, si la configuration le demande, le
 * préambule avant le premier bloc. Le moindre écart → rien n'est écrit.
 *
 * Refus explicites (jamais de représentation inventée) : suivi des
 * modifications non accepté, notes de bas de page, images, liens non
 * HTTPS, en-têtes / pieds de page (sauf décision dans la configuration).
 * Les commentaires du document ne sont jamais importés (comptés au rapport).
 *
 * Découpage en cinq contenus : `src/content/legal/import/decoupage.json`
 * (titres de bloc → contenu). Les parties « 1/2 » et « 2/2 » d'un même
 * contenu sont mises bout à bout, dans l'ordre du document.
 * ══════════════════════════════════════════════════════════════════════════
 */
import { createHash } from 'node:crypto'
import { inflateRawSync } from 'node:zlib'
import { JSDOM } from 'jsdom'

export const IMPORT_CONFIG_FILE = 'src/content/legal/import/decoupage.json'
export const IMPORT_REPORT_FILE = 'src/content/legal/import/dernier-import.json'
export const IMPORT_REPORT_SCHEMA = 'verebona-legal-import-v1'
export const IMPORT_TARGETS = Object.freeze(['mentions-legales', 'cguv', 'confidentialite', 'sous-traitants', 'parrainage'])

export class ImportRefusal extends Error {
  constructor(messages) {
    super(messages.join('\n'))
    this.name = 'ImportRefusal'
    this.messages = messages
  }
}

const sha256 = (s) => createHash('sha256').update(s).digest('hex')

/* ── Texte : normalisation pour la comparaison (jamais pour l'écriture) ── */

/** Suite des mots d'un texte : NFC, séparation sur tout blanc (insécables compris). */
export function words(text) {
  return String(text).normalize('NFC').split(/\s+/u).filter(Boolean)
}

/** Empreinte du texte normalisé (mots séparés par une espace) — détecte toute retouche. */
export function textFingerprint(text) {
  return sha256(words(text).join(' '))
}

const BLOCK_TAGS = new Set(['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'TD', 'TH', 'TR', 'DIV', 'TABLE', 'UL', 'OL', 'BR', 'HR', 'SECTION', 'BLOCKQUOTE', 'DT', 'DD', 'ADDRESS', 'CAPTION'])

/**
 * Texte visible d'un nœud HTML : une espace à chaque frontière de bloc, rien
 * dans `<style>` / `<script>` ni dans les nœuds marqués « ignorés ».
 */
function domText(node, skip) {
  let out = ''
  const walk = (n) => {
    if (n.nodeType === 3) { out += n.nodeValue; return }
    if (n.nodeType !== 1) return
    if (skip && skip(n)) return
    const tag = n.tagName.toUpperCase()
    if (tag === 'STYLE' || tag === 'SCRIPT' || tag === 'HEAD' || tag === 'TITLE') return
    const block = BLOCK_TAGS.has(tag)
    if (block) out += ' '
    for (const c of n.childNodes) walk(c)
    if (block) out += ' '
  }
  walk(node)
  return out
}

/** Texte visible d'un fragment HTML produit (relu par un vrai analyseur HTML). */
export function fragmentText(html) {
  const dom = new JSDOM(`<!DOCTYPE html><body>${html}</body>`)
  return domText(dom.window.document.body)
}

/* ── Lecture d'une archive zip (sans dépendance) ───────────────────────── */

/** Entrées d'un zip : { nom → Buffer }. Méthodes 0 (stockée) et 8 (deflate). */
export function readZip(buf) {
  let eocd = -1
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65_557); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break }
  }
  if (eocd === -1) throw new ImportRefusal(['archive zip illisible (fin de répertoire introuvable)'])
  const count = buf.readUInt16LE(eocd + 10)
  let p = buf.readUInt32LE(eocd + 16)
  const out = new Map()
  for (let n = 0; n < count; n++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) throw new ImportRefusal(['archive zip illisible (répertoire central)'])
    const method = buf.readUInt16LE(p + 10)
    const csize = buf.readUInt32LE(p + 20)
    const nameLen = buf.readUInt16LE(p + 28)
    const extraLen = buf.readUInt16LE(p + 30)
    const commentLen = buf.readUInt16LE(p + 32)
    const local = buf.readUInt32LE(p + 42)
    const name = buf.subarray(p + 46, p + 46 + nameLen).toString('utf8')
    p += 46 + nameLen + extraLen + commentLen
    if (buf.readUInt32LE(local) !== 0x04034b50) throw new ImportRefusal([`archive zip illisible (${name})`])
    const start = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28)
    const data = buf.subarray(start, start + csize)
    if (name.endsWith('/')) continue
    if (method === 0) out.set(name, Buffer.from(data))
    else if (method === 8) out.set(name, inflateRawSync(data))
    else throw new ImportRefusal([`archive zip : méthode de compression ${method} non prise en charge (${name})`])
  }
  return out
}

/* ── Modèle commun ─────────────────────────────────────────────────────── */
// Bloc : { t: 'h', level (0 = titre du document, 1…6), inl, node }
//        { t: 'p', inl, node } · { t: 'li', ordered, depth, inl, node }
//        { t: 'table', rows: [[[Bloc]]], node } · { t: 'hr', node }
// Inline : { text, b, i, u, sup, sub, href } · { br: true }

const plain = (inl) => inl.map((x) => (x.br ? ' ' : x.text)).join('')

/* ── Export HTML du Google Doc ─────────────────────────────────────────── */

/** Styles des classes de l'export Google (`.c5{font-weight:700}` …). */
function classStyles(doc) {
  const map = new Map()
  for (const st of doc.querySelectorAll('style')) {
    for (const m of st.textContent.matchAll(/\.([A-Za-z0-9_-]+)\s*\{([^}]*)\}/g)) {
      const decl = m[2]
      const prev = map.get(m[1]) ?? {}
      map.set(m[1], {
        b: prev.b || /font-weight\s*:\s*(700|800|900|bold)/i.test(decl),
        i: prev.i || /font-style\s*:\s*italic/i.test(decl),
        u: prev.u || /text-decoration\s*:[^;]*underline/i.test(decl),
        sup: prev.sup || /vertical-align\s*:\s*super/i.test(decl),
        sub: prev.sub || /vertical-align\s*:\s*sub/i.test(decl),
      })
    }
  }
  return map
}

function styleOf(el, classes) {
  const s = { b: false, i: false, u: false, sup: false, sub: false }
  for (const c of el.classList ?? []) {
    const r = classes.get(c)
    if (r) for (const k of Object.keys(s)) s[k] = s[k] || r[k]
  }
  const inline = el.getAttribute?.('style') ?? ''
  if (/font-weight\s*:\s*(700|800|900|bold)/i.test(inline)) s.b = true
  if (/font-style\s*:\s*italic/i.test(inline)) s.i = true
  if (/text-decoration\s*:[^;]*underline/i.test(inline)) s.u = true
  if (/vertical-align\s*:\s*super/i.test(inline)) s.sup = true
  if (/vertical-align\s*:\s*sub/i.test(inline)) s.sub = true
  const tag = el.tagName
  if (tag === 'B' || tag === 'STRONG') s.b = true
  if (tag === 'I' || tag === 'EM') s.i = true
  if (tag === 'U') s.u = true
  if (tag === 'SUP') s.sup = true
  if (tag === 'SUB') s.sub = true
  return s
}

/** Lien réel d'un lien de l'export Google (`https://www.google.com/url?q=…`). */
export function unwrapGoogleHref(href) {
  const v = String(href ?? '').trim()
  try {
    const u = new URL(v)
    if (/^(www\.)?google\.[a-z.]+$/.test(u.hostname) && u.pathname === '/url' && u.searchParams.get('q')) return u.searchParams.get('q')
  } catch { /* relatif ou ancre */ }
  return v
}

const isCommentAnchor = (el) => el.tagName === 'A' && /^cmnt/.test(el.getAttribute('id') ?? '')
const isFootnoteAnchor = (el) => el.tagName === 'A' && /^ftnt/.test(el.getAttribute('id') ?? '')

/** Modèle d'un export HTML Google Docs. */
export function htmlExportToModel(html) {
  const dom = new JSDOM(html)
  const doc = dom.window.document
  const classes = classStyles(doc)
  const refusals = []
  const warnings = []
  const ignored = new Set()
  let comments = 0

  // Commentaires : ancre dans le texte + bloc en fin de document — jamais importés.
  for (const a of [...doc.querySelectorAll('a[id^="cmnt"]')]) {
    const id = a.getAttribute('id')
    if (/^cmnt_ref/.test(id)) { ignored.add(a.closest('sup') ?? a); comments++ }
    else { const box = a.closest('div') ?? a.closest('p') ?? a; ignored.add(box) }
  }
  if (doc.querySelector('a[id^="ftnt"]')) refusals.push('notes de bas de page présentes : non prises en charge — les intégrer au texte dans le Google Doc, ou demander une adaptation de l’outil')
  if (doc.querySelector('body img')) refusals.push('image(s) présente(s) dans le document : non prises en charge par la rubrique « Légal »')

  const body = doc.body
  const isIgnored = (n) => { for (let x = n; x && x !== body; x = x.parentNode) if (ignored.has(x)) return true; return false }

  const inlinesOf = (el, inherited = { b: false, i: false, u: false, sup: false, sub: false, href: null }) => {
    const out = []
    for (const c of el.childNodes) {
      if (c.nodeType === 3) { if (c.nodeValue) out.push({ text: c.nodeValue, ...inherited }); continue }
      if (c.nodeType !== 1 || ignored.has(c)) continue
      if (c.tagName === 'BR') { out.push({ br: true }); continue }
      if (isCommentAnchor(c) || isFootnoteAnchor(c)) continue
      const st = styleOf(c, classes)
      const next = {
        b: inherited.b || st.b, i: inherited.i || st.i, u: inherited.u || st.u, sup: inherited.sup || st.sup, sub: inherited.sub || st.sub, href: inherited.href,
      }
      if (c.tagName === 'A' && c.getAttribute('href')) {
        const target = unwrapGoogleHref(c.getAttribute('href'))
        if (target.startsWith('#')) warnings.push(`lien interne au document retiré (texte conservé) : « ${c.textContent.trim().slice(0, 60)} »`)
        else next.href = target
        next.u = inherited.u // le soulignement d'un lien est sa présentation, pas une mise en forme du texte
      }
      out.push(...inlinesOf(c, next))
    }
    return out
  }

  const headingLevel = (el) => {
    if (/^H[1-6]$/.test(el.tagName)) return Number(el.tagName[1])
    if (el.tagName === 'P' && el.classList.contains('title')) return 0
    if (el.tagName === 'P' && el.classList.contains('subtitle')) return 1.5
    return null
  }

  const blocksOf = (container, inCell = false) => {
    const out = []
    for (const el of container.children) {
      if (ignored.has(el)) continue
      const tag = el.tagName
      const lvl = headingLevel(el)
      if (lvl !== null) {
        if (lvl === 1.5) { out.push({ t: 'p', inl: inlinesOf(el), node: el, subtitle: true }); continue }
        out.push({ t: 'h', level: lvl, inl: inlinesOf(el), node: el })
      } else if (tag === 'P') out.push({ t: 'p', inl: inlinesOf(el), node: el })
      else if (tag === 'UL' || tag === 'OL') {
        const m = /lst-kix_[A-Za-z0-9]+-(\d+)/.exec(el.className)
        const depth = m ? Number(m[1]) : 0
        for (const li of el.children) if (li.tagName === 'LI') out.push({ t: 'li', ordered: tag === 'OL', depth, inl: inlinesOf(li), node: li })
      } else if (tag === 'TABLE') {
        const rows = []
        for (const tr of el.querySelectorAll('tr')) rows.push([...tr.children].filter((c) => c.tagName === 'TD' || c.tagName === 'TH').map((td) => blocksOf(td, true)))
        out.push({ t: 'table', rows, node: el })
      } else if (tag === 'HR') out.push({ t: 'hr', node: el })
      else if (tag === 'DIV') {
        if (inCell) { out.push(...blocksOf(el, true)); continue }
        const txt = domText(el, isIgnored).trim()
        if (txt) refusals.push(`contenu hors du corps du document (en-tête ou pied de page) : « ${txt.slice(0, 80)} » — décision « enTetesPiedsDePage » de la configuration`)
        out.push({ t: 'outside', text: txt, node: el })
      } else if (tag === 'STYLE' || tag === 'SCRIPT') continue
      else {
        const txt = domText(el, isIgnored).trim()
        if (txt) refusals.push(`élément <${tag.toLowerCase()}> non pris en charge : « ${txt.slice(0, 60)} »`)
      }
    }
    return out
  }

  const blocks = blocksOf(body)
  return {
    kind: 'html',
    blocks,
    refusals,
    warnings,
    comments,
    /** Texte source, extraction indépendante du convertisseur : tout le corps hors nœuds exclus. */
    sourceText: (excluded) => domText(body, (n) => isIgnored(n) || excluded.has(n)),
    /** Texte source d'un nœud (même extraction). */
    nodeText: (node) => domText(node, isIgnored),
  }
}

/* ── Export .docx ──────────────────────────────────────────────────────── */

const xml = (buf) => new JSDOM(buf.toString('utf8'), { contentType: 'application/xml' }).window.document
const W = (el, name) => [...el.childNodes].filter((c) => c.nodeType === 1 && c.nodeName === name)
const W1 = (el, name) => W(el, name)[0] ?? null
const attr = (el, name) => (el ? el.getAttribute(name) : null)
const on = (el) => !!el && !['0', 'false', 'none'].includes(String(attr(el, 'w:val') ?? 'true'))

/** Modèle d'un export .docx (Google Docs ou Word). */
export function docxToModel(buf) {
  const files = readZip(buf)
  const docXml = files.get('word/document.xml')
  if (!docXml) throw new ImportRefusal(['fichier .docx sans word/document.xml'])
  const doc = xml(docXml)
  const refusals = []
  const warnings = []

  // Styles : identifiant → niveau de titre (« heading 1 », « Title » ; Word FR : « Titre1 » nommé « heading 1 »).
  const styleLevel = new Map()
  if (files.get('word/styles.xml')) {
    for (const s of xml(files.get('word/styles.xml')).getElementsByTagName('w:style')) {
      const name = attr(W1(s, 'w:name'), 'w:val') ?? ''
      const id = attr(s, 'w:styleId')
      const h = /^heading\s*(\d)$/i.exec(name)
      if (h) styleLevel.set(id, Number(h[1]))
      else if (/^title$/i.test(name)) styleLevel.set(id, 0)
      else if (/^subtitle$/i.test(name)) styleLevel.set(id, 1.5)
    }
  }
  // Numérotation : numId → abstractNumId → niveau → format (bullet = puces).
  const numFormat = new Map()
  if (files.get('word/numbering.xml')) {
    const nd = xml(files.get('word/numbering.xml'))
    const abstract = new Map()
    for (const a of nd.getElementsByTagName('w:abstractNum')) {
      const lv = new Map()
      for (const l of W(a, 'w:lvl')) lv.set(attr(l, 'w:ilvl'), attr(W1(l, 'w:numFmt'), 'w:val'))
      abstract.set(attr(a, 'w:abstractNumId'), lv)
    }
    for (const n of nd.getElementsByTagName('w:num')) numFormat.set(attr(n, 'w:numId'), abstract.get(attr(W1(n, 'w:abstractNumId'), 'w:val')) ?? new Map())
  }
  // Liens externes : r:id → URL.
  const rels = new Map()
  if (files.get('word/_rels/document.xml.rels')) {
    for (const r of xml(files.get('word/_rels/document.xml.rels')).getElementsByTagName('Relationship')) rels.set(r.getAttribute('Id'), r.getAttribute('Target'))
  }

  const all = (name) => doc.getElementsByTagName(name).length
  if (all('w:ins') || all('w:del') || all('w:moveFrom') || all('w:moveTo')) refusals.push('suivi des modifications présent : accepter ou refuser toutes les modifications dans le document, puis réexporter')
  if (all('w:footnoteReference') || all('w:endnoteReference')) refusals.push('notes de bas de page présentes : non prises en charge — les intégrer au texte, ou demander une adaptation de l’outil')
  if (all('w:drawing') || all('w:pict') || all('w:object')) refusals.push('image(s) ou objet(s) présent(s) : non pris en charge par la rubrique « Légal »')
  const comments = all('w:commentReference')

  const runsOf = (p) => {
    const out = []
    let field = null // { instr, href, phase }
    const visit = (node, href) => {
      for (const c of node.childNodes) {
        if (c.nodeType !== 1) continue
        const n = c.nodeName
        if (n === 'w:hyperlink') {
          const id = attr(c, 'r:id')
          const target = id ? rels.get(id) : null
          if (!target && attr(c, 'w:anchor')) warnings.push('lien interne au document retiré (texte conservé)')
          visit(c, target ?? href)
        } else if (n === 'w:r') {
          const pr = W1(c, 'w:rPr')
          const st = {
            b: on(pr && W1(pr, 'w:b')), i: on(pr && W1(pr, 'w:i')), u: on(pr && W1(pr, 'w:u')),
            sup: attr(pr && W1(pr, 'w:vertAlign'), 'w:val') === 'superscript', sub: attr(pr && W1(pr, 'w:vertAlign'), 'w:val') === 'subscript',
          }
          for (const k of c.childNodes) {
            if (k.nodeType !== 1) continue
            if (k.nodeName === 'w:fldChar') {
              const t = attr(k, 'w:fldCharType')
              if (t === 'begin') field = { instr: '', href: null }
              else if (t === 'separate' && field) { const m = /HYPERLINK\s+"([^"]+)"/.exec(field.instr); field.href = m ? m[1] : null }
              else if (t === 'end') field = null
            } else if (k.nodeName === 'w:instrText') { if (field) field.instr += k.textContent }
            else if (k.nodeName === 'w:t') out.push({ text: k.textContent, ...st, href: field?.href ?? href ?? null, u: (field?.href ?? href) ? false : st.u })
            else if (k.nodeName === 'w:tab') out.push({ text: '\t', ...st, href: field?.href ?? href ?? null })
            else if (k.nodeName === 'w:br' || k.nodeName === 'w:cr') { if (attr(k, 'w:type') !== 'page') out.push({ br: true }) }
            else if (k.nodeName === 'w:noBreakHyphen') out.push({ text: '‑', ...st, href: href ?? null })
          }
        } else if (n === 'w:smartTag' || n === 'w:customXml' || n === 'w:sdt' || n === 'w:sdtContent' || n === 'w:fldSimple') visit(c, href)
      }
    }
    visit(p, null)
    return out
  }

  const blocksOf = (container) => {
    const out = []
    for (const el of container.childNodes) {
      if (el.nodeType !== 1) continue
      const n = el.nodeName
      if (n === 'w:p') {
        const pr = W1(el, 'w:pPr')
        const styleId = attr(pr && W1(pr, 'w:pStyle'), 'w:val')
        const lvl = styleId != null && styleLevel.has(styleId) ? styleLevel.get(styleId) : null
        const numPr = pr && W1(pr, 'w:numPr')
        const inl = runsOf(el)
        if (lvl !== null && lvl !== 1.5) out.push({ t: 'h', level: lvl, inl, node: el })
        else if (numPr && attr(W1(numPr, 'w:numId'), 'w:val') !== '0') {
          const numId = attr(W1(numPr, 'w:numId'), 'w:val')
          const ilvl = attr(W1(numPr, 'w:ilvl'), 'w:val') ?? '0'
          const fmt = numFormat.get(numId)?.get(ilvl) ?? 'bullet'
          out.push({ t: 'li', ordered: fmt !== 'bullet' && fmt !== 'none', depth: Number(ilvl) || 0, inl, node: el })
        } else out.push({ t: 'p', inl, node: el, subtitle: lvl === 1.5 })
      } else if (n === 'w:tbl') {
        const rows = W(el, 'w:tr').map((tr) => W(tr, 'w:tc').map((tc) => blocksOf(tc)))
        out.push({ t: 'table', rows, node: el })
      } else if (n === 'w:sdt') {
        const c = W1(el, 'w:sdtContent')
        if (c) out.push(...blocksOf(c))
      }
    }
    return out
  }
  const body = doc.getElementsByTagName('w:body')[0]
  const blocks = blocksOf(body)

  /** Texte source : toutes les balises w:t, extraction indépendante du convertisseur. */
  const textOf = (root, excluded) => {
    let s = ''
    const walk = (n) => {
      if (n.nodeType !== 1) return
      if (excluded.has(n)) return
      const name = n.nodeName
      if (name === 'w:t') { s += n.textContent; return }
      if (name === 'w:tab' || name === 'w:br' || name === 'w:cr') { s += ' '; return }
      if (name === 'w:instrText' || name === 'w:delText') return
      const block = name === 'w:p' || name === 'w:tc' || name === 'w:tr'
      if (block) s += ' '
      for (const c of n.childNodes) walk(c)
      if (block) s += ' '
    }
    walk(root)
    return s
  }
  const none = new Set()
  return { kind: 'docx', blocks, refusals, warnings, comments, sourceText: (excluded) => textOf(body, excluded), nodeText: (node) => textOf(node, none) }
}


/* ── Corpus Markdown (texte fourni par le PO, 108P-L) ──────────────────── */

/**
 * Texte d'une ligne Markdown, extraction INDÉPENDANTE du convertisseur :
 * marques de syntaxe retirées (titres `#`, puces, `**`, `*`, filets `---`,
 * liens `[texte](url)` → texte), tout le reste gardé tel quel.
 */
export function markdownLineText(line) {
  if (/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line)) return ''
  const heading = /^\s{0,3}#{1,6}\s+/.test(line)
  return (heading ? line.replace(/^\s{0,3}#{1,6}\s+/, '').replace(/\s+#+\s*$/, '') : line.replace(/^\s*(?:[-*+]|\d+[.)])\s+/, ''))
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\*\*|__/g, '')
    .replace(/(^|[^\p{L}\p{N}])\*(?=\S)|(?<=\S)\*(?=$|[^\p{L}\p{N}])/gu, '$1')
    .replace(/\\$/, '')
}

/** Inlines d'un texte Markdown (gras `**`, italique `*`, liens `[t](u)`). */
function markdownInlines(text) {
  const out = []
  const re = /\*\*([\s\S]+?)\*\*|\[([^\]]*)\]\(([^)\s]+)\)|(?<![\p{L}\p{N}*])\*(?=\S)([\s\S]+?)(?<=\S)\*(?![\p{L}\p{N}*])/gu
  let last = 0
  const base = { b: false, i: false, u: false, sup: false, sub: false, href: null }
  for (const m of text.matchAll(re)) {
    if (m.index > last) out.push({ text: text.slice(last, m.index), ...base })
    if (m[1] !== undefined) out.push(...markdownInlines(m[1]).map((x) => (x.br ? x : { ...x, b: true })))
    else if (m[2] !== undefined) out.push({ text: m[2], ...base, href: m[3] })
    else out.push(...markdownInlines(m[4]).map((x) => (x.br ? x : { ...x, i: true })))
    last = m.index + m[0].length
  }
  if (last < text.length) out.push({ text: text.slice(last), ...base })
  return out
}

/** Lignes d'un bloc → inlines, saut de ligne « deux espaces » (ou `\`) → <br>. */
function markdownParagraph(lines) {
  const inl = []
  lines.forEach((l, i) => {
    const hard = /( {2,}|\\)$/.test(l)
    const text = l.replace(/\\$/, '').replace(/\s+$/, '').replace(/^\s+/, '')
    inl.push(...markdownInlines(text))
    if (i < lines.length - 1) inl.push(hard ? { br: true } : { text: ' ', b: false, i: false, u: false, sup: false, sub: false, href: null })
  })
  return inl
}

/** Modèle d'un corpus Markdown (titres, paragraphes, sauts de ligne, listes, filets). */
export function markdownToModel(source) {
  const text = String(source).replace(/^﻿/, '').replace(/\r\n?/g, '\n')
  const lines = text.split('\n')
  const refusals = []
  const blocks = []
  let para = null
  let li = null
  const flushPara = () => { if (para) { blocks.push({ t: 'p', inl: markdownParagraph(para.lines), node: { from: para.from, to: para.to } }); para = null } }
  const flushLi = () => { if (li) { blocks.push({ t: 'li', ordered: li.ordered, depth: li.depth, inl: markdownParagraph(li.lines), node: { from: li.from, to: li.to } }); li = null } }
  lines.forEach((line, n) => {
    if (!line.trim()) { flushPara(); flushLi(); return }
    if (/^\s{0,3}(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line)) { flushPara(); flushLi(); blocks.push({ t: 'hr', node: { from: n, to: n } }); return }
    const h = /^\s{0,3}(#{1,6})\s+(.*?)\s*#*\s*$/.exec(line)
    if (h) { flushPara(); flushLi(); blocks.push({ t: 'h', level: h[1].length, inl: markdownInlines(h[2]), node: { from: n, to: n } }); return }
    const item = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/.exec(line)
    if (item) {
      flushPara(); flushLi()
      li = { ordered: /\d/.test(item[2]), depth: Math.floor(item[1].replace(/\t/g, '  ').length / 2), lines: [item[3]], from: n, to: n }
      return
    }
    if (li && /^\s+\S/.test(line)) { li.lines.push(line); li.to = n; return }
    flushLi()
    if (/^\s*(?:<|```|>|\|)/.test(line)) refusals.push(`ligne ${n + 1} : syntaxe Markdown non prise en charge (HTML, code, citation ou tableau) — « ${line.trim().slice(0, 60)} »`)
    if (!para) para = { lines: [], from: n, to: n }
    para.lines.push(line)
    para.to = n
  })
  flushPara(); flushLi()
  const rangeText = (from, to) => lines.slice(from, to + 1).map(markdownLineText).join(' ')
  return {
    kind: 'markdown',
    blocks,
    refusals,
    warnings: [],
    comments: 0,
    sourceText: (excluded) => {
      const skip = new Set()
      for (const r of excluded) if (r && typeof r.from === 'number') for (let i = r.from; i <= r.to; i++) skip.add(i)
      return lines.map((l, i) => (skip.has(i) ? '' : markdownLineText(l))).join(' ')
    },
    nodeText: (node) => rangeText(node.from, node.to),
  }
}

/** Lit un export (.html, .zip « Page Web », .docx) et en donne le modèle. */
export function readExport(buf, fileName) {
  const lower = String(fileName).toLowerCase()
  if (lower.endsWith('.docx')) return docxToModel(buf)
  if (lower.endsWith('.md') || lower.endsWith('.markdown')) return markdownToModel(buf.toString('utf8'))
  if (lower.endsWith('.zip')) {
    const files = readZip(buf)
    const htmls = [...files.keys()].filter((k) => /\.html?$/i.test(k))
    if (htmls.length !== 1) throw new ImportRefusal([`archive .zip : un seul fichier .html attendu (trouvé : ${htmls.join(', ') || 'aucun'})`])
    const m = htmlExportToModel(files.get(htmls[0]).toString('utf8'))
    if ([...files.keys()].some((k) => /\.(png|jpe?g|gif|svg|webp)$/i.test(k))) m.refusals.push('image(s) dans l’archive : non prises en charge par la rubrique « Légal »')
    return m
  }
  if (lower.endsWith('.html') || lower.endsWith('.htm')) return htmlExportToModel(buf.toString('utf8'))
  throw new ImportRefusal([`format non reconnu (${fileName}) : .md, .docx, .zip (« Page Web ») ou .html attendu`])
}

/* ── Découpage en contenus ─────────────────────────────────────────────── */

/** Configuration de découpage (valeurs par défaut documentées). */
export function normalizeConfig(raw, kind = null) {
  // Réglages propres à un format (ex. « markdown ») prioritaires sur les réglages communs.
  const c = { ...(raw ?? {}), ...((kind && raw?.[kind] && typeof raw[kind] === 'object') ? raw[kind] : {}) }
  const rules = Array.isArray(c.blocs) ? c.blocs : []
  const errors = []
  for (const r of rules) {
    if (!IMPORT_TARGETS.includes(r.cible)) errors.push(`decoupage.json : cible « ${r.cible} » inconnue (${IMPORT_TARGETS.join(', ')})`)
    try { new RegExp(r.titre, 'iu') } catch { errors.push(`decoupage.json : expression « ${r.titre} » invalide`) }
  }
  if (!['retirer', 'conserver'].includes(c.titreDeBloc ?? 'retirer')) errors.push('decoupage.json : titreDeBloc = « retirer » ou « conserver »')
  if (!['refuser', 'ignorer'].includes(c.preambule ?? 'refuser')) errors.push('decoupage.json : preambule = « refuser » ou « ignorer »')
  if (!['refuser', 'ignorer'].includes(c.enTetesPiedsDePage ?? 'refuser')) errors.push('decoupage.json : enTetesPiedsDePage = « refuser » ou « ignorer »')
  if (errors.length) throw new ImportRefusal(errors)
  return {
    niveauBloc: c.niveauBloc ?? 'auto',
    titreDeBloc: c.titreDeBloc ?? 'retirer',
    preambule: c.preambule ?? 'refuser',
    enTetesPiedsDePage: c.enTetesPiedsDePage ?? 'refuser',
    blocs: rules.map((r) => ({ cible: r.cible, titre: r.titre, re: new RegExp(r.titre, 'iu') })),
  }
}

const LEVEL_NAMES = { titre: 0, h1: 1, h2: 2, h3: 3, h4: 4 }

/**
 * Découpe le modèle : un bloc commence à chaque titre du niveau de bloc ; son
 * titre désigne le contenu (règles de la configuration).
 */
export function segment(model, config) {
  const refusals = [...model.refusals]
  const warnings = [...model.warnings]
  const removed = new Set()
  const ignoredText = []

  // En-têtes / pieds de page de l'export HTML (div hors corps).
  const blocks = []
  for (const b of model.blocks) {
    if (b.t !== 'outside') { blocks.push(b); continue }
    if (config.enTetesPiedsDePage === 'ignorer') { removed.add(b.node); if (b.text) ignoredText.push(`en-tête / pied de page : ${b.text}`) }
  }
  if (config.enTetesPiedsDePage === 'ignorer') {
    for (let i = refusals.length - 1; i >= 0; i--) if (/hors du corps du document/.test(refusals[i])) refusals.splice(i, 1)
  }

  const levels = blocks.filter((b) => b.t === 'h' && plain(b.inl).trim()).map((b) => b.level)
  if (levels.length === 0) throw new ImportRefusal([...refusals, 'aucun titre dans le document : découpage en contenus impossible'])
  const boundary = config.niveauBloc === 'auto' ? Math.min(...levels) : LEVEL_NAMES[config.niveauBloc]
  if (boundary === undefined) throw new ImportRefusal(['decoupage.json : niveauBloc = « auto », « titre », « h1 », « h2 »…'])

  const sections = []
  let cur = null
  const preamble = []
  for (const b of blocks) {
    if (b.t === 'h' && b.level === boundary && plain(b.inl).trim()) {
      const title = plain(b.inl).replace(/\s+/gu, ' ').trim()
      const rule = config.blocs.find((r) => r.re.test(title.normalize('NFC')))
      cur = { title, cible: rule?.cible ?? null, head: b, body: [] }
      if (!rule) refusals.push(`bloc « ${title} » : aucun contenu ne correspond (règles « blocs » de ${IMPORT_CONFIG_FILE})`)
      sections.push(cur)
      continue
    }
    if (cur) cur.body.push(b)
    else preamble.push(b)
  }
  const preambleText = preamble.map((b) => blockText(b)).join(' ').trim()
  if (preambleText) {
    if (config.preambule === 'ignorer') {
      for (const b of preamble) removed.add(b.node)
      ignoredText.push(`préambule (avant le premier bloc) : ${preambleText}`)
    } else refusals.push(`texte avant le premier bloc : « ${preambleText.slice(0, 120)} » — à décider (« preambule » de la configuration)`)
  } else for (const b of preamble) removed.add(b.node)

  // Filets de séparation en tête ou en fin de bloc : séparateurs du document, pas du texte (aucun mot).
  for (const s of sections) {
    while (s.body.length && s.body[0].t === 'hr') removed.add(s.body.shift().node)
    while (s.body.length && s.body[s.body.length - 1].t === 'hr') removed.add(s.body.pop().node)
  }

  const byTarget = new Map()
  let last = null
  for (const s of sections) {
    if (!s.cible) continue
    if (byTarget.has(s.cible) && last !== s.cible) warnings.push(`contenu « ${s.cible} » en plusieurs blocs non consécutifs : mis bout à bout dans l’ordre du document`)
    if (!byTarget.has(s.cible)) byTarget.set(s.cible, { cible: s.cible, titles: [], blocks: [] })
    const t = byTarget.get(s.cible)
    t.titles.push(s.title)
    if (config.titreDeBloc === 'retirer') removed.add(s.head.node)
    else t.blocks.push({ ...s.head, keepAsH2: true })
    t.blocks.push(...s.body)
    last = s.cible
  }
  return { boundary, sections, targets: byTarget, refusals, warnings, removed, ignoredText }
}

function blockText(b) {
  if (b.t === 'table') return b.rows.map((r) => r.map((c) => c.map(blockText).join(' ')).join(' ')).join(' ')
  if (b.t === 'hr' || b.t === 'outside') return b.text ?? ''
  return plain(b.inl)
}

/* ── Rendu des fragments ───────────────────────────────────────────────── */

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const escAttr = (s) => esc(s).replace(/"/g, '&quot;')

/** Inlines → HTML (suites de même mise en forme fusionnées ; blancs collés comme en HTML). */
export function renderInlines(inl) {
  const parts = []
  for (const x of inl) {
    if (x.br) { parts.push({ br: true }); continue }
    const text = x.text.replace(/[\t\r\n]+/g, ' ')
    const prev = parts[parts.length - 1]
    if (prev && !prev.br && prev.b === x.b && prev.i === x.i && prev.u === x.u && prev.sup === x.sup && prev.sub === x.sub && prev.href === x.href) prev.text += text
    else parts.push({ ...x, text })
  }
  let out = parts.map((p) => {
    if (p.br) return '<br>'
    if (!p.text.trim()) return esc(p.text)
    // Blancs de bord hors des balises (« <strong> mot</strong> » → « <strong>mot</strong> » précédé d'une espace).
    const lead = /^\s*/.exec(p.text)[0]
    const trail = /\s*$/.exec(p.text)[0]
    let h = esc(p.text.slice(lead.length, p.text.length - trail.length))
    if (p.sup) h = `<sup>${h}</sup>`
    if (p.sub) h = `<sub>${h}</sub>`
    if (p.u && !p.href) h = `<u>${h}</u>` // soulignement d'un lien = présentation du lien
    if (p.i) h = `<em>${h}</em>`
    if (p.b) h = `<strong>${h}</strong>`
    if (p.href) h = `<a href="${escAttr(p.href)}">${h}</a>`
    return `${lead}${h}${trail}`
  }).join('')
  out = out.replace(/ {2,}/g, ' ').replace(/^(\s|<br>)+|(\s|<br>)+$/g, '')
  return out
}

/** Blocs d'un contenu → fragment HTML. `headingBase` : niveau source du bloc. */
export function renderBlocks(blocks, boundary, { keepTitles = false } = {}) {
  const out = []
  const shift = keepTitles ? 1 : 0
  const hLevel = (lvl) => Math.min(5, Math.max(2, 2 + shift + (lvl - boundary - 1)))
  let i = 0
  const renderList = (start) => {
    // Listes imbriquées selon la profondeur ; changement de type au même niveau = nouvelle liste.
    const stack = []
    let j = start
    let html = ''
    const close = () => { html += `</li>\n</${stack.pop()}>` }
    while (j < blocks.length && blocks[j].t === 'li') {
      const li = blocks[j]
      const tag = li.ordered ? 'ol' : 'ul'
      while (stack.length > li.depth + 1) close()
      if (stack.length === li.depth + 1 && stack[stack.length - 1] !== tag) { close(); html += '\n' }
      if (stack.length === li.depth + 1) html += '</li>\n'
      while (stack.length < li.depth + 1) { html += `${stack.length ? '\n' : ''}<${tag}>\n`; stack.push(tag) }
      html += `<li>${renderInlines(li.inl)}`
      j++
    }
    while (stack.length) close()
    return { html, next: j }
  }
  while (i < blocks.length) {
    const b = blocks[i]
    if (b.t === 'li') { const r = renderList(i); out.push(r.html); i = r.next; continue }
    if (b.t === 'h') {
      const inner = renderInlines(b.inl)
      if (inner) out.push(b.keepAsH2 ? `<h2>${inner}</h2>` : `<h${hLevel(b.level)}>${inner}</h${hLevel(b.level)}>`)
    } else if (b.t === 'p') {
      const inner = renderInlines(b.inl)
      if (inner) out.push(`<p>${inner}</p>`)
    } else if (b.t === 'hr') out.push('<hr>')
    else if (b.t === 'table') {
      const rows = b.rows.map((r) => `<tr>${r.map((cell) => `<td>${renderBlocks(cell, boundary).trim()}</td>`).join('')}</tr>`)
      out.push(`<table>\n<tbody>\n${rows.join('\n')}\n</tbody>\n</table>`)
    }
    i++
  }
  return out.join('\n') + (out.length ? '\n' : '')
}

/* ── Conversion complète + contrôle de fidélité ────────────────────────── */

/**
 * Convertit un export et contrôle sa fidélité. Ne lève que `ImportRefusal`.
 * Résultat : { fragments: { cible → html }, report, ok }.
 */
export function convertExport(buf, fileName, rawConfig, { checkFragment, targets = IMPORT_TARGETS } = {}) {
  const model = readExport(buf, fileName)
  const config = normalizeConfig(rawConfig, model.kind)
  const seg = segment(model, config)
  const refusals = [...seg.refusals]
  const fragments = {}
  for (const cible of targets) {
    const t = seg.targets.get(cible)
    if (!t) { refusals.push(`contenu « ${cible} » absent du document (aucun bloc correspondant)`); continue }
    fragments[cible] = renderBlocks(t.blocks, seg.boundary, { keepTitles: config.titreDeBloc === 'conserver' })
    if (!fragments[cible].trim()) refusals.push(`contenu « ${cible} » vide`)
    if (checkFragment) refusals.push(...checkFragment(fragments[cible], cible))
  }
  for (const t of seg.targets.keys()) {
    if (!targets.includes(t)) {
      // Contenu présent mais non demandé (--cibles) : ses titres restent dans la comparaison.
      for (const s of seg.sections.filter((x) => x.cible === t)) {
        for (const b of [s.head, ...s.body]) seg.removed.add(b.node)
      }
    }
  }

  // Fidélité, contenu par contenu : texte source des nœuds du contenu (extraction
  // indépendante du convertisseur) == texte relu du fragment produit.
  const fidelity = { ok: true, parContenu: {} }
  const covered = new Set()
  for (const cible of Object.keys(fragments)) {
    const t = seg.targets.get(cible)
    const nodes = t.blocks.map((b) => b.node)
    for (const n of nodes) covered.add(n)
    const src = words(nodes.map((n) => model.nodeText(n)).join(' '))
    const dst = words(fragmentText(fragments[cible]))
    const r = { mots: src.length, ok: true }
    if (src.length !== dst.length || src.some((w, i) => w !== dst[i])) {
      let k = 0
      while (k < src.length && k < dst.length && src[k] === dst[k]) k++
      Object.assign(r, { ok: false, motsProduits: dst.length, auMot: k + 1, source: src.slice(Math.max(0, k - 8), k + 8).join(' '), produit: dst.slice(Math.max(0, k - 8), k + 8).join(' ') })
      fidelity.ok = false
      refusals.push(`CONTRÔLE DE FIDÉLITÉ « ${cible} » : texte produit différent du document au mot ${k + 1} — source « …${r.source}… » / produit « …${r.produit}… »`)
    }
    fidelity.parContenu[cible] = r
  }
  // Couverture : aucun mot du document hors des contenus produits, sauf ce qui
  // est explicitement retiré (titres de bloc, préambule / en-têtes décidés).
  const leftover = words(model.sourceText(new Set([...seg.removed, ...covered])))
  if (leftover.length) {
    fidelity.ok = false
    fidelity.motsNonRepris = leftover.length
    refusals.push(`CONTRÔLE DE FIDÉLITÉ : ${leftover.length} mot(s) du document repris dans aucun contenu — « ${leftover.slice(0, 16).join(' ')}… »`)
  }
  const order = seg.sections.map((s) => s.cible).filter((c, i, a) => c && fragments[c] !== undefined && a.indexOf(c) === i)

  const report = {
    schema: IMPORT_REPORT_SCHEMA,
    source: { fichier: String(fileName).split(/[\\/]/).pop(), format: model.kind, sha256: createHash('sha256').update(buf).digest('hex'), octets: buf.length },
    niveauBloc: seg.boundary,
    titreDeBloc: config.titreDeBloc,
    blocs: seg.sections.map((s) => ({ titre: s.title, cible: s.cible })),
    cibles: Object.fromEntries(order.map((c) => [c, {
      blocsSource: seg.targets.get(c).titles,
      mots: words(fragmentText(fragments[c])).length,
      texteSha256: textFingerprint(fragmentText(fragments[c])),
    }])),
    fidelite: fidelity,
    commentairesIgnores: model.comments,
    texteIgnore: seg.ignoredText,
    avertissements: [...new Set(seg.warnings)],
  }
  return { ok: refusals.length === 0, refusals: [...new Set(refusals)], fragments, report }
}

/** Empreinte du texte visible d'un contenu tel qu'il est dans le dépôt (fragment ou `<article>` d'une version). */
export function depositedFingerprint(raw) {
  const s = String(raw)
  const article = /<article\b[^>]*>([\s\S]*?)<\/article>/i.exec(s)
  return textFingerprint(fragmentText(article ? article[1] : s))
}
