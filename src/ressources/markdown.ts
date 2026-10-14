/**
 * Corps des articles Ressources — Markdown restreint (CDC Ressources V6 §10).
 *
 * Un bloc par paragraphe, séparé d'une ligne vide :
 *
 *   ## Intertitre                    → section H2 (ancre stable)
 *   Texte, **gras**, [lien](/x)      → paragraphe
 *   - élément                        → liste (lignes consécutives)
 *   | a | b |  (en-tête, ---, lignes) → tableau
 *
 * Intertitres RÉSERVÉS, qui portent les champs du modèle §10 :
 *   ## Checklist pratique   → `checklist` (une liste)
 *   ## Exemple concret      → `example` (présenté comme illustratif, ED-04 ;
 *                             facultatif depuis la V7 : C01, E02, O03 n'en ont pas)
 *   ## Questions fréquentes → `faq` (« **Question ?** » puis la réponse)
 *   ## Et avec Verebona ?   → `cta` (transition produit, une seule)
 *   ## Sources et références utiles → `sources` (« - [Titre](https://…) »),
 *                             intitulé de la révision éditoriale V7 (lot 54)
 * Le texte avant le premier intertitre est l'introduction (`intro`, ED-01).
 *
 * Aucun HTML n'est accepté (ADM-09, SEC-03) : une balise est une erreur de
 * build, et le rendu passe par des composants Vue, jamais par `v-html`.
 */
import { parseInlines, slugifyAnchor } from '../help/markdown'
import type { Inline, RessourceBlock, RessourceFaq, RessourceSection, RessourceSource } from './types'

export const RESERVED = {
  checklist: 'Checklist pratique',
  example: 'Exemple concret',
  faq: 'Questions fréquentes',
  cta: 'Et avec Verebona ?',
  sources: 'Sources et références utiles',
} as const

export interface ParsedRessourceBody {
  intro: RessourceBlock[]
  sections: RessourceSection[]
  checklist: Inline[][]
  example: RessourceBlock[]
  faq: RessourceFaq[]
  cta: RessourceBlock[]
  sources: RessourceSource[]
  errors: string[]
}

const HEADING = /^## (.+)$/
/** Balise HTML, commentaire ou entité de script : refusés (ADM-09). */
const HTML = /<\s*[a-zA-Z!/]|javascript:/i
const QUESTION = /^\*\*(.+\?)\*\*$/
const SOURCE = /^- \[(.+)\]\((\S+)\)$/

function parseTable(lines: string[], errors: string[]): RessourceBlock | null {
  const cells = (l: string) => l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim().replace(/\*\*(.+?)\*\*/g, '$1'))
  if (lines.length < 3 || !/^\|(\s*:?-{3,}:?\s*\|)+$/.test(lines[1].replace(/\s/g, ''))) {
    errors.push(`Tableau mal formé : « ${lines[0].slice(0, 60)} » (en-tête, ligne « --- », puis lignes).`)
    return null
  }
  const head = cells(lines[0])
  const rows = lines.slice(2).map(cells)
  rows.forEach((r, i) => {
    if (r.length !== head.length) errors.push(`Tableau : la ligne ${i + 1} a ${r.length} cellule(s) au lieu de ${head.length}.`)
  })
  return { kind: 'table', head, rows }
}

/** Découpe un texte en blocs (paragraphes, listes, tableaux). */
export function parseBlocks(chunks: string[], errors: string[]): RessourceBlock[] {
  const blocks: RessourceBlock[] = []
  for (const chunk of chunks) {
    const lines = chunk.split('\n').map((l) => l.trimEnd())
    if (lines.every((l) => l.startsWith('|'))) {
      const t = parseTable(lines, errors)
      if (t) blocks.push(t)
      continue
    }
    if (lines[0].startsWith('- ')) {
      const bad = lines.find((l) => !l.startsWith('- '))
      if (bad) errors.push(`Liste interrompue : « ${bad.slice(0, 60)} ».`)
      blocks.push({ kind: 'list', items: lines.filter((l) => l.startsWith('- ')).map((l) => parseInlines(l.slice(2).trim())) })
      continue
    }
    if (/^#/.test(lines[0])) {
      errors.push(`Seuls les intertitres « ## » sont autorisés : « ${lines[0].slice(0, 60)} ».`)
      continue
    }
    if (/^>|^\d+\. /.test(lines[0])) {
      errors.push(`Forme non prise en charge (citation, liste numérotée) : « ${lines[0].slice(0, 60)} ».`)
      continue
    }
    blocks.push({ kind: 'paragraph', inlines: parseInlines(lines.join(' ').replace(/\s+/g, ' ').trim()) })
  }
  return blocks
}

const domainOf = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

export function parseRessourceBody(body: string): ParsedRessourceBody {
  const errors: string[] = []
  const text = body.replace(/\r\n/g, '\n')
  const m = HTML.exec(text)
  if (m) {
    const line = text.slice(0, m.index).split('\n').length
    errors.push(`HTML ou script interdit dans un article (ligne ${line} du corps) : « ${text.slice(m.index, m.index + 40)} ».`)
  }

  // Groupes : introduction, puis un groupe par intertitre.
  const groups: Array<{ heading: string | null; chunks: string[] }> = [{ heading: null, chunks: [] }]
  for (const chunk of text.split(/\n{2,}/).map((c) => c.trim()).filter(Boolean)) {
    const lines = chunk.split('\n')
    const h = HEADING.exec(lines[0])
    if (h) {
      groups.push({ heading: h[1].trim(), chunks: [] })
      if (lines.length > 1) groups[groups.length - 1].chunks.push(lines.slice(1).join('\n'))
      continue
    }
    groups[groups.length - 1].chunks.push(chunk)
  }

  const out: ParsedRessourceBody = { intro: [], sections: [], checklist: [], example: [], faq: [], cta: [], sources: [], errors }
  const seen = new Set<string>()
  const anchors = new Set<string>()
  const reservedNames = new Set<string>(Object.values(RESERVED))

  for (const g of groups) {
    if (g.heading === null) {
      out.intro = parseBlocks(g.chunks, errors)
      continue
    }
    if (seen.has(g.heading)) errors.push(`Intertitre en double sur la page : « ${g.heading} » (H2 uniques, §10).`)
    seen.add(g.heading)

    switch (g.heading) {
      case RESERVED.checklist: {
        const blocks = parseBlocks(g.chunks, errors)
        if (blocks.length !== 1 || blocks[0].kind !== 'list') errors.push('« Checklist pratique » doit contenir une seule liste.')
        else out.checklist = blocks[0].items
        break
      }
      case RESERVED.example:
        out.example = parseBlocks(g.chunks, errors)
        break
      case RESERVED.cta:
        out.cta = parseBlocks(g.chunks, errors)
        if (out.cta.some((b) => b.kind !== 'paragraph')) errors.push('« Et avec Verebona ? » : paragraphes seulement.')
        break
      case RESERVED.faq: {
        let current: { question: string; chunks: string[] } | null = null
        const flush = () => { if (current) out.faq.push({ question: current.question, answer: parseBlocks(current.chunks, errors) }) }
        for (const c of g.chunks) {
          const q = QUESTION.exec(c)
          if (q) { flush(); current = { question: q[1].trim(), chunks: [] }; continue }
          if (!current) { errors.push(`FAQ : réponse sans question : « ${c.slice(0, 60)} ».`); continue }
          current.chunks.push(c)
        }
        flush()
        for (const f of out.faq) if (f.answer.length === 0) errors.push(`FAQ : question sans réponse : « ${f.question} ».`)
        break
      }
      case RESERVED.sources: {
        for (const line of g.chunks.join('\n').split('\n').map((l) => l.trim()).filter(Boolean)) {
          const s = SOURCE.exec(line)
          if (!s) { errors.push(`Source illisible (« - [Titre](https://…) » attendu) : « ${line.slice(0, 80)} ».`); continue }
          out.sources.push({ title: s[1].trim(), url: s[2], domain: domainOf(s[2]) })
        }
        break
      }
      default: {
        if (reservedNames.has(g.heading)) break
        let anchor = slugifyAnchor(g.heading.replace(/^\d+\.\s*/, ''))
        for (let n = 2; anchors.has(anchor); n++) anchor = `${slugifyAnchor(g.heading)}-${n}`
        anchors.add(anchor)
        out.sections.push({ heading: g.heading, anchor, blocks: parseBlocks(g.chunks, errors) })
      }
    }
  }
  return out
}

/** Tous les liens d'un ensemble de blocs (validation des liens, SEO-08). */
export function linksOfBlocks(blocks: RessourceBlock[]): string[] {
  const inl: Inline[] = []
  for (const b of blocks) {
    if (b.kind === 'paragraph') inl.push(...b.inlines)
    if (b.kind === 'list') for (const i of b.items) inl.push(...i)
  }
  return inl.filter((i): i is Extract<Inline, { kind: 'link' }> => i.kind === 'link').map((i) => i.href)
}
