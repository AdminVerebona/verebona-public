/**
 * Corpus interrogeable des Ressources pour l'assistant de l'application —
 * chantier 108J (ticket « Suggestions de l'accueil et de T2 »).
 *
 * ══════════════════════════════════════════════════════════════════════════
 * POURQUOI
 *
 * L'assistant de l'application (T2) lisait seulement `/aide/corpus-t2.json`
 * (Centre d'aide). Les questions de DÉCOUVERTE (« Pourquoi conserver les
 * factures de travaux ? ») doivent être répondues à partir des articles
 * Ressources, cités avec un lien vers l'article précis. Ce module publie,
 * AU BUILD et depuis les MÊMES fichiers Markdown que les pages (aucune copie
 * manuelle), `/ressources/corpus-t2.json` :
 *
 *   · identifiant stable (A01, E01…), titre (H1), chemin et URL canonique ;
 *   · statut (`published` seulement : un brouillon, un article en relecture
 *     prévisualisé en préproduction, ou archivé, n'est JAMAIS une source) ;
 *   · révision et dates éditoriales (version de l'article) ;
 *   · environnement du build (ENV-02 : l'application de préproduction refuse
 *     un corpus de production, et inversement) ;
 *   · version du corpus (empreinte déterministe des sources) ;
 *   · texte utile, découpé en sections citables (réponse immédiate,
 *     intertitres, liste de contrôle, questions fréquentes).
 *
 * Fonctions PURES : aucun accès disque ni réseau (le build lit les fichiers
 * via `ressources.build.ts`). Aucun texte d'article n'est modifié ni ajouté.
 * ══════════════════════════════════════════════════════════════════════════
 */
import type { HelpEnvironment } from '../help/outputs'
import type { RessourceCorpus } from './corpus'
import type { Inline, RessourceArticle, RessourceBlock } from './types'

/** Chemin publié (servi par server.cjs sans authentification, comme les données d'aide). */
export const RESSOURCES_T2_CORPUS_PATH = '/ressources/corpus-t2.json'
export const RESSOURCES_T2_SCHEMA = 'verebona-ressources-t2-v1' as const

export interface RessourceT2Section {
  /** Ancre stable dans la page (`presentation` pour la réponse immédiate). */
  anchor: string
  heading: string
  text: string
}

export interface RessourceT2Article {
  /** Identifiant immuable de l'article (A01, E01…). */
  id: string
  title: string
  /** `/ressources/<slug>`, à résoudre sur l'origine du site de l'environnement lecteur. */
  path: string
  /** URL canonique de production, pour information. */
  canonicalUrl: string
  category: string
  categoryName: string
  /** Toujours `published` (seuls les articles publiés sont des sources). */
  status: 'published'
  /** Révision éditoriale de l'article (version). */
  revision: number
  reviewedAt: string | null
  publishedAt: string | null
  updatedAt: string | null
  /** Réponse immédiate résumée (méta-description). */
  summary: string
  /** Intention principale (mots de recherche). */
  intent: string
  sections: RessourceT2Section[]
}

export interface RessourcesT2Corpus {
  schema: typeof RESSOURCES_T2_SCHEMA
  version: string
  environment: HelpEnvironment
  generatedAt: string
  articles: RessourceT2Article[]
}

function inlineText(inlines: Inline[]): string {
  return inlines.map((i) => i.text).join('').replace(/\s+/g, ' ').trim()
}

/** Texte brut d'un bloc (paragraphe, liste à puces, tableau ligne par ligne). */
export function blockText(b: RessourceBlock): string {
  if (b.kind === 'paragraph') return inlineText(b.inlines)
  if (b.kind === 'list') return b.items.map((it) => `- ${inlineText(it)}`).join('\n')
  return [b.head.join(' | '), ...b.rows.map((r) => r.join(' | '))].join('\n')
}

const blocksText = (blocks: RessourceBlock[]) => blocks.map(blockText).filter(Boolean).join('\n')

/** Sections citables d'un article, dans l'ordre de la page. */
export function ressourceSections(a: RessourceArticle): RessourceT2Section[] {
  const out: RessourceT2Section[] = []
  const intro = blocksText(a.intro)
  if (intro) out.push({ anchor: 'presentation', heading: a.h1, text: intro })
  for (const s of a.sections) {
    const text = blocksText(s.blocks)
    if (text) out.push({ anchor: s.anchor, heading: s.heading, text })
  }
  if (a.checklist.length) {
    out.push({ anchor: 'checklist', heading: 'Liste de contrôle', text: a.checklist.map((it) => `- ${inlineText(it)}`).join('\n') })
  }
  a.faq.forEach((f, i) => {
    const text = blocksText(f.answer)
    if (text) out.push({ anchor: `faq-${i + 1}`, heading: f.question, text })
  })
  return out
}

/**
 * Version du corpus : empreinte déterministe des sources (catégories et
 * articles publiés), préfixée du commit déployé s'il est connu — une
 * modification ou un retrait d'article change la version.
 */
export function ressourcesContentVersion(articles: RessourceT2Article[], categories: RessourceCorpus['categories'], commit: string | null): string {
  const text = JSON.stringify(categories) + articles.map((a) => JSON.stringify(a)).join('')
  let h1 = 0x811c9dc5
  let h2 = 0
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i)
    h1 = Math.imul(h1 ^ c, 16777619) >>> 0
    h2 = (Math.imul(h2, 31) + c) >>> 0
  }
  const hash = h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0')
  return commit ? `${commit.slice(0, 12)}-${hash.slice(0, 8)}` : `contenu-${hash}`
}

/**
 * Corpus de l'assistant : articles PUBLIÉS uniquement, quel que soit
 * l'environnement (la préproduction prévisualise aussi `review` et
 * `approved` dans ses pages, mais ce ne sont pas des sources).
 */
export function buildRessourcesT2Corpus(
  corpus: RessourceCorpus,
  env: HelpEnvironment,
  opts: { siteOrigin: string; commit: string | null; generatedAt: string },
): RessourcesT2Corpus {
  const catName = new Map(corpus.categories.map((c) => [c.slug, c.name]))
  const origin = opts.siteOrigin.replace(/\/+$/, '')
  const articles: RessourceT2Article[] = corpus.articles
    .filter((a) => a.status === 'published')
    .map((a) => ({
      id: a.id,
      title: a.h1,
      path: a.path,
      canonicalUrl: `${origin}${a.path}`,
      category: a.category,
      categoryName: catName.get(a.category) ?? a.category,
      status: 'published' as const,
      revision: a.revision,
      reviewedAt: a.reviewedAt,
      publishedAt: a.publishedAt,
      updatedAt: a.updatedAt,
      summary: a.metaDescription,
      intent: a.intent,
      sections: ressourceSections(a),
    }))
  return {
    schema: RESSOURCES_T2_SCHEMA,
    version: ressourcesContentVersion(articles, corpus.categories, opts.commit),
    environment: env,
    generatedAt: opts.generatedAt,
    articles,
  }
}
