/**
 * Titres SEO (`<title>`) des pages de contenu — chantier 105Q (audit Bing du 02/11/2026).
 *
 * Règles pures (aucune dépendance à Vue ni à `import.meta.env`), partagées par
 * les chargeurs de corpus (Centre d'aide, Ressources) et par les tests.
 *
 * · Le `<title>` est INDÉPENDANT du H1 : `seoTitle` du frontmatter, écrit en
 *   entier (suffixe compris). Le H1 éditorial (`title` / `h1`) n'est jamais
 *   modifié pour raccourcir un titre.
 * · `seoTitle` absent : repli court et pertinent, construit sur le H1 avec le
 *   suffixe de la rubrique (« | Aide Verebona »), ou « | Verebona » si le
 *   résultat dépasse la longueur indicative. Le texte n'est JAMAIS tronqué.
 * · Un suffixe déjà présent n'est jamais ajouté une seconde fois.
 *
 * La longueur indicative (65 caractères) sert aux contrôles et au repli ; elle
 * n'est pas une limite : Bing et Google coupent l'affichage, pas le titre.
 */

export const HELP_TITLE_SUFFIX = ' | Aide Verebona'
export const SITE_TITLE_SUFFIX = ' | Verebona'

/** Longueur indicative d'un `<title>` (caractères). Aucune troncature automatique. */
export const TITLE_LENGTH_HINT = 65

/** Le titre se termine déjà par une marque Verebona (« | Verebona », « | Aide Verebona »…). */
const BRAND_END = /\|\s*(?:Aide |Centre d[’']aide )?Verebona\s*$/

/** Titre de repli : H1 + suffixe, jamais tronqué, jamais de suffixe en double. */
export function fallbackSeoTitle(h1: string, suffix: string = SITE_TITLE_SUFFIX): string {
  const base = h1.trim()
  if (!base || BRAND_END.test(base)) return base
  const full = `${base}${suffix}`
  if (full.length <= TITLE_LENGTH_HINT || suffix === SITE_TITLE_SUFFIX) return full
  return `${base}${SITE_TITLE_SUFFIX}`
}

/** `seoTitle` renseigné, sinon le repli. */
export function effectiveSeoTitle(seoTitle: string | null | undefined, h1: string, suffix?: string): string {
  const own = typeof seoTitle === 'string' ? seoTitle.trim() : ''
  return own || fallbackSeoTitle(h1, suffix)
}

/**
 * Suffixe de marque appliqué deux fois : plus d'un segment « | Verebona » /
 * « | Aide Verebona » / « | Centre d’aide Verebona », ou gabarit
 * « Verebona | … | Verebona ». « Découvrir Verebona | Aide Verebona » est
 * correct : la marque y est le sujet, le suffixe n'est présent qu'une fois.
 */
export function hasDoubledSuffix(title: string): boolean {
  const segments = title.split('|').map((x) => x.trim())
  const brand = /^(?:Aide |Centre d[’']aide )?Verebona$/
  const brandSegments = segments.filter((x) => brand.test(x)).length
  return brandSegments > 1
}
