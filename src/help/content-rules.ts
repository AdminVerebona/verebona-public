/**
 * Règles de contenu BLOQUANTES du Centre d'aide — lot 105P (ticket « Centre
 * d'aide — mise à jour exhaustive », §2 et §3 P0).
 *
 * ══════════════════════════════════════════════════════════════════════════
 * POURQUOI ICI
 *
 * Un seul endroit pour les formulations interdites dans un article PUBLIÉ :
 * le validateur (`corpus.ts`) les applique au build (`vite.config.ts`, via
 * `help.build.ts`) et en test, sur le corpus réel. Un article bloqué
 * (`status: blocked`) n'est pas publié en production : il peut encore porter
 * l'ancien texte en attendant sa correction.
 *
 * Chaque règle cite le code de l'APPLICATION qui fait foi (dépôt
 * verebona-app, branche d'intégration du lot 104) : quand l'application
 * change, on change la règle ici, pas article par article.
 *
 * TEXTE CONTRÔLÉ : tout ce qu'un lecteur ou l'Assistant voit — corps, titre,
 * résumé, title SEO, meta description, libellés de rôle et d'offre, tags et
 * synonymes (publiés dans le JSON-LD et le corpus de l'Assistant). Pas les
 * identifiants ni les clés techniques.
 *
 * FAUX POSITIFS : une phrase correcte qui déclenche une règle s'ajoute à
 * `CONTENT_RULE_EXCEPTIONS` avec l'ID de l'article, la règle, un extrait
 * EXACT de la phrase et la raison. Une exception devenue inutile (extrait
 * disparu, ou qui ne déclenche plus la règle) fait elle-même échouer le
 * build : la liste ne peut pas grossir en silence.
 * ══════════════════════════════════════════════════════════════════════════
 */

export type ContentRuleId = 'video-500-mo' | 'push-web' | 'double-authentification' | 'jargon-interne'

export interface ContentRule {
  id: ContentRuleId
  /** Libellé court, repris dans le message de build. */
  label: string
  /** Ce qui est vrai aujourd'hui, et où l'application le décide. */
  reference: string
  patterns: RegExp[]
}

export const CONTENT_RULES: readonly ContentRule[] = [
  {
    id: 'video-500-mo',
    label: 'ancienne limite vidéo « 500 Mo »',
    reference:
      'Limites réelles (verebona-app src/lib/upload-limits.ts) : 25 Mo par document, 100 Mo par vidéo, '
      + '10 fichiers et 100 Mo au total par dépôt.',
    patterns: [/\b500\s?(?:Mo|MB|Mio)\b/i],
  },
  {
    id: 'push-web',
    label: 'notification push Web / navigateur / PWA',
    reference:
      'Push uniquement dans les applications iOS et Android (verebona-app src/lib/notifications/channels.ts, '
      + 'lot 94 : Web Push supprimé ; src/components/ServiceWorkerRegistration.tsx : aucune demande de permission).',
    patterns: [
      /\bweb\s?push\b|\bpush\s+(?:web|navigateur|du\s+navigateur)\b/i,
      /\bPWA\b/,
      /(?:ajout(?:er|ez)?|install(?:er|ez)?)[^.!?\n]{0,40}écran\s+d['’]accueil/i,
      // Dans une même phrase : push / notification ET navigateur.
      /\b(?:push|notifications?)\b[^.!?\n]{0,80}\bnavigateurs?\b|\bnavigateurs?\b[^.!?\n]{0,80}\b(?:push|notifications?)\b/i,
    ],
  },
  {
    id: 'double-authentification',
    label: 'double authentification (2FA / MFA / TOTP / SMS)',
    reference:
      'Aucune double authentification en V1 : connexion par mot de passe, Google ou Apple '
      + '(verebona-app src/lib/auth/oauth/providers.ts) ; aucun code TOTP ni SMS.',
    patterns: [
      /\b(?:2FA|A2F|MFA|TOTP|OTP)\b/,
      /double\s+authentification|authentification\s+(?:forte|à\s+deux\s+facteurs|multi-?facteurs?)|\b(?:deux|2)\s+facteurs\b/i,
      /\bSMS\b|\btexto\b|application\s+d['’]authentification|\bauthenticator\b/i,
    ],
  },
  {
    id: 'jargon-interne',
    label: 'jargon interne (« V2 », « selon le déploiement », « dans la cible », « recette », « ticket »)',
    reference: 'Texte public : fonctions réellement disponibles, sans vocabulaire de projet.',
    patterns: [
      /\bV[2-9]\b/,
      /selon\s+(?:le|la)\s+(?:déploiement|mise\s+en\s+production)|déploiement\s+actif/i,
      /\bdans\s+la\s+cible\b|\brègle\s+cible\b|\bcible\s+produit\b/i,
      /\brecettes?\b/i,
      // « ticket de caisse » (un document) reste permis.
      /\btickets?\b(?!\s+(?:de\s+caisse|d['’]achat|restaurant|de\s+carte))/i,
    ],
  },
]

export interface ContentRuleException {
  articleId: string
  rule: ContentRuleId
  /** Extrait EXACT de la phrase concernée. */
  excerpt: string
  reason: string
}

/**
 * Faux positifs acceptés. Garder la liste courte ; chaque entrée est
 * vérifiée (l'extrait doit exister ET déclencher encore la règle).
 */
export const CONTENT_RULE_EXCEPTIONS: readonly ContentRuleException[] = [
  {
    articleId: 'AID-HELP-011',
    rule: 'push-web',
    excerpt: 'le type d’appareil/navigateur pour un problème d’affichage ou de notification',
    reason: 'Conseil au support : le navigateur sert au diagnostic d’affichage, l’appareil à celui des notifications. Aucune promesse de push Web.',
  },
  // Lot 108P (03/11/2026, ticket TCO « Alignement documentaire ») : texte PO
  // repris fidèlement ; « ticket » y désigne le ticket de caisse (justificatif
  // de carburant, de péage, total d’une facture multi-articles), pas un ticket
  // de projet.
  ...([
    ['AID-ASSET-009', 'distinguant le prix des articles concernés du total du ticket'],
    ['AID-ASSET-009', 'Que se passe-t-il si j’ajoute ensuite des tickets ?'],
    ['AID-ASSET-009', '40 € de tickets réellement enregistrés'],
    ['AID-ASSET-009', 'Si les tickets du mois atteignent 140 €'],
    ['AID-ASSET-009', 'Les tickets restent consultables et ne sont pas effacés.'],
    ['AID-DOC-004', 'ne doit pas attribuer automatiquement le total du ticket à un seul objet'],
  ] as const).map(([articleId, excerpt]): ContentRuleException => ({
    articleId,
    rule: 'jargon-interne',
    excerpt,
    reason: '« ticket » au sens de ticket de caisse (justificatif de dépense), texte du PO repris à l’identique (lot 108P).',
  })),
]

export interface ContentRuleFinding {
  rule: ContentRule
  /** Phrase fautive, telle qu'écrite. */
  sentence: string
}

/** Découpe en phrases (fin de phrase ou ligne) — assez fin pour citer. */
export function sentencesOf(text: string): string[] {
  return text
    .split(/\n+|(?<=[.!?])\s+/)
    .map((s) => s.replace(/\*\*/g, '').trim())
    .filter(Boolean)
}

/**
 * Phrases d'un texte qui enfreignent une règle, exceptions déduites. Rend
 * aussi les exceptions effectivement utilisées (pour signaler les autres).
 */
export function checkContentRules(
  articleId: string,
  text: string,
  exceptions: readonly ContentRuleException[] = CONTENT_RULE_EXCEPTIONS,
): { findings: ContentRuleFinding[]; usedExceptions: Set<ContentRuleException> } {
  const findings: ContentRuleFinding[] = []
  const usedExceptions = new Set<ContentRuleException>()
  const mine = exceptions.filter((e) => e.articleId === articleId)
  for (const sentence of sentencesOf(text)) {
    for (const rule of CONTENT_RULES) {
      if (!rule.patterns.some((p) => p.test(sentence))) continue
      const ex = mine.find((e) => e.rule === rule.id && sentence.includes(e.excerpt))
      if (ex) { usedExceptions.add(ex); continue }
      findings.push({ rule, sentence })
    }
  }
  return { findings, usedExceptions }
}

/** Phrase raccourcie pour un message de build lisible. */
export function quote(sentence: string, max = 180): string {
  return sentence.length > max ? `${sentence.slice(0, max - 1)}…` : sentence
}
