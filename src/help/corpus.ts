/**
 * Chargement et validation du corpus — CDC Centre d'aide V1 §2, §6, §16.1.
 *
 * Fonctions pures : elles reçoivent le contenu des fichiers et rendent le
 * corpus ou la liste de ses défauts. `vite.config.ts` les appelle au build et
 * fait échouer celui-ci au premier défaut ; les tests les appellent sur le
 * corpus réel. Aucune lecture de disque ni de `import.meta.env` ici.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * UN DÉFAUT ÉDITORIAL EST UN ÉCHEC DE BUILD
 *
 * Le §16.1 l'exige, et c'est la seule façon de tenir la promesse du §2 :
 * « Besoin d'aide » et l'assistant lisent ce corpus sans relecture humaine. Un
 * article lié inexistant, un slug en double ou une ancienne URL qui ne mène
 * nulle part se découvriraient sinon en production, dans la réponse d'un
 * utilisateur.
 * ══════════════════════════════════════════════════════════════════════════
 */
import { parseFrontmatter, type FrontmatterValue } from './frontmatter'
import { linksOf, parseBody } from './markdown'
import {
  APP_ROUTE, ASSISTANT_ACTIONS,
  AUTH_STATES, LANGS, OBJECT_TYPES, OFFERS, PERMISSIONS, PLATFORMS, RESERVED_SLUGS, ROLES, SCREENS, STATUSES,
} from './referentials'
import type { BuildIssue, HelpArticle, HelpCategory } from './types'

export interface SourceFile {
  /** Chemin relatif à la racine du dépôt. */
  path: string
  raw: string
  /** Date du dernier commit touchant le fichier, si Git est disponible. */
  updatedAt?: string | null
}

export interface Corpus {
  articles: HelpArticle[]
  categories: HelpCategory[]
}

export interface LoadResult extends Corpus {
  issues: BuildIssue[]
}

const ID = /^AID-[A-Z]+-\d{3}$/
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/
// CONTENT-02 : insensible à la casse. Un synonyme « t2 » passait le contrôle
// sensible à la casse puis était publié dans le JSON-LD `keywords` et dans le
// corpus de l'assistant. Aucun article ne parle de typologie de logement
// (« T3 ») : le faux positif est accepté plutôt qu'une fuite du jargon interne.
const INTERNAL_CODES = /\bT[1-5]\b/i
// GAP-15 (passe éditoriale) : formulations de rédaction interne reprises du
// CDC (« route d'import actuelle », « l'ancienne aide mentionnait… », « à
// confirmer à la recette », « dans la cible », codes d'état en MAJUSCULES…).
// Refusées dans le texte des articles PUBLIÉS : un article bloqué peut encore
// porter ses notes de travail, invisibles en production.
const EDITORIAL_NOTES: ReadonlyArray<[RegExp, string]> = [
  [/\brecette\b/i, '« recette »'],
  [/\bMEP\b/, '« MEP »'],
  [/\broute (d[’']import )?actuelle\b/i, '« route actuelle »'],
  [/\b(dans la cible|règle cible|cible produit)\b/i, '« cible »'],
  [/\bancienne aide\b/i, '« ancienne aide »'],
  [/\bmanifeste\b/i, '« manifeste »'],
  [/\bpasse éditoriale\b/i, '« passe éditoriale »'],
  [/\bimplémentation actuelle\b/i, '« implémentation actuelle »'],
  [/\b(catalogue|matrice) actuel(le)?\b/i, '« catalogue / matrice actuel »'],
  [/\bà confirmer (à|lors de|avec)\b/i, '« à confirmer à… »'],
  [/\b[A-Z]{2,}_[A-Z_]{2,}\b/, 'code interne en MAJUSCULES'],
]

// Une adresse d'abonnement réelle (« webcal://hôte… »), pas la simple mention
// du préfixe dans une consigne (« remplacez webcal:// par https:// »).
const SECRET_HINTS = /(webcal:\/\/[a-z0-9]|[?&](token|key|signature|sig)=|\bsk_(live|test)_)/i

const REQUIRED_TEXT = [
  'id', 'title', 'slug', 'category', 'summary', 'rolesLabel', 'permissions',
  'seoTitle', 'metaDescription', 'canonical', 'lang', 'status',
] as const
const REQUIRED_LIST = [
  'tags', 'offers', 'roles', 'platforms', 'authState', 'screens', 'objectTypes',
  'relatedArticles', 'synonyms',
] as const
const KNOWN = new Set<string>([
  ...REQUIRED_TEXT, ...REQUIRED_LIST, 'indexable', 'offersNote', 'blocker', 'redirectFrom', 'updatedAt',
  // Contrat de publication (CDC Assistant §10.3, D-O).
  'validatedAt', 'allowedRoutes', 'allowedActions', 'appVersion',
])

/** Date de repli (EDITOR-02) : jour calendaire ISO, sans heure. */
const DATE = /^\d{4}-\d{2}-\d{2}$/

export function loadCorpus(files: SourceFile[], categoriesJson: unknown): LoadResult {
  const issues: BuildIssue[] = []
  const categories = readCategories(categoriesJson, issues)
  const catSlugs = new Set(categories.map((c) => c.slug))
  const articles: HelpArticle[] = []

  for (const file of files) {
    const report = (field: string, message: string, id: string | null = null) =>
      issues.push({ source: file.path, articleId: id, field, message })

    const { data, body, errors } = parseFrontmatter(file.raw)
    errors.forEach((e) => report('frontmatter', e))

    const id = typeof data.id === 'string' ? data.id : null
    for (const key of Object.keys(data)) if (!KNOWN.has(key)) report(key, `Métadonnée inconnue « ${key} ».`, id)

    const text = (k: string): string => {
      const v = data[k]
      if (typeof v !== 'string' || v.trim() === '') { report(k, 'Obligatoire (texte).', id); return '' }
      return v
    }
    const list = (k: string, allowEmpty = false): string[] => {
      const v = data[k]
      if (!Array.isArray(v)) { report(k, 'Obligatoire (liste « [a, b] »).', id); return [] }
      if (!allowEmpty && v.length === 0) report(k, 'La liste ne peut pas être vide.', id)
      return v
    }
    const optText = (k: string): string | null => (typeof data[k] === 'string' ? (data[k] as string) : null)
    const inRef = (k: string, values: string[], ref: readonly string[]) => {
      for (const v of values) if (!ref.includes(v)) report(k, `« ${v} » n'appartient pas au référentiel.`, id)
    }

    const meta = {
      id: text('id'),
      title: text('title'),
      slug: text('slug'),
      category: text('category'),
      summary: text('summary'),
      tags: list('tags'),
      offers: list('offers'),
      offersNote: optText('offersNote'),
      roles: list('roles'),
      rolesLabel: text('rolesLabel'),
      platforms: list('platforms'),
      authState: list('authState'),
      screens: list('screens'),
      objectTypes: list('objectTypes', true),
      permissions: text('permissions'),
      relatedArticles: list('relatedArticles'),
      seoTitle: text('seoTitle'),
      metaDescription: text('metaDescription'),
      canonical: text('canonical'),
      indexable: readBool(data.indexable, () => report('indexable', 'Obligatoire (true ou false).', id)),
      lang: text('lang'),
      synonyms: list('synonyms'),
      status: text('status'),
      blocker: optText('blocker'),
      redirectFrom: Array.isArray(data.redirectFrom) ? data.redirectFrom : [],
      validatedAt: optText('validatedAt'),
      allowedRoutes: Array.isArray(data.allowedRoutes) ? data.allowedRoutes : [],
      allowedActions: Array.isArray(data.allowedActions) ? data.allowedActions : [],
      appVersion: optText('appVersion'),
    }

    // Contrat de publication (CDC Assistant §10.3, décision PO D-O) : un
    // article PUBLIÉ porte sa date de validation — sans elle, l'assistant
    // l'ignorerait ; le build échoue plutôt que de publier un article muet.
    if (meta.validatedAt !== null && (!DATE.test(meta.validatedAt) || Number.isNaN(Date.parse(meta.validatedAt)))) {
      report('validatedAt', `Date invalide « ${meta.validatedAt} » (format AAAA-MM-JJ).`, id)
    } else if (meta.status === 'published' && !meta.validatedAt) {
      report('validatedAt', 'Obligatoire pour un article publié (date de validation AAAA-MM-JJ, CDC Assistant §10.3).', id)
    }
    for (const r of meta.allowedRoutes) {
      if (typeof r !== 'string' || !APP_ROUTE.test(r)) report('allowedRoutes', `Route invalide « ${String(r)} » (chemin interne de l’application).`, id)
    }
    inRef('allowedActions', meta.allowedActions, ASSISTANT_ACTIONS)
    if (meta.appVersion !== null && !/^[A-Za-z0-9._-]{1,20}$/.test(meta.appVersion)) {
      report('appVersion', `Version invalide « ${meta.appVersion} ».`, id)
    }

    // EDITOR-02 : la date technique vient de Git. Sans historique au build
    // (archive, hébergeur qui ne transmet pas `.git`), elle était absente :
    // ni `dateModified` ni `updatedAt` au catalogue. Le frontmatter porte
    // donc une date de repli obligatoire, utilisée seulement dans ce cas.
    const fallbackDate = optText('updatedAt')
    if (!fallbackDate) report('updatedAt', 'Obligatoire (date AAAA-MM-JJ, repli quand Git est absent au build).', id)
    else if (!DATE.test(fallbackDate) || Number.isNaN(Date.parse(fallbackDate))) {
      report('updatedAt', `Date invalide « ${fallbackDate} » (format AAAA-MM-JJ).`, id)
    }

    // Cohérence de la date de validation (revue lot 21, D-O) : jamais dans le
    // futur, jamais antérieure à la dernière mise à jour éditoriale déclarée
    // (`updatedAt` du frontmatter) — un article modifié après sa validation
    // doit être revalidé. La date technique Git n'entre pas en compte : un
    // simple commit (typo, mise en forme) ne doit pas casser le build. Ces
    // dates sont saisies par la rédaction, jamais fabriquées par le code.
    if (meta.validatedAt && DATE.test(meta.validatedAt) && !Number.isNaN(Date.parse(meta.validatedAt))) {
      const aujourdHui = new Date().toISOString().slice(0, 10)
      if (meta.validatedAt > aujourdHui) {
        report('validatedAt', `Date de validation future « ${meta.validatedAt} » (aujourd’hui : ${aujourdHui}).`, id)
      } else if (fallbackDate && DATE.test(fallbackDate) && meta.validatedAt < fallbackDate) {
        report('validatedAt', `Validation (${meta.validatedAt}) antérieure à la dernière mise à jour (${fallbackDate}) : article à revalider.`, id)
      }
    }

    if (meta.id && !ID.test(meta.id)) report('id', `Format attendu AID-XXX-000, reçu « ${meta.id} ».`, id)
    if (meta.id && !file.path.endsWith(`/${meta.id}.md`)) {
      report('id', `Le fichier doit s'appeler ${meta.id}.md : l'ID stable nomme le fichier.`, id)
    }
    if (meta.slug && !SLUG.test(meta.slug)) report('slug', `Slug invalide « ${meta.slug} ».`, id)
    if (RESERVED_SLUGS.includes(meta.slug)) report('slug', `Slug réservé « ${meta.slug} ».`, id)
    if (meta.canonical && meta.canonical !== `/aide/${meta.slug}`) {
      report('canonical', `Doit valoir /aide/${meta.slug}.`, id)
    }
    if (meta.category && !catSlugs.has(meta.category)) report('category', `Catégorie inconnue « ${meta.category} ».`, id)
    inRef('offers', meta.offers, OFFERS)
    inRef('roles', meta.roles, ROLES)
    inRef('platforms', meta.platforms, PLATFORMS)
    inRef('authState', meta.authState, AUTH_STATES)
    inRef('screens', meta.screens, SCREENS)
    inRef('objectTypes', meta.objectTypes, OBJECT_TYPES)
    if (meta.permissions) inRef('permissions', [meta.permissions], PERMISSIONS)
    if (meta.lang && !(LANGS as readonly string[]).includes(meta.lang)) report('lang', `Langue non prise en charge « ${meta.lang} ».`, id)
    if (meta.status && !(STATUSES as readonly string[]).includes(meta.status)) report('status', `Statut inconnu « ${meta.status} ».`, id)
    if (meta.status === 'blocked' && !meta.blocker) report('blocker', 'Un article bloqué doit nommer son blocage.', id)
    if (meta.status === 'published' && meta.blocker) report('blocker', 'Un article publié ne porte pas de blocage.', id)
    if (meta.relatedArticles.includes(meta.id)) report('relatedArticles', "Un article ne se cite pas lui-même.", id)
    for (const r of meta.redirectFrom) {
      if (!/^\/aide\/[a-z0-9-]+$/.test(r)) report('redirectFrom', `Ancienne URL invalide « ${r} ».`, id)
    }

    const parsed = parseBody(body)
    parsed.errors.forEach((e) => report('body', e, id))
    const blocks = parsed.blocks
    if (!blocks.some((b) => b.kind === 'paragraph')) report('body', 'Introduction manquante (au moins un paragraphe).', id)
    const procedure = blocks.findIndex((b) => b.kind === 'heading' && b.text === 'Procédure')
    if (procedure !== -1 && blocks[procedure + 1]?.kind !== 'steps') {
      report('body', 'La section « Procédure » doit commencer par des étapes numérotées.', id)
    }

    // CONTENT-02 et §6 : ni vocabulaire interne, ni donnée personnelle, ni secret.
    const everything = `${file.raw}`
    if (INTERNAL_CODES.test(everything)) report('content', 'Vocabulaire interne T1–T5 interdit dans un article public (CONTENT-02).', id)
    if (EMAIL.test(everything)) report('content', 'Adresse e-mail interdite dans un article (§6, §7).', id)
    if (SECRET_HINTS.test(everything)) report('content', 'Lien privé, jeton ou secret interdit dans un article (§6, §7).', id)
    if (meta.status === 'published') {
      // Corps et métadonnées affichées, pas les IDs (« AID-TODO-001 ») ni les clés.
      const visible = [body, meta.title, meta.summary, meta.metaDescription, meta.rolesLabel, meta.offersNote ?? ''].join('\n')
      for (const [re, label] of EDITORIAL_NOTES) {
        if (re.test(visible)) report('content', `Formulation de rédaction interne ${label} interdite dans un article publié (GAP-15).`, id)
      }
    }

    articles.push({
      ...meta,
      offers: meta.offers as HelpArticle['offers'],
      roles: meta.roles as HelpArticle['roles'],
      platforms: meta.platforms as HelpArticle['platforms'],
      authState: meta.authState as HelpArticle['authState'],
      status: meta.status as HelpArticle['status'],
      blocks,
      source: file.path,
      updatedAt: file.updatedAt ?? (fallbackDate && DATE.test(fallbackDate) ? fallbackDate : null),
    })
  }

  checkCrossReferences(articles, issues)
  articles.sort(compareArticles(categories))
  return { articles, categories, issues }
}

function readBool(v: FrontmatterValue | undefined, onMissing: () => void): boolean {
  if (typeof v === 'boolean') return v
  onMissing()
  return false
}

function readCategories(json: unknown, issues: BuildIssue[]): HelpCategory[] {
  const bad = (message: string) =>
    issues.push({ source: 'src/content/aide/categories.json', articleId: null, field: 'categories', message })
  if (!Array.isArray(json)) { bad('Liste de catégories attendue.'); return [] }
  const out: HelpCategory[] = []
  for (const c of json as Array<Record<string, unknown>>) {
    if (typeof c.slug !== 'string' || !SLUG.test(c.slug) || typeof c.name !== 'string'
      || typeof c.intro !== 'string' || typeof c.order !== 'number') {
      bad(`Catégorie mal formée : ${JSON.stringify(c)}.`)
      continue
    }
    out.push({ slug: c.slug, name: c.name, intro: c.intro, order: c.order })
  }
  if (new Set(out.map((c) => c.slug)).size !== out.length) bad('Slug de catégorie en double.')
  return out.sort((a, b) => a.order - b.order)
}

/**
 * Contrôles qui portent sur plusieurs articles : unicité (META-03), articles
 * liés (META-02), liens internes (EDITOR-01), redirections (ARCH-05, §13.1).
 */
function checkCrossReferences(articles: HelpArticle[], issues: BuildIssue[]): void {
  const report = (a: HelpArticle, field: string, message: string) =>
    issues.push({ source: a.source, articleId: a.id, field, message })

  const byId = new Map<string, HelpArticle>()
  const byCanonical = new Map<string, HelpArticle>()
  for (const a of articles) {
    const dupId = byId.get(a.id)
    if (dupId) report(a, 'id', `ID déjà utilisé par ${dupId.source} (META-03).`)
    else byId.set(a.id, a)
    const dupUrl = byCanonical.get(a.canonical)
    if (dupUrl) report(a, 'canonical', `URL déjà utilisée par ${dupUrl.id} (META-03).`)
    else byCanonical.set(a.canonical, a)
  }

  const redirects = new Map<string, HelpArticle>()
  for (const a of articles) {
    for (const r of a.relatedArticles) {
      if (!byId.has(r)) report(a, 'relatedArticles', `Article lié inexistant « ${r} » (META-02).`)
    }
    for (const href of linksOf(a.blocks)) {
      if (href.startsWith('//')) {
        report(a, 'body', `Lien sans protocole interdit « ${href} » : chemin interne ou https uniquement.`)
      } else if (href.startsWith('/aide/') && !byCanonical.has(href.split('#')[0])) {
        report(a, 'body', `Lien interne vers une page inexistante « ${href} » (EDITOR-01).`)
      } else if (!href.startsWith('/') && !href.startsWith('https://')) {
        report(a, 'body', `Lien non autorisé « ${href} » : chemin interne ou https uniquement.`)
      }
    }
    for (const r of a.redirectFrom) {
      if (byCanonical.has(r)) report(a, 'redirectFrom', `« ${r} » est l'URL d'un article existant : pas de redirection possible.`)
      const other = redirects.get(r)
      if (other) report(a, 'redirectFrom', `« ${r} » redirige déjà vers ${other.id}.`)
      else redirects.set(r, a)
    }
  }
}

/** Ordre de lecture : catégorie, puis ID — l'ordre du CDC. */
function compareArticles(categories: HelpCategory[]) {
  const rank = new Map(categories.map((c) => [c.slug, c.order]))
  return (a: HelpArticle, b: HelpArticle) =>
    (rank.get(a.category) ?? 99) - (rank.get(b.category) ?? 99) || a.id.localeCompare(b.id)
}

/** Message de build lisible, un défaut par ligne. */
export function formatIssues(issues: BuildIssue[]): string {
  return issues
    .map((i) => `  · ${i.source}${i.articleId ? ` [${i.articleId}]` : ''} — ${i.field} : ${i.message}`)
    .join('\n')
}
