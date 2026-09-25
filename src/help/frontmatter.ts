/**
 * Frontmatter des articles — sous-ensemble strict de YAML.
 *
 * Un article commence par :
 *
 *   ---
 *   id: AID-DOC-001
 *   tags: [documents, import]
 *   indexable: true
 *   ---
 *
 * Trois formes seulement : texte sur une ligne, liste `[a, b]`, booléen. Pas de
 * guillemets, pas de multiligne, pas d'imbrication. Un parseur YAML complet
 * accepterait bien plus — et chaque forme acceptée est une façon de plus de
 * rédiger une métadonnée que la validation ne comprend pas. Toute ligne hors de
 * ces formes est une erreur de build, pas une valeur devinée.
 */

export type FrontmatterValue = string | string[] | boolean

export interface ParsedFile {
  data: Record<string, FrontmatterValue>
  body: string
  errors: string[]
}

const LINE = /^([A-Za-z][A-Za-z0-9]*): ?(.*)$/

export function parseFrontmatter(raw: string): ParsedFile {
  const errors: string[] = []
  const text = raw.replace(/\r\n/g, '\n')
  if (!text.startsWith('---\n')) {
    return { data: {}, body: text, errors: ['Le fichier doit commencer par un bloc « --- ».'] }
  }
  const end = text.indexOf('\n---\n', 4)
  if (end === -1) {
    return { data: {}, body: text, errors: ['Bloc de métadonnées non refermé par « --- ».'] }
  }

  const data: Record<string, FrontmatterValue> = {}
  const lines = text.slice(4, end).split('\n')
  lines.forEach((line, i) => {
    if (line.trim() === '') return
    const m = LINE.exec(line)
    if (!m) {
      errors.push(`Ligne ${i + 2} illisible : « ${line} ».`)
      return
    }
    const [, key, rawValue] = m
    if (key in data) errors.push(`Clé « ${key} » en double.`)
    data[key] = parseValue(rawValue.trim())
  })

  return { data, body: text.slice(end + 5).replace(/^\n+/, ''), errors }
}

function parseValue(value: string): FrontmatterValue {
  if (value === 'true') return true
  if (value === 'false') return false
  if (value.startsWith('[') && value.endsWith(']')) {
    const inner = value.slice(1, -1).trim()
    return inner === '' ? [] : inner.split(',').map((s) => s.trim()).filter(Boolean)
  }
  return value
}
