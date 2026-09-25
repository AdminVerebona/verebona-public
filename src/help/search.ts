/**
 * Recherche du Centre d'aide — CDC Centre d'aide V1 §4, SEARCH-01 à SEARCH-06.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * LEXICALE, TOLÉRANTE, ET CAPABLE DE NE RIEN RENDRE
 *
 * Le §4 veut une recherche qui gère « les fautes simples, les accents, les
 * synonymes, les variations de formulation ». Tout cela est fait ici, sans
 * service externe :
 *   · accents et casse effacés des deux côtés (« echeance » = « Échéance ») ;
 *   · racines légères (« importer », « importez », « import ») ;
 *   · synonymes : ceux de chaque article (§3) et un lexique métier commun ;
 *   · fautes : une lettre d'écart dès 4 lettres, deux dès 8.
 *
 * Il n'y a pas de moteur sémantique sur le site statique. C'est le mode que
 * SEARCH-04 exige en repli, et il fonctionne seul : rien ne dépend d'un
 * service qui pourrait être indisponible.
 *
 * Le §4 interdit surtout de « proposer un résultat sans rapport pour remplir
 * l'écran ». D'où un seuil : un article qui ne couvre pas au moins la moitié
 * des mots significatifs de la requête n'est pas rendu, même s'il est le
 * « moins mauvais ». Mieux vaut l'écran « aucun résultat », qui mène au
 * contact, qu'une liste qui fait perdre du temps.
 * ══════════════════════════════════════════════════════════════════════════
 */

export interface SearchDocument {
  id: string
  title: string
  path: string
  category: string
  categoryName: string
  summary: string
  offersLabel: string
  /** Offre restreinte : affichée dans le résultat (SEARCH-05). */
  restricted: boolean
  synonyms: string[]
  tags: string[]
  headings: string[]
  sections: Array<{ anchor: string; heading: string; text: string }>
}

export interface SearchResult {
  doc: SearchDocument
  score: number
  excerpt: string
  /** Mots de la requête effectivement retrouvés, pour le surlignage. */
  terms: string[]
}

const STOPWORDS = new Set((
  'a au aux avec ce ces cet cette comment dans de des du elle en est et il je la le les leur ' +
  'lui ma mais me mes mon ne ni nos notre nous on ou où par pas plus pour qu que quel quelle ' +
  'quels quelles qui sa se ses son sur ta te tes ton tu un une vos votre vous y d l j m n s t c ' +
  'faire fait peut peux puis dois doit est-ce estce ça ca comment pourquoi quand'
).split(' '))

/** Lexique métier commun : chaque terme appelle ses équivalents (§4). */
const SYNONYMS: string[][] = [
  ['importer', 'televerser', 'telecharger', 'upload', 'ajouter', 'deposer', 'charger'],
  ['document', 'fichier', 'justificatif', 'piece jointe', 'pdf', 'scan', 'facture', 'contrat'],
  ['echeance', 'rappel', 'date', 'evenement', 'agenda', 'calendrier'],
  ['supprimer', 'effacer', 'retirer', 'enlever'],
  ['abonnement', 'offre', 'formule', 'forfait', 'plan'],
  ['tarif', 'prix', 'cout', 'payer', 'facturation'],
  ['compte', 'profil', 'identifiant'],
  ['mot de passe', 'mdp', 'password'],
  ['bien', 'logement', 'maison', 'appartement', 'vehicule', 'voiture', 'objet'],
  ['partager', 'partage', 'duo', 'inviter', 'conjoint'],
  ['notification', 'alerte', 'push', 'email', 'mail'],
  ['assistant', 'ia', 'intelligence artificielle', 'chat', 'question'],
  ['transferer', 'transmettre', 'ceder', 'vendre', 'vente'],
  ['resilier', 'resiliation', 'annuler', 'arreter'],
  ['exporter', 'export', 'sauvegarder', 'recuperer'],
]

export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[’'`]/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

const SUFFIXES = ['issements', 'issement', 'ements', 'ement', 'ations', 'ation', 'ees', 'ee', 'es', 'er', 'ez', 'e', 's', 'x']

/** Racine légère : assez pour rapprocher les formes d'un mot, pas plus. */
export function stem(word: string): string {
  if (word.length <= 4) return word
  for (const s of SUFFIXES) {
    if (word.endsWith(s) && word.length - s.length >= 4) return word.slice(0, -s.length)
  }
  return word
}

export function tokenize(text: string): string[] {
  return normalize(text).split(' ').filter((t) => t.length > 1 && !STOPWORDS.has(t))
}

/** Distance d'édition bornée : s'arrête dès que `max` est dépassé. */
export function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]
    let best = i
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost)
      best = Math.min(best, cur[j])
    }
    if (best > max) return max + 1
    prev = cur
  }
  return prev[b.length]
}

const SYNONYM_INDEX: Map<string, Set<string>> = (() => {
  const m = new Map<string, Set<string>>()
  for (const group of SYNONYMS) {
    const stems = group.flatMap((w) => tokenize(w)).map(stem)
    for (const s of stems) {
      const set = m.get(s) ?? new Set<string>()
      stems.forEach((x) => { if (x !== s) set.add(x) })
      m.set(s, set)
    }
  }
  return m
})()

const FIELD_WEIGHTS = { title: 6, synonyms: 4, summary: 3, headings: 2, body: 1 } as const
type Field = keyof typeof FIELD_WEIGHTS

interface IndexedDocument {
  doc: SearchDocument
  /** racine → poids du meilleur champ où elle apparaît */
  stems: Map<string, number>
  normalizedTitle: string
}

export interface SearchIndex {
  docs: IndexedDocument[]
}

export function buildSearchIndex(docs: SearchDocument[]): SearchIndex {
  return {
    docs: docs.map((doc) => {
      const stems = new Map<string, number>()
      const add = (text: string, field: Field) => {
        for (const t of tokenize(text)) {
          const s = stem(t)
          stems.set(s, Math.max(stems.get(s) ?? 0, FIELD_WEIGHTS[field]))
        }
      }
      add(doc.title, 'title')
      add([...doc.synonyms, ...doc.tags].join(' '), 'synonyms')
      add(doc.summary, 'summary')
      add(doc.headings.join(' '), 'headings')
      add(doc.sections.map((s) => s.text).join(' '), 'body')
      return { doc, stems, normalizedTitle: normalize(doc.title) }
    }),
  }
}

interface StemMatch { weight: number; strong: boolean }

/**
 * Meilleure correspondance d'une racine de requête dans un document.
 *
 * `strong` : correspondance exacte ou par synonyme. Préfixe et faute de frappe
 * sont « faibles » : utiles pour rattraper « parainage », dangereux quand ils
 * rapprochent « impôts » d'« import » ou « pain » de « plan ». D'où des seuils
 * de longueur, et la règle du `search` ci-dessous.
 */
function matchStem(q: string, stems: Map<string, number>): StemMatch {
  const exact = stems.get(q)
  if (exact) return { weight: exact, strong: true }
  let best = 0
  for (const syn of SYNONYM_INDEX.get(q) ?? []) {
    const w = stems.get(syn)
    if (w) best = Math.max(best, w * 0.85)
  }
  if (best > 0) return { weight: best, strong: true }
  const max = q.length >= 9 ? 2 : q.length >= 6 ? 1 : 0
  for (const [s, w] of stems) {
    if (q.length >= 4 && s.startsWith(q)) best = Math.max(best, w * 0.7)
    else if (max > 0 && editDistance(q, s, max) <= max) best = Math.max(best, w * 0.5)
  }
  return { weight: best, strong: false }
}

export function search(index: SearchIndex, query: string, limit = 20): SearchResult[] {
  const words = [...new Set(tokenize(query))]
  if (words.length === 0) return []
  const stems = words.map(stem)
  const phrase = normalize(query)
  // Expressions de la requête (« mot de passe ») : deux à quatre mots
  // consécutifs, bornés par des mots significatifs.
  const raw = phrase.split(' ')
  const phrases: string[] = []
  for (let i = 0; i < raw.length; i++) {
    for (let j = i + 1; j < Math.min(raw.length, i + 4); j++) {
      if (!STOPWORDS.has(raw[i]) && !STOPWORDS.has(raw[j]) && raw[i].length > 1 && raw[j].length > 1) {
        phrases.push(raw.slice(i, j + 1).join(' '))
      }
    }
  }

  const results: SearchResult[] = []
  for (const d of index.docs) {
    let score = 0
    let strong = 0
    const found: string[] = []
    stems.forEach((s, i) => {
      const m = matchStem(s, d.stems)
      if (m.weight > 0) { score += m.weight; found.push(words[i]); if (m.strong) strong += 1 }
    })
    const coverage = found.length / stems.length
    // Moins de la moitié des mots retrouvés : sans rapport (§4).
    if (coverage < 0.5 || (stems.length <= 2 && coverage < 1 && score < 6)) continue
    // Plusieurs mots, aucun retrouvé tel quel ni par synonyme : des
    // rapprochements approximatifs seulement, donc sans rapport. Un mot seul
    // mal orthographié (« parainage ») reste, lui, rattrapable.
    if (stems.length > 1 && strong === 0) continue
    // Tous les mots doivent être retrouvés quand un seul l'est franchement :
    // « prix du pain » ne doit pas remonter un article sur les prix.
    if (stems.length > 1 && strong < Math.ceil(stems.length / 2)) continue
    if (phrase.length >= 4 && d.normalizedTitle.includes(phrase)) score += 20
    else if (phrases.some((x) => d.normalizedTitle.includes(x))) score += 8
    score *= coverage
    if (score < 2) continue
    results.push({ doc: d.doc, score, terms: found, excerpt: excerptFor(d.doc, found) })
  }
  return results.sort((a, b) => b.score - a.score || a.doc.title.localeCompare(b.doc.title)).slice(0, limit)
}

/**
 * Extrait pertinent (SEARCH-05) : la phrase qui contient le plus de mots de la
 * requête ; à défaut, le résumé.
 */
export function excerptFor(doc: SearchDocument, terms: string[], max = 180): string {
  const needles = terms.map((t) => stem(normalize(t)))
  let best = { text: doc.summary, hits: 0 }
  for (const section of doc.sections) {
    for (const sentence of section.text.split(/(?<=[.!?])\s+|\n/)) {
      const norm = tokenize(sentence).map(stem)
      const hits = needles.filter((n) => norm.some((w) => w.startsWith(n) || n.startsWith(w))).length
      if (hits > best.hits) best = { text: sentence.trim(), hits }
    }
  }
  const text = best.text.replace(/^\d+\.\s*/, '')
  return text.length > max ? `${text.slice(0, max - 1).replace(/\s+\S*$/, '')}…` : text
}

/** Découpe un texte en segments à surligner, sans HTML. */
export function highlight(text: string, terms: string[]): Array<{ text: string; mark: boolean }> {
  const needles = terms.map((t) => stem(normalize(t))).filter((n) => n.length >= 3)
  if (!needles.length) return [{ text, mark: false }]
  const out: Array<{ text: string; mark: boolean }> = []
  for (const part of text.split(/(\s+)/)) {
    const n = normalize(part)
    const mark = n.length > 0 && needles.some((x) => n.startsWith(x))
    const last = out[out.length - 1]
    if (last && last.mark === mark) last.text += part
    else out.push({ text: part, mark })
  }
  return out
}
