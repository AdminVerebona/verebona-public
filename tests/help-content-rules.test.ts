// @vitest-environment node
/**
 * Lot 105P — règles de contenu BLOQUANTES du Centre d'aide
 * (`src/help/content-rules.ts`, appliquées par `loadCorpus` au build et ici).
 *
 * Interdits dans un article PUBLIÉ : vidéo « 500 Mo », push Web / navigateur /
 * PWA / « ajouter à l'écran d'accueil », 2FA / MFA / TOTP / SMS, jargon
 * interne (« V2 », « selon le déploiement », « dans la cible », « recette »,
 * « ticket »). Les cas d'échec modifient UNE copie en mémoire.
 */
import { describe, expect, it } from 'vitest'
import { readHelpSources } from '../help.build'
import { loadCorpus } from '../src/help/corpus'
import { publishedArticles } from '../src/help/outputs'
import { linksOf } from '../src/help/markdown'
import { CONTENT_RULE_EXCEPTIONS, CONTENT_RULES, checkContentRules, type ContentRuleException } from '../src/help/content-rules'

const { files, categories } = readHelpSources(process.cwd())
const corpus = loadCorpus(files, categories)

function withRaw(id: string, edit: (raw: string) => string, exceptions?: readonly ContentRuleException[]) {
  const patched = files.map((f) => (f.path.endsWith(`/${id}.md`) ? { ...f, raw: edit(f.raw) } : f))
  return loadCorpus(patched, categories, exceptions).issues
}
const addBody = (sentence: string) => (raw: string) => `${raw.trimEnd()}\n\n${sentence}\n`
const lot105 = (issues: ReturnType<typeof withRaw>) => issues.filter((i) => i.message.includes('lot 105P'))

describe('Lot 105P — corpus réel', () => {
  it('aucun article publié n’enfreint les règles (build vert)', () => {
    expect(corpus.issues).toEqual([])
  })

  it('les 14 articles faux sont bloqués avec un motif explicite (17 bloqués au total) ; aucun n’est publié en production', () => {
    // 8 détectés par les règles + 6 bloqués sur décision PO du 02/11/2026 (faits faux,
    // audit docs/aide/audit-2026-11-02.md) + 3 bloqués avant le lot 105P.
    const bloques = corpus.articles.filter((a) => a.status === 'blocked').map((a) => a.id).sort()
    expect(bloques).toEqual([
      'AID-BILL-008', 'AID-DOC-003', 'AID-DOC-006', 'AID-DOC-009', 'AID-HELP-001', 'AID-HELP-004', 'AID-HELP-007', 'AID-HELP-013',
      'AID-NOTIF-001', 'AID-NOTIF-002', 'AID-NOTIF-004', 'AID-NOTIF-005', 'AID-SEARCH-001', 'AID-SEARCH-002', 'AID-START-005',
      'AID-TODO-002', 'AID-TRANSFER-006',
    ])
    for (const a of corpus.articles.filter((x) => x.status === 'blocked')) {
      expect(a.blocker, a.id).toBeTruthy()
      expect(a.validatedAt, a.id).toBeNull()
    }
  })

  it('aucun lien mort : en production, les « related » rendus ne gardent que des articles publiés', () => {
    // La page ne reçoit que les articles publiés (`virtual:help-center`) et
    // `useHelpCenter().related` écarte les ID absents : un lié bloqué disparaît.
    const publies = new Map(publishedArticles(corpus, 'production').map((a) => [a.id, a]))
    for (const a of publies.values()) {
      const rendus = a.relatedArticles.map((id) => publies.get(id)).filter(Boolean)
      for (const r of rendus) expect(r!.status, `${a.id} → ${r!.id}`).toBe('published')
    }
    // Et aucun lien du CORPS d'un article publié ne mène à un article bloqué.
    const bloques = new Set(corpus.articles.filter((a) => a.status !== 'published').map((a) => a.canonical))
    for (const a of publies.values()) for (const href of linksOf(a.blocks)) expect(bloques.has(href.split('#')[0]), `${a.id} → ${href}`).toBe(false)
  })

  it('toutes les règles citent le code de l’application qui fait foi', () => {
    for (const r of CONTENT_RULES) expect(r.reference.length, r.id).toBeGreaterThan(40)
    expect(CONTENT_RULES.find((r) => r.id === 'video-500-mo')!.reference).toMatch(/100 Mo par vidéo/)
  })
})

describe('Lot 105P — tests négatifs : refus au build', () => {
  const cas: Array<[string, string]> = [
    ['vidéo 500 Mo', 'Les vidéos sont acceptées jusqu’à 500 Mo.'],
    ['vidéo 500 MB', 'Taille maximale : 500 MB par vidéo.'],
    ['push Web', 'Activez le web push pour être prévenu.'],
    ['PWA', 'Installez la PWA Verebona.'],
    ['écran d’accueil', 'Ajoutez Verebona à l’écran d’accueil de votre iPhone.'],
    ['push + navigateur', 'Autorisez les notifications dans votre navigateur.'],
    ['navigateur + push', 'Le navigateur doit accepter le push.'],
    ['2FA', 'Activez la 2FA depuis Mon compte.'],
    ['MFA', 'Le MFA protège votre compte.'],
    ['TOTP', 'Saisissez le code TOTP.'],
    ['SMS', 'Un code de connexion vous est envoyé par SMS.'],
    ['double authentification', 'Activez la double authentification.'],
    ['deux facteurs', 'Verebona propose une authentification à deux facteurs.'],
    ['V2', 'La V2 apporte des filtres.'],
    ['selon le déploiement', 'Cette fonction est disponible selon le déploiement.'],
    ['dans la cible', 'Ce parcours existe dans la cible.'],
    ['recette', 'Ce comportement est validé en recette.'],
    ['ticket', 'Voir le ticket correspondant.'],
  ]
  for (const [nom, phrase] of cas) {
    it(`refuse : ${nom}`, () => {
      const issues = lot105(withRaw('AID-DOC-001', addBody(phrase)))
      expect(issues.length, nom).toBeGreaterThan(0)
      expect(issues[0].articleId).toBe('AID-DOC-001')
      expect(issues[0].field).toBe('content')
      expect(issues[0].message).toContain(`« ${phrase} »`)
    })
  }

  it('contrôle aussi le titre, le résumé, la meta description, les tags et les synonymes', () => {
    const edits: Array<(raw: string) => string> = [
      (r) => r.replace(/^title: .*$/m, 'title: Ajouter un document (V2)'),
      (r) => r.replace(/^summary: .*$/m, 'summary: Importer des vidéos jusqu’à 500 Mo.'),
      (r) => r.replace(/^metaDescription: .*$/m, 'metaDescription: Activez la 2FA.'),
      (r) => r.replace(/^seoTitle: .*$/m, 'seoTitle: Notifications du navigateur | Aide Verebona'),
      (r) => r.replace(/^tags: \[/m, 'tags: [pwa, PWA, '),
      (r) => r.replace(/^synonyms: \[/m, 'synonyms: [totp, TOTP, '),
    ]
    for (const e of edits) expect(lot105(withRaw('AID-DOC-001', e)).length).toBeGreaterThan(0)
  })

  it('un article bloqué n’est pas contrôlé (il n’est pas publié en production)', () => {
    expect(lot105(withRaw('AID-START-005', addBody('Activez la 2FA.')))).toEqual([])
  })
})

describe('Lot 105P — faux positifs gérables', () => {
  it('formulations correctes acceptées', () => {
    for (const ok of [
      'Ajoutez un ticket de caisse ou une facture.',
      'Les notifications push sont disponibles dans les applications iOS et Android.',
      'Évitez un ancien mot de passe enregistré par le navigateur.',
      'Vidéos : 100 Mo maximum ; documents : 25 Mo.',
      'Version V1 de l’application.',
      'Les appareils et navigateurs connectés sont déconnectés.',
    ]) {
      expect(checkContentRules('AID-DOC-001', ok).findings.map((f) => f.rule.id), ok).toEqual([])
    }
  })

  it('une exception documentée masque la phrase, et seulement elle', () => {
    const phrase = 'Indiquez le navigateur utilisé pour un problème de notification.'
    const ex: ContentRuleException = { articleId: 'AID-DOC-001', rule: 'push-web', excerpt: 'navigateur utilisé pour un problème de notification', reason: 'test' }
    expect(lot105(withRaw('AID-DOC-001', addBody(phrase), [...CONTENT_RULE_EXCEPTIONS, ex]))).toEqual([])
    expect(lot105(withRaw('AID-DOC-001', addBody(`${phrase} Activez la 2FA.`), [...CONTENT_RULE_EXCEPTIONS, ex])).length).toBe(1)
  })

  it('une exception devenue inutile fait échouer le build', () => {
    const ex: ContentRuleException = { articleId: 'AID-DOC-001', rule: 'push-web', excerpt: 'phrase disparue', reason: 'test' }
    const issues = loadCorpus(files, categories, [...CONTENT_RULE_EXCEPTIONS, ex]).issues
    expect(issues.map((i) => i.message).join('\n')).toMatch(/Exception « push-web » inutile/)
  })

  it('l’exception existante (AID-HELP-011, conseil au support) est bien utilisée', () => {
    const a = files.find((f) => f.path.endsWith('/AID-HELP-011.md'))!
    expect(a.raw).toContain(CONTENT_RULE_EXCEPTIONS[0].excerpt)
  })
})
