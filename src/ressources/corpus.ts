/**
 * Chargement et contrôle du corpus Ressources — CDC Ressources V6 §10, §11,
 * ADM-03, ADM-08, ADM-09, SEO-02, SEO-05, SEO-08, SEO-10, ED-08.
 *
 * Fonction pure : reçoit le texte des fichiers, ne lit pas le disque. Toute
 * anomalie BLOQUANTE interrompt le build (`issues`) : c'est le « contrôle de
 * structure, des références et des droits » exigé avant publication (§11).
 * Les rapprochements seulement suspects (titres proches) sont des
 * avertissements (`warnings`) : « alerte si titre proche » (ADM-03).
 *
 * Contrôles, pour tout article :
 *   · métadonnées connues, obligatoires, au bon format ; ID = nom du fichier ;
 *   · slug ASCII normalisé, unique ; ID, H1, title SEO, meta description et
 *     intention UNIQUES (ADM-03, SEO-10, T07, T08) ;
 *   · corps : aucun HTML, H2 uniques, introduction, checklist, FAQ
 *     (au plus deux questions, §17), transition Verebona, sources ;
 *   · liens internes : vers une page Ressources existante, l'aide ou
 *     l'accueil ; liens externes et sources en HTTPS (SEC-06) ;
 *   · articles liés : 2 ou 3, existants, sans auto-référence (§7, ED-08).
 * Pour un article PUBLIÉ en plus (ADM-08, ED-09) : date de revue,
 * responsable, au moins une source, liés eux-mêmes publiés. La date de
 * publication est facultative tant que la première mise en ligne n'a pas eu
 * lieu (jamais anté-datée, lot 54).
 * Archivé : décision 410 ou 301 vers un article publié (ADM-07), et plus
 * aucun article publié ne pointe vers lui.
 */
import { parseFrontmatter, type FrontmatterValue } from '../help/frontmatter'
import { linksOfBlocks, parseRessourceBody } from './markdown'
import {
  RESSOURCE_STATUSES,
  type ArchiveDecision, type RessourceArticle, type RessourceCategory, type RessourceIssue, type RessourceStatus,
} from './types'

export interface RessourceSourceFile {
  /** Chemin relatif à la racine du dépôt. */
  path: string
  raw: string
}

export interface RessourceCorpus {
  categories: RessourceCategory[]
  articles: RessourceArticle[]
}

export interface RessourceLoadResult extends RessourceCorpus {
  issues: RessourceIssue[]
  warnings: string[]
}

export const RESSOURCES_PREFIX = '/ressources'
export const articlePath = (slug: string) => `${RESSOURCES_PREFIX}/${slug}`

const REQUIRED = ['id', 'slug', 'category', 'status', 'priority', 'h1', 'seoTitle', 'metaDescription', 'intent', 'boundary', 'related', 'reviewOwner', 'revision', 'revisionNote'] as const
const OPTIONAL = ['reviewedAt', 'publishedAt', 'updatedAt', 'redirectFrom', 'archive'] as const
const KNOWN = new Set<string>([...REQUIRED, ...OPTIONAL])

const ID = /^[A-Z]\d{2}$/
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const DATE = /^\d{4}-\d{2}-\d{2}$/
/** Liens internes admis hors Ressources : accueil, Centre d'aide (NAV-06). */
const OTHER_INTERNAL = /^\/(?:$|aide(?:\/[a-z0-9-]+)?$)/

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[’']/g, ' ').replace(/\|\s*verebona\s*$/, '').replace(/[^a-z0-9]+/g, ' ').trim()

/** Proximité de deux titres (Jaccard sur les mots de plus de 3 lettres). */
export function titleSimilarity(a: string, b: string): number {
  const w = (s: string) => new Set(norm(s).split(' ').filter((x) => x.length > 3))
  const x = w(a)
  const y = w(b)
  if (!x.size || !y.size) return 0
  let inter = 0
  for (const t of x) if (y.has(t)) inter++
  return inter / (x.size + y.size - inter)
}

/** Seuil d'alerte « titre proche » (ADM-03). */
export const NEAR_TITLE_THRESHOLD = 0.6

function parseArchive(v: string | null): ArchiveDecision | null | 'invalid' {
  if (v === null || v === '') return null
  if (v === '410') return { kind: 'gone' }
  const m = /^301:([A-Z]\d{2})$/.exec(v)
  return m ? { kind: 'redirect', to: m[1] } : 'invalid'
}

export function loadRessources(files: RessourceSourceFile[], categoriesJson: unknown): RessourceLoadResult {
  const issues: RessourceIssue[] = []
  const warnings: string[] = []
  const issue = (source: string, articleId: string | null, field: string, message: string) =>
    issues.push({ source, articleId, field, message })

  // ── Catégories ──────────────────────────────────────────────────────────
  const categories: RessourceCategory[] = []
  if (!Array.isArray(categoriesJson)) {
    issue('categories.json', null, 'categories', 'Liste de catégories attendue.')
  } else {
    for (const c of categoriesJson as Array<Record<string, unknown>>) {
      if (typeof c?.slug !== 'string' || !SLUG.test(c.slug) || typeof c.name !== 'string' || typeof c.intro !== 'string' || typeof c.order !== 'number') {
        issue('categories.json', null, 'categories', `Catégorie mal formée : ${JSON.stringify(c)}.`)
        continue
      }
      categories.push({ slug: c.slug, name: c.name, intro: c.intro, order: c.order })
    }
  }
  const catSlugs = new Set(categories.map((c) => c.slug))

  // ── Articles ────────────────────────────────────────────────────────────
  const articles: RessourceArticle[] = []
  for (const f of files) {
    const { data, body, errors } = parseFrontmatter(f.raw)
    const fileId = /([A-Z]\d{2})\.md$/.exec(f.path)?.[1] ?? null
    errors.forEach((e) => issue(f.path, fileId, 'frontmatter', e))
    for (const k of Object.keys(data)) if (!KNOWN.has(k)) issue(f.path, fileId, k, `Métadonnée inconnue « ${k} ».`)

    const str = (k: string): string | null => {
      const v: FrontmatterValue | undefined = data[k]
      if (v === undefined) return null
      if (typeof v !== 'string') { issue(f.path, fileId, k, `« ${k} » doit être un texte.`); return null }
      return v.trim()
    }
    const list = (k: string): string[] => {
      const v = data[k]
      if (v === undefined) return []
      if (!Array.isArray(v)) { issue(f.path, fileId, k, `« ${k} » doit être une liste [a, b].`); return [] }
      return v
    }
    for (const k of REQUIRED) if (data[k] === undefined || data[k] === '') issue(f.path, fileId, k, `Métadonnée obligatoire « ${k} » absente.`)

    const id = str('id') ?? ''
    if (id && !ID.test(id)) issue(f.path, id, 'id', `Identifiant « ${id} » invalide (lettre + deux chiffres).`)
    if (id && fileId && id !== fileId) issue(f.path, id, 'id', `Le fichier doit s'appeler ${id}.md.`)
    const slug = str('slug') ?? ''
    if (slug && !SLUG.test(slug)) issue(f.path, id, 'slug', `Slug « ${slug} » invalide : minuscules ASCII, chiffres et tirets.`)
    const status = (str('status') ?? 'draft') as RessourceStatus
    if (!RESSOURCE_STATUSES.includes(status)) issue(f.path, id, 'status', `Statut « ${status} » inconnu (${RESSOURCE_STATUSES.join(', ')}).`)
    const category = str('category') ?? ''
    if (category && !catSlugs.has(category)) issue(f.path, id, 'category', `Catégorie « ${category} » absente de categories.json.`)
    const priority = str('priority') ?? ''
    if (priority && !/^P[12]$/.test(priority)) issue(f.path, id, 'priority', 'Priorité P1 ou P2.')
    const date = (k: string) => {
      const v = str(k)
      if (v && !DATE.test(v)) issue(f.path, id, k, `« ${k} » au format AAAA-MM-JJ.`)
      return v || null
    }
    const reviewedAt = date('reviewedAt')
    const publishedAt = date('publishedAt')
    const updatedAt = date('updatedAt')
    const revisionRaw = str('revision') ?? ''
    const revision = Number(revisionRaw)
    if (revisionRaw && (!Number.isInteger(revision) || revision < 1)) issue(f.path, id, 'revision', 'Révision : entier ≥ 1.')
    const archiveRaw = str('archive')
    const archive = parseArchive(archiveRaw)
    if (archive === 'invalid') issue(f.path, id, 'archive', '« archive » : 410 ou 301:<ID>.')
    const redirectFrom = list('redirectFrom')
    for (const r of redirectFrom) {
      if (!SLUG.test(r)) issue(f.path, id, 'redirectFrom', `Ancien slug « ${r} » invalide (slug seul, sans /ressources/).`)
    }

    const parsed = parseRessourceBody(body)
    parsed.errors.forEach((e) => issue(f.path, id, 'body', e))

    articles.push({
      id, slug, path: articlePath(slug), category, status, priority,
      h1: str('h1') ?? '', seoTitle: str('seoTitle') ?? '', metaDescription: str('metaDescription') ?? '',
      intent: str('intent') ?? '', boundary: str('boundary') ?? '',
      intro: parsed.intro, sections: parsed.sections, checklist: parsed.checklist, example: parsed.example,
      faq: parsed.faq, cta: parsed.cta, sources: parsed.sources,
      related: list('related'), reviewedAt, publishedAt, updatedAt,
      reviewOwner: str('reviewOwner') ?? '', revision: Number.isInteger(revision) ? revision : 0,
      revisionNote: str('revisionNote') ?? '', redirectFrom: redirectFrom.map(articlePath),
      archive: archive === 'invalid' ? null : archive,
      source: f.path,
    })
  }

  // ── Contrôles croisés ───────────────────────────────────────────────────
  const byId = new Map<string, RessourceArticle>()
  const unique = (field: 'id' | 'slug' | 'h1' | 'seoTitle' | 'metaDescription' | 'intent', label: string) => {
    const seen = new Map<string, RessourceArticle>()
    for (const a of articles) {
      const v = field === 'slug' || field === 'id' ? a[field] : norm(a[field])
      if (!v) continue
      const other = seen.get(v)
      if (other) issue(a.source, a.id, field, `${label} déjà utilisé par ${other.id} — publication bloquée (ADM-03).`)
      else seen.set(v, a)
    }
  }
  unique('id', 'Identifiant')
  unique('slug', 'Slug')
  unique('h1', 'H1')
  unique('seoTitle', 'Title SEO')
  unique('metaDescription', 'Meta description')
  unique('intent', 'Intention principale')
  for (const a of articles) if (a.id) byId.set(a.id, a)

  // Ancien slug repris par un autre article, ou égal à un slug actif.
  const allPaths = new Map<string, string>()
  for (const a of articles) allPaths.set(a.path, a.id)
  const redirectSeen = new Map<string, string>()
  for (const a of articles) {
    for (const r of a.redirectFrom) {
      if (allPaths.has(r)) issue(a.source, a.id, 'redirectFrom', `${r} est l'URL active de ${allPaths.get(r)} : une seule URL par page (NAV-03).`)
      if (redirectSeen.has(r)) issue(a.source, a.id, 'redirectFrom', `${r} déjà redirigé par ${redirectSeen.get(r)}.`)
      redirectSeen.set(r, a.id)
    }
  }

  // Titres proches (alerte seulement, ADM-03).
  for (let i = 0; i < articles.length; i++) {
    for (let j = i + 1; j < articles.length; j++) {
      const s = titleSimilarity(articles[i].h1, articles[j].h1)
      if (s >= NEAR_TITLE_THRESHOLD) warnings.push(`Titres proches ${articles[i].id} / ${articles[j].id} (${Math.round(s * 100)} %) : vérifier l'intention propriétaire (§5).`)
    }
  }

  const pathOk = (href: string) => {
    if (href.startsWith(`${RESSOURCES_PREFIX}/`)) return allPaths.has(href.split('#')[0])
    return OTHER_INTERNAL.test(href.split('#')[0])
  }

  for (const a of articles) {
    const at = (field: string, msg: string) => issue(a.source, a.id, field, msg)
    if (a.intro.length === 0) at('body', 'Introduction absente : la réponse doit venir avant le premier intertitre (ED-01).')
    if (a.sections.length === 0) at('body', 'Aucune section de fond.')
    if (a.checklist.length === 0) at('body', '« Checklist pratique » absente (§17).')
    // « Exemple concret » : facultatif depuis la révision V7 (lot 54). C01 et
    // O03 portent leur exemple chiffré dans une section « Exemple … » titrée ;
    // E02 n'en a plus. La règle §17 reste vérifiée en test pour les 28 autres.
    if (a.faq.length > 2) at('body', `FAQ : ${a.faq.length} questions, deux au plus (§17).`)
    if (a.cta.length === 0) at('body', '« Et avec Verebona ? » absent (§17).')
    for (const s of a.sources) if (!s.url.startsWith('https://')) at('sources', `Source non HTTPS : ${s.url} (SEC-06).`)

    const liens = [
      ...linksOfBlocks(a.intro), ...a.sections.flatMap((s) => linksOfBlocks(s.blocks)),
      ...linksOfBlocks(a.example), ...a.faq.flatMap((f) => linksOfBlocks(f.answer)), ...linksOfBlocks(a.cta),
      ...a.checklist.flat().filter((i) => i.kind === 'link').map((i) => (i as { href: string }).href),
    ]
    for (const href of liens) {
      if (href.startsWith('/')) { if (!pathOk(href)) at('body', `Lien interne cassé : ${href} (SEO-08).`) }
      else if (!href.startsWith('https://')) at('body', `Lien externe non HTTPS ou mal formé : ${href} (SEC-06).`)
    }

    if (a.related.length < 2 || a.related.length > 3) at('related', `${a.related.length} article(s) lié(s) : deux ou trois attendus (§7).`)
    for (const r of a.related) {
      if (r === a.id) at('related', 'Un article ne peut pas se lier à lui-même.')
      else if (!byId.has(r)) at('related', `Article lié inconnu : ${r}.`)
    }

    if (a.status === 'published') {
      if (!a.reviewedAt) at('reviewedAt', 'Article publié sans date de revue des sources (ADM-08, ED-09).')
      // `publishedAt` = date de PREMIÈRE MISE EN LIGNE EFFECTIVE en production :
      // elle n'est connue qu'au déploiement et ne doit jamais être anté-datée
      // (ticket lot 54). Absente, la page n'expose ni datePublished ni
      // dateModified ; le build de production le signale (vite.config.ts).
      if (!a.reviewOwner) at('reviewOwner', 'Article publié sans responsable de mise à jour.')
      if (a.sources.length === 0) at('sources', 'Article publié sans source officielle (ADM-08) — publication refusée.')
      if (a.archive) at('archive', 'Un article publié ne porte pas de décision d’archivage.')
      for (const r of a.related) {
        const o = byId.get(r)
        if (o && o.status !== 'published') at('related', `Lié à ${r}, qui n'est pas publié : lien mort en production.`)
      }
      if (a.updatedAt && a.publishedAt && a.updatedAt < a.publishedAt) at('updatedAt', 'Mise à jour antérieure à la publication.')
    }
    if (a.status === 'archived') {
      if (!a.archive) at('archive', 'Article archivé sans décision 410 ou 301:<ID> (ADM-07).')
      if (a.archive?.kind === 'redirect') {
        const t = byId.get(a.archive.to)
        if (!t || t.status !== 'published') at('archive', `Redirection vers ${a.archive.to}, qui n'est pas un article publié.`)
        if (t?.archive) at('archive', 'Chaîne de redirections interdite (§10).')
      }
      for (const o of articles) {
        if (o.status === 'published' && o.related.includes(a.id)) issue(o.source, o.id, 'related', `Lié à ${a.id}, archivé : retirer le lien.`)
      }
    } else if (a.archive) {
      at('archive', 'Décision d’archivage sur un article non archivé.')
    }
  }

  categories.sort((x, y) => x.order - y.order)
  articles.sort((x, y) => x.id.localeCompare(y.id))
  return { categories, articles, issues, warnings }
}

export function formatRessourceIssues(issues: RessourceIssue[]): string {
  return issues.map((i) => `  · ${i.source}${i.articleId ? ` [${i.articleId}]` : ''} — ${i.field} : ${i.message}`).join('\n')
}
