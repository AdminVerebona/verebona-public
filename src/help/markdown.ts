/**
 * Corps des articles — Markdown restreint, CDC Centre d'aide V1 §3.
 *
 * Formes reconnues, une par bloc séparé d'une ligne vide :
 *
 *   ## Procédure                              → intertitre (ancre dérivée)
 *   1. **Ouvrez la fiche** — Depuis Mes biens… → étape (lignes consécutives)
 *   > **À savoir** — Texte                     → encadré (libellés du référentiel)
 *   **Terme** — Explication                    → définition / cas particulier
 *   Texte libre, avec **gras** et [lien](/aide/x) → paragraphe
 *
 * Le résultat est une liste de blocs typés, rendus par des composants Vue et
 * jamais par `v-html` : un article ne peut pas injecter de balisage, même par
 * erreur. Les mêmes blocs produisent le texte brut de la recherche et les
 * sections citées par l'assistant — une seule lecture du fichier, trois usages.
 */
import { CALLOUTS } from './referentials'
import type { Block, HelpSection, Inline } from './types'

export interface ParsedBody {
  blocks: Block[]
  errors: string[]
}

const STEP = /^(\d+)\. \*\*(.+?)\*\* — (.+)$/
const CALLOUT = /^> \*\*(.+?)\*\* — (.+)$/
const DEFINITION = /^\*\*(.+?)\*\* — (.+)$/
const HEADING = /^## (.+)$/

export function slugifyAnchor(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[’']/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Gras et liens. Tout autre caractère est du texte, jamais du balisage. */
export function parseInlines(text: string): Inline[] {
  const out: Inline[] = []
  const re = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g
  let last = 0
  for (let m = re.exec(text); m; m = re.exec(text)) {
    if (m.index > last) out.push({ kind: 'text', text: text.slice(last, m.index) })
    if (m[1] !== undefined) out.push({ kind: 'strong', text: m[1] })
    else out.push({ kind: 'link', text: m[2], href: m[3] })
    last = m.index + m[0].length
  }
  if (last < text.length) out.push({ kind: 'text', text: text.slice(last) })
  return out
}

export function inlinesToText(inlines: Inline[]): string {
  return inlines.map((i) => i.text).join('')
}

export function parseBody(body: string): ParsedBody {
  const blocks: Block[] = []
  const errors: string[] = []
  const chunks = body.replace(/\r\n/g, '\n').split(/\n{2,}/).map((c) => c.trim()).filter(Boolean)
  const anchors = new Set<string>()

  for (const chunk of chunks) {
    const lines = chunk.split('\n')

    const h = HEADING.exec(chunk)
    if (h && lines.length === 1) {
      let anchor = slugifyAnchor(h[1])
      for (let n = 2; anchors.has(anchor); n++) anchor = `${slugifyAnchor(h[1])}-${n}`
      anchors.add(anchor)
      blocks.push({ kind: 'heading', text: h[1].trim(), anchor })
      continue
    }

    if (STEP.test(lines[0])) {
      const items: Array<{ title: string; body: Inline[] }> = []
      lines.forEach((line, i) => {
        const m = STEP.exec(line)
        if (!m) { errors.push(`Étape illisible : « ${line} ».`); return }
        if (Number(m[1]) !== i + 1) errors.push(`Étapes mal numérotées : « ${m[1]}. » à la position ${i + 1}.`)
        items.push({ title: m[2].trim(), body: parseInlines(m[3].trim()) })
      })
      blocks.push({ kind: 'steps', items })
      continue
    }

    if (lines.length > 1) {
      errors.push(`Bloc sur plusieurs lignes non reconnu : « ${lines[0].slice(0, 60)}… ».`)
      continue
    }

    const c = CALLOUT.exec(chunk)
    if (c) {
      const tone = CALLOUTS[c[1]]
      if (!tone) errors.push(`Encadré inconnu : « ${c[1]} ». Autorisés : ${Object.keys(CALLOUTS).join(', ')}.`)
      blocks.push({ kind: 'callout', label: c[1], tone: tone ?? 'info', inlines: parseInlines(c[2]) })
      continue
    }
    if (chunk.startsWith('>')) { errors.push(`Encadré mal formé : « ${chunk.slice(0, 60)} ».`); continue }
    if (/^#/.test(chunk)) { errors.push(`Seuls les intertitres « ## » sont autorisés : « ${chunk.slice(0, 60)} ».`); continue }

    const d = DEFINITION.exec(chunk)
    if (d) {
      blocks.push({ kind: 'definition', term: d[1].trim(), inlines: parseInlines(d[2].trim()) })
      continue
    }

    blocks.push({ kind: 'paragraph', inlines: parseInlines(chunk) })
  }

  return { blocks, errors }
}

/** Texte brut d'un bloc, pour la recherche et l'assistant. */
export function blockText(b: Block): string {
  switch (b.kind) {
    case 'paragraph': return inlinesToText(b.inlines)
    case 'heading': return b.text
    case 'steps': return b.items.map((s, i) => `${i + 1}. ${s.title} — ${inlinesToText(s.body)}`).join('\n')
    case 'callout': return `${b.label} — ${inlinesToText(b.inlines)}`
    case 'definition': return `${b.term} — ${inlinesToText(b.inlines)}`
  }
}

/**
 * Découpe un article en sections citables (§3 : « indexation par blocs/sections
 * afin de pouvoir citer précisément les articles utilisés »).
 *
 * Tout ce qui précède le premier intertitre forme la section « Présentation ».
 */
export function toSections(blocks: Block[]): HelpSection[] {
  const sections: HelpSection[] = []
  let current: HelpSection = { anchor: 'presentation', heading: 'Présentation', text: '' }
  const push = () => { if (current.text.trim()) sections.push({ ...current, text: current.text.trim() }) }
  for (const b of blocks) {
    if (b.kind === 'heading') {
      push()
      current = { anchor: b.anchor, heading: b.text, text: '' }
      continue
    }
    current.text += `${blockText(b)}\n`
  }
  push()
  return sections
}

/** Liens d'un article, pour la validation des liens internes (EDITOR-01). */
export function linksOf(blocks: Block[]): string[] {
  const all: Inline[] = []
  for (const b of blocks) {
    if (b.kind === 'paragraph' || b.kind === 'callout' || b.kind === 'definition') all.push(...b.inlines)
    if (b.kind === 'steps') for (const s of b.items) all.push(...s.body)
  }
  return all.filter((i): i is Extract<Inline, { kind: 'link' }> => i.kind === 'link').map((i) => i.href)
}
