/**
 * Rubrique « Légal » du site public — logique UNIQUE (chantier 104P, P0-A / P0-B).
 *
 * Module JavaScript pur (Node), sans dépendance : il est importé par
 *   · `vite.config.ts`              (module `virtual:legal` des pages) ;
 *   · `scripts/publish-legal.mjs`   (copie des textes figés + manifeste, au build) ;
 *   · `scripts/check-legal-texts.mjs` (contrôle bloquant, dernier maillon du build) ;
 *   · `scripts/import-cguv-archive.mjs`, `scripts/legal-*.mjs` (procédures du PO) ;
 *   · les tests (`tests/l104p-*.test.ts`).
 * Un seul code lit les sources et produit le manifeste : les pages, les
 * fichiers figés et `versions.json` viennent forcément des mêmes données.
 *
 * Contrat d'interface (fait foi) : dépôt verebona-app,
 * `docs/exploitation/contrat-site-public-legal.md`.
 *
 * AUCUN TEXTE JURIDIQUE ICI : les textes sont fournis par le PO et collés tels
 * quels dans `src/content/legal/` (voir le README de ce dossier).
 */
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

/* ── Constantes ─────────────────────────────────────────────────────────── */

export const LEGAL_CONTENT_DIR = 'src/content/legal'
export const CGUV_VERSIONS_DIR = `${LEGAL_CONTENT_DIR}/cguv/versions`
export const CGUV_LOCK_FILE = `${LEGAL_CONTENT_DIR}/cguv/empreintes.lock.json`
export const LEGAL_DOCUMENTS_FILE = `${LEGAL_CONTENT_DIR}/documents.json`
export const LEGAL_CONTROLS_FILE = `${LEGAL_CONTENT_DIR}/controles.json`

/** Marqueur des textes juridiques pas encore fournis : bloque le build. */
export const LEGAL_TEXT_MARKER = '<!-- TEXTE-JURIDIQUE-A-FOURNIR -->'
export const LEGAL_TEXT_MARKER_TOKEN = 'TEXTE-JURIDIQUE-A-FOURNIR'

export const CGUV_MANIFEST_SCHEMA = 'verebona-legal-cguv-versions-v1'
export const CGUV_LOCK_SCHEMA = 'verebona-legal-cguv-lock-v1'
export const CGUV_MANIFEST_PATH = '/legal/cguv/versions.json'
export const LEGAL_PREFIX = '/legal'
export const CGUV_PATH = '/legal/cguv'

/** Pages pré-rendues de la rubrique (dossier « point » : jamais servi par express.static). */
export const LEGAL_PAGES_DIR = 'legal/.pages'
/** Page 404 « version inconnue », pré-rendue. */
export const CGUV_UNKNOWN_VERSION_PAGE = `${LEGAL_PAGES_DIR}/cguv/version-inconnue.html`

/**
 * Les cinq contenus, dans l'ordre des onglets (contrat § 2). Libellés
 * d'interface uniquement — aucun texte juridique.
 */
export const LEGAL_DOCUMENTS = Object.freeze([
  { key: 'mentions-legales', path: '/legal/mentions-legales', tabLabel: 'Mentions légales', title: 'Mentions légales', source: `${LEGAL_CONTENT_DIR}/mentions-legales.html` },
  { key: 'cguv', path: '/legal/cguv', tabLabel: 'CGUV', title: 'Conditions générales d’utilisation et de vente (CGUV)', source: null },
  { key: 'confidentialite', path: '/legal/confidentialite', tabLabel: 'Confidentialité', title: 'Politique de confidentialité', source: `${LEGAL_CONTENT_DIR}/confidentialite.html` },
  { key: 'sous-traitants', path: '/legal/sous-traitants', tabLabel: 'Sous-traitants et prestataires', title: 'Sous-traitants et prestataires', source: `${LEGAL_CONTENT_DIR}/sous-traitants.html` },
  { key: 'parrainage', path: '/legal/parrainage', tabLabel: 'Parrainage', title: 'Parrainage', source: `${LEGAL_CONTENT_DIR}/parrainage.html` },
])

/** Titre par défaut d'une version des CGUV (libellé du contrat, § 4.2). */
export const CGUV_DEFAULT_TITLE = 'Conditions générales d’utilisation et de vente'

/** Origine d'une version : publiée par le site, ou reprise de l'application (§ 3.3). */
export const VERSION_ORIGINS = Object.freeze(['site', 'archive-application'])

/* ── Petits utilitaires ─────────────────────────────────────────────────── */

export function sha256Hex(buf) {
  return createHash('sha256').update(buf).digest('hex')
}

const VERSION_CODE = /^(\d{4})-(\d{2})-(\d{2})-v([1-9]\d{0,3})$/

/** Code `AAAA-MM-JJ-vN`, date réelle (même règle que l'application). */
export function isCguvVersionCode(code) {
  if (typeof code !== 'string') return false
  const m = VERSION_CODE.exec(code)
  if (!m) return false
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const date = new Date(Date.UTC(y, mo - 1, d))
  return date.getUTCFullYear() === y && date.getUTCMonth() === mo - 1 && date.getUTCDate() === d
}

/** Tri chronologique des codes (date puis N). */
export function compareVersionCodes(a, b) {
  const ma = VERSION_CODE.exec(a)
  const mb = VERSION_CODE.exec(b)
  const da = `${ma[1]}${ma[2]}${ma[3]}`
  const db = `${mb[1]}${mb[2]}${mb[3]}`
  if (da !== db) return da < db ? -1 : 1
  return Number(ma[4]) - Number(mb[4])
}

export const cguvVersionPath = (code) => `${CGUV_PATH}/versions/${code}`
export const cguvTextPath = (code) => `${CGUV_PATH}/versions/${code}.html`

/** Date ISO 8601 UTC (`…Z`) exigée pour les dates figées. */
const ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?Z$/
export function isIsoUtc(v) {
  return typeof v === 'string' && ISO_UTC.test(v) && !Number.isNaN(new Date(v).getTime())
}

/** Jour calendaire d'un instant, en UTC et à Paris (le code peut suivre l'un ou l'autre). */
function calendarDays(iso) {
  const d = new Date(iso)
  const utc = d.toISOString().slice(0, 10)
  const paris = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d)
  return new Set([utc, paris])
}

/**
 * Origine du site public de l'environnement (permaliens du manifeste).
 * `VITE_PUBLIC_SITE_URL` si elle est valide, sinon la valeur de l'environnement.
 */
export function resolveSiteOrigin(environment, raw) {
  const v = typeof raw === 'string' ? raw.trim() : ''
  if (v) {
    try {
      const u = new URL(v)
      const local = /^(localhost|127\.0\.0\.1)$/.test(u.hostname)
      if (u.protocol === 'https:' || (local && u.protocol === 'http:')) return u.origin
    } catch { /* valeur invalide : défaut de l'environnement */ }
    throw new Error(`[legal] VITE_PUBLIC_SITE_URL invalide (${v}) : URL https:// attendue`)
  }
  if (environment === 'preprod') return 'https://preprod.verebona.fr'
  if (environment === 'development') return 'http://localhost:3000'
  return 'https://www.verebona.fr'
}

/* ── HTML des textes : extraction et règles de structure ────────────────── */

/**
 * Contenu affiché d'un texte : l'intérieur de `<article>` (fichiers figés du
 * site ET archives de l'application, qui ont la même structure), sinon de
 * `<body>`, sinon le fragment entier. Les scripts sont retirés de l'affichage
 * (jamais du fichier figé, servi octet pour octet).
 */
export function displayHtml(raw) {
  const text = String(raw)
  const article = /<article\b[^>]*>([\s\S]*?)<\/article>/i.exec(text)
  const body = article ? null : /<body\b[^>]*>([\s\S]*?)<\/body>/i.exec(text)
  const inner = article ? article[1] : body ? body[1] : text
  return inner.replace(/<script\b[\s\S]*?<\/script>/gi, '').trim()
}

export function hasMarker(text) {
  return String(text).includes(LEGAL_TEXT_MARKER_TOKEN)
}

const ALLOWED_TAGS = new Set([
  'h2', 'h3', 'h4', 'h5', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'b', 'i', 'u', 'a', 'br', 'hr',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'section', 'div', 'span',
  'abbr', 'sup', 'sub', 'blockquote', 'dl', 'dt', 'dd', 'address', 'small',
])
const ALLOWED_ATTRS = new Set(['href', 'title', 'id', 'colspan', 'rowspan', 'scope', 'lang'])

/**
 * Règles de structure d'un texte collé (fragment HTML) : balises simples
 * (titres h2–h5, paragraphes, listes, tableaux, liens), aucun script, aucun
 * style, aucun `<h1>` (la page porte déjà le sien). Ne juge jamais le fond.
 */
export function checkFragment(html, label) {
  const issues = []
  const src = String(html).replace(/<!--[\s\S]*?-->/g, '')
  for (const m of src.matchAll(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g)) {
    const tag = m[1].toLowerCase()
    if (!ALLOWED_TAGS.has(tag)) { issues.push(`${label} : balise <${tag}> interdite`); continue }
    for (const a of m[2].matchAll(/([^\s=/]+)\s*(?:=\s*("[^"]*"|'[^']*'|[^\s>]+))?/g)) {
      const name = a[1].toLowerCase()
      if (!ALLOWED_ATTRS.has(name)) { issues.push(`${label} : attribut « ${name} » interdit sur <${tag}>`); continue }
      if (name === 'href') {
        const v = (a[2] ?? '').replace(/^["']|["']$/g, '')
        if (!/^(https:\/\/|mailto:|\/(?!\/)|#)/.test(v)) issues.push(`${label} : lien « ${v} » (https://, mailto:, /chemin ou #ancre attendus)`)
      }
    }
  }
  return [...new Set(issues)]
}

/* ── Lecture des sources ────────────────────────────────────────────────── */

function readJson(root, rel, errors) {
  try {
    return JSON.parse(readFileSync(path.join(root, rel), 'utf8'))
  } catch (e) {
    errors.push(`${rel} : JSON illisible (${e.message})`)
    return null
  }
}

/** Champs figés d'une version (copiés dans le verrou à la publication). */
export const FROZEN_FIELDS = Object.freeze(['code', 'origin', 'title', 'publishedAt', 'effectiveAt', 'requiresReacceptance', 'changeSummary'])

export function frozenMeta(meta) {
  const out = {}
  for (const k of FROZEN_FIELDS) out[k] = meta[k] ?? null
  return out
}

/**
 * Éléments que le PO doit fournir pour une version (décisions, dates) — pas
 * des erreurs de structure : ils bloquent la publication, comme les marqueurs.
 */
export function missingDecisions(meta) {
  const out = []
  if (!isIsoUtc(meta.publishedAt)) out.push('publishedAt (date de publication, ISO 8601 UTC « …Z »)')
  if (!isIsoUtc(meta.effectiveAt)) out.push('effectiveAt (entrée en vigueur, ISO 8601 UTC « …Z »)')
  if (typeof meta.requiresReacceptance !== 'boolean') out.push('requiresReacceptance (décision du PO : true = substantielle, false = non)')
  if (meta.requiresReacceptance === true && !(typeof meta.changeSummary === 'string' && meta.changeSummary.trim())) {
    out.push('changeSummary (résumé en mots simples, obligatoire pour une version substantielle)')
  }
  return out
}

/**
 * Charge et contrôle toutes les sources de la rubrique.
 *
 * `errors`  : défauts de STRUCTURE ou d'IMMUABILITÉ — le build s'arrête tout de suite ;
 * `pending` : textes ou décisions que le PO doit encore fournir — bloquent la
 *             publication (contrôle final `check-legal-texts.mjs`) ;
 * `warnings`: informations (archive pas encore importée…).
 */
export function loadLegalSources(root) {
  const errors = []
  const pending = []
  const warnings = []

  /* Documents (hors CGUV) */
  const docMeta = existsSync(path.join(root, LEGAL_DOCUMENTS_FILE)) ? (readJson(root, LEGAL_DOCUMENTS_FILE, errors) ?? {}) : {}
  const documents = LEGAL_DOCUMENTS.map((d) => {
    if (!d.source) return { ...d, raw: null, html: '', pending: false, updatedAt: null }
    let raw = ''
    if (!existsSync(path.join(root, d.source))) errors.push(`${d.source} : fichier absent (source unique du document)`)
    else raw = readFileSync(path.join(root, d.source), 'utf8')
    const isPending = hasMarker(raw)
    if (isPending) pending.push(`${d.source} : texte « ${d.tabLabel} » à fournir (marqueur ${LEGAL_TEXT_MARKER})`)
    else if (!raw.trim()) errors.push(`${d.source} : fichier vide`)
    errors.push(...checkFragment(raw, d.source))
    const updatedAt = docMeta?.[d.key]?.updatedAt ?? null
    if (updatedAt !== null && !(typeof updatedAt === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(updatedAt))) {
      errors.push(`${LEGAL_DOCUMENTS_FILE} : ${d.key}.updatedAt doit être null ou AAAA-MM-JJ`)
    }
    return { ...d, raw, html: displayHtml(raw), pending: isPending, updatedAt }
  })

  /* Verrou des versions publiées */
  let lock = { schema: CGUV_LOCK_SCHEMA, versions: {} }
  if (existsSync(path.join(root, CGUV_LOCK_FILE))) {
    const l = readJson(root, CGUV_LOCK_FILE, errors)
    if (l && l.schema === CGUV_LOCK_SCHEMA && l.versions && typeof l.versions === 'object') lock = l
    else if (l) errors.push(`${CGUV_LOCK_FILE} : schéma ${CGUV_LOCK_SCHEMA} attendu`)
  } else {
    errors.push(`${CGUV_LOCK_FILE} : fichier verrou absent`)
  }

  /* Versions des CGUV */
  const dir = path.join(root, CGUV_VERSIONS_DIR)
  const names = existsSync(dir) ? readdirSync(dir) : []
  const codes = new Set()
  for (const n of names) {
    const m = /^(.+)\.(json|html)$/.exec(n)
    if (!m) { errors.push(`${CGUV_VERSIONS_DIR}/${n} : fichier inattendu (seuls <code>.json et <code>.html)`); continue }
    if (!isCguvVersionCode(m[1])) { errors.push(`${CGUV_VERSIONS_DIR}/${n} : code de version invalide (AAAA-MM-JJ-vN, date réelle)`); continue }
    codes.add(m[1])
  }
  for (const code of Object.keys(lock.versions)) {
    if (!codes.has(code)) errors.push(`${code} : version publiée (verrou) dont les fichiers ont disparu — une version publiée n'est jamais supprimée`)
  }

  const versions = []
  for (const code of [...codes].sort(compareVersionCodes)) {
    const jsonRel = `${CGUV_VERSIONS_DIR}/${code}.json`
    const htmlRel = `${CGUV_VERSIONS_DIR}/${code}.html`
    const locked = lock.versions[code] ?? null
    if (!existsSync(path.join(root, jsonRel))) { errors.push(`${jsonRel} : métadonnées absentes`); continue }
    const meta = readJson(root, jsonRel, errors)
    if (!meta) continue
    const local = []
    if (meta.code !== code) local.push(`${jsonRel} : « code » (${meta.code}) différent du nom du fichier`)
    if (!VERSION_ORIGINS.includes(meta.origin)) local.push(`${jsonRel} : « origin » doit valoir ${VERSION_ORIGINS.join(' ou ')}`)
    if (meta.title !== null && meta.title !== undefined && (typeof meta.title !== 'string' || meta.title.length > 200)) local.push(`${jsonRel} : « title » (≤ 200 caractères)`)
    if (meta.changeSummary !== null && meta.changeSummary !== undefined && (typeof meta.changeSummary !== 'string' || meta.changeSummary.length > 2000)) local.push(`${jsonRel} : « changeSummary » (≤ 2000 caractères)`)
    for (const k of Object.keys(meta)) {
      if (![...FROZEN_FIELDS, 'sha256'].includes(k)) local.push(`${jsonRel} : champ inconnu « ${k} »`)
    }
    if (isIsoUtc(meta.publishedAt) && !calendarDays(meta.publishedAt).has(code.slice(0, 10))) {
      local.push(`${jsonRel} : publishedAt (${meta.publishedAt}) n'est pas le jour du code ${code} (date réelle de publication)`)
    }
    if (isIsoUtc(meta.publishedAt) && isIsoUtc(meta.effectiveAt) && new Date(meta.effectiveAt) < new Date(meta.publishedAt)) {
      local.push(`${jsonRel} : effectiveAt antérieure à publishedAt`)
    }

    const hasHtml = existsSync(path.join(root, htmlRel))
    const bytes = hasHtml ? readFileSync(path.join(root, htmlRel)) : null
    const sha256 = bytes ? sha256Hex(bytes) : null
    const text = bytes ? bytes.toString('utf8') : ''

    if (meta.origin === 'archive-application') {
      if (meta.sha256 !== undefined && meta.sha256 !== null && !/^[0-9a-f]{64}$/.test(meta.sha256)) local.push(`${jsonRel} : « sha256 » (64 caractères hexadécimaux minuscules)`)
      if (bytes && meta.sha256 && sha256 !== meta.sha256) local.push(`${htmlRel} : octets différents de l'archive d'origine (sha256 ${sha256} ≠ ${meta.sha256}) — réimporter l'original avec scripts/import-cguv-archive.mjs`)
      if (meta.requiresReacceptance !== false) local.push(`${jsonRel} : une archive reprise de l'application est non substantielle (requiresReacceptance: false, contrat § 3.3)`)
    } else {
      if (meta.sha256 !== undefined) local.push(`${jsonRel} : « sha256 » réservé aux archives (l'empreinte d'une version du site est dans le verrou)`)
      if (bytes) {
        const metaTag = /<meta\s+name="verebona-cguv-version"\s+content="([^"]*)"/i.exec(text)
        if (!metaTag || metaTag[1] !== code) local.push(`${htmlRel} : balise <meta name="verebona-cguv-version" content="${code}"> absente ou différente`)
        if (!/<article\b/i.test(text)) local.push(`${htmlRel} : bloc <article> absent (le texte se colle dans <article>)`)
        local.push(...checkFragment(displayHtml(text), `${htmlRel} <article>`))
      }
    }

    // Immuabilité : une version publiée ne change plus, ni ses octets ni ses métadonnées.
    if (locked) {
      if (!bytes) local.push(`${htmlRel} : texte figé d'une version publiée absent`)
      else if (locked.sha256 !== sha256) local.push(`${htmlRel} : IMMUABILITÉ — empreinte ${sha256} ≠ ${locked.sha256} figée dans ${CGUV_LOCK_FILE}. Une version publiée ne se modifie jamais : publier une nouvelle version.`)
      const frozen = frozenMeta(meta)
      for (const k of FROZEN_FIELDS) {
        if (JSON.stringify(frozen[k]) !== JSON.stringify(locked.meta?.[k] ?? null)) {
          local.push(`${jsonRel} : IMMUABILITÉ — « ${k} » modifié après publication (figé dans ${CGUV_LOCK_FILE})`)
        }
      }
    }

    errors.push(...local)
    let status
    const decisions = missingDecisions(meta)
    if (!bytes) {
      if (meta.origin === 'archive-application') {
        status = 'archive-absente'
        warnings.push(`${code} : archive de l'application pas encore importée (scripts/import-cguv-archive.mjs) — absente du manifeste et de l'historique`)
      } else {
        status = 'texte-absent'
        errors.push(`${htmlRel} : texte figé absent (créer la version avec npm run legal:nouvelle-cguv)`)
      }
    } else if (hasMarker(text)) {
      status = 'texte-a-fournir'
      pending.push(`${htmlRel} : texte des CGUV ${code} à fournir (marqueur ${LEGAL_TEXT_MARKER})`)
      for (const d of decisions) pending.push(`${jsonRel} : ${d} à fournir`)
    } else if (decisions.length) {
      status = 'decision-a-fournir'
      for (const d of decisions) pending.push(`${jsonRel} : ${d} à fournir`)
    } else if (!locked) {
      status = 'a-figer'
      pending.push(`${code} : version prête mais non figée — lancer « npm run legal:figer-cguv -- ${code} » puis commiter ${CGUV_LOCK_FILE}`)
    } else {
      status = local.length ? 'invalide' : 'publiee'
    }
    versions.push({ code, meta, sha256, bytes, text, status, locked: Boolean(locked), jsonRel, htmlRel })
  }

  if (versions.length === 0) errors.push(`${CGUV_VERSIONS_DIR} : aucune version des CGUV`)

  // Ordre de publication cohérent (une version plus récente a une date plus récente).
  const dated = versions.filter((v) => isIsoUtc(v.meta.publishedAt))
  for (let i = 1; i < dated.length; i++) {
    if (new Date(dated[i].meta.publishedAt) <= new Date(dated[i - 1].meta.publishedAt)) {
      errors.push(`${dated[i].code} : publishedAt doit être postérieure à celle de ${dated[i - 1].code}`)
    }
  }

  return { documents, versions, lock, errors: [...new Set(errors)], pending, warnings }
}

/** Versions publiées (servies, listées au manifeste) — de la plus récente à la plus ancienne. */
export function publishedVersions(sources) {
  return sources.versions.filter((v) => v.status === 'publiee').sort((a, b) => compareVersionCodes(b.code, a.code))
}

/** Versions affichables (texte présent), y compris en attente — pour le serveur de dev. */
export function displayableVersions(sources) {
  return sources.versions.filter((v) => v.bytes).sort((a, b) => compareVersionCodes(b.code, a.code))
}

/* ── Manifeste ──────────────────────────────────────────────────────────── */

/** Manifeste `verebona-legal-cguv-versions-v1` (contrat § 4.2), depuis les versions publiées. */
export function buildCguvManifest(versions, siteOrigin, generatedAt = new Date().toISOString()) {
  const list = [...versions].sort((a, b) => compareVersionCodes(b.code, a.code))
  if (list.length === 0) throw new Error('[legal] aucune version publiée : manifeste impossible (liste vide refusée par l’application)')
  const origin = siteOrigin.replace(/\/+$/, '')
  return {
    schema: CGUV_MANIFEST_SCHEMA,
    document: 'CGUV',
    generatedAt,
    current: list[0].code,
    versions: list.map((v) => {
      const out = {
        code: v.code,
        permalink: `${origin}${cguvVersionPath(v.code)}`,
        textUrl: `${origin}${cguvTextPath(v.code)}`,
        sha256: v.sha256,
        publishedAt: v.meta.publishedAt,
        effectiveAt: v.meta.effectiveAt,
        requiresReacceptance: v.meta.requiresReacceptance,
        title: v.meta.title || CGUV_DEFAULT_TITLE,
      }
      if (v.meta.changeSummary) out.changeSummary = v.meta.changeSummary
      return out
    }),
  }
}

export function serializeManifest(manifest) {
  return JSON.stringify(manifest, null, 2) + '\n'
}

/**
 * Contrôle du manifeste selon le contrat (§ 4.2, § 4.4) — mêmes règles que
 * le lecteur de l'application (`cguv-manifest.ts › parseCguvManifest`), plus
 * les règles propres au site (chemins exacts, version courante = la plus récente).
 */
export function checkManifestContract(raw, siteOrigin) {
  const errors = []
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return ['manifeste : objet JSON attendu']
  if (raw.schema !== CGUV_MANIFEST_SCHEMA) errors.push(`schema : « ${CGUV_MANIFEST_SCHEMA} » attendu`)
  if (raw.document !== 'CGUV') errors.push('document : « CGUV » attendu')
  if (raw.generatedAt !== undefined && !isIsoUtc(raw.generatedAt)) errors.push('generatedAt : date ISO 8601 attendue')
  if (!isCguvVersionCode(raw.current)) errors.push('current : code AAAA-MM-JJ-vN attendu')
  if (!Array.isArray(raw.versions) || raw.versions.length === 0) return [...errors, 'versions : liste non vide attendue']
  if (raw.versions.length > 500) errors.push('versions : 500 au plus')
  const origin = new URL(siteOrigin).origin
  const seen = new Set()
  raw.versions.forEach((v, i) => {
    const at = `versions[${i}]`
    if (!v || typeof v !== 'object') { errors.push(`${at} : objet attendu`); return }
    if (!isCguvVersionCode(v.code)) { errors.push(`${at}.code : AAAA-MM-JJ-vN attendu`); return }
    if (seen.has(v.code)) errors.push(`${at}.code : ${v.code} en double`)
    seen.add(v.code)
    for (const [field, expected] of [['permalink', cguvVersionPath(v.code)], ['textUrl', cguvTextPath(v.code)]]) {
      let u = null
      try { u = new URL(v[field]) } catch { errors.push(`${at}.${field} : URL absolue attendue`) }
      if (!u) continue
      const local = u.protocol === 'http:' && /^(localhost|127\.0\.0\.1)$/.test(u.hostname)
      if (u.protocol !== 'https:' && !local) errors.push(`${at}.${field} : HTTPS exigé`)
      if (u.origin !== origin) errors.push(`${at}.${field} : origine ${u.origin} ≠ site ${origin}`)
      if (u.pathname !== expected || u.search || u.hash) errors.push(`${at}.${field} : chemin ${expected} attendu`)
    }
    if (typeof v.sha256 !== 'string' || !/^[0-9a-f]{64}$/.test(v.sha256)) errors.push(`${at}.sha256 : 64 caractères hexadécimaux minuscules`)
    if (!isIsoUtc(v.publishedAt)) errors.push(`${at}.publishedAt : date ISO 8601 UTC attendue`)
    if (v.effectiveAt !== undefined && !isIsoUtc(v.effectiveAt)) errors.push(`${at}.effectiveAt : date ISO 8601 attendue`)
    if (typeof v.requiresReacceptance !== 'boolean') errors.push(`${at}.requiresReacceptance : booléen attendu`)
    if (v.title !== undefined && (typeof v.title !== 'string' || v.title.length > 200)) errors.push(`${at}.title : ≤ 200 caractères`)
    if (v.changeSummary !== undefined && (typeof v.changeSummary !== 'string' || v.changeSummary.length > 2000)) errors.push(`${at}.changeSummary : ≤ 2000 caractères`)
    if (v.requiresReacceptance === true && !v.changeSummary) errors.push(`${at}.changeSummary : conseillé par le contrat, exigé ici pour une version substantielle`)
  })
  if (isCguvVersionCode(raw.current) && !seen.has(raw.current)) errors.push(`current : ${raw.current} absent de versions`)
  const newest = [...seen].filter(isCguvVersionCode).sort(compareVersionCodes).pop()
  if (newest && raw.current !== newest) errors.push(`current : ${raw.current} n'est pas la version la plus récente (${newest})`)
  if (Buffer.byteLength(JSON.stringify(raw)) >= 1_000_000) errors.push('manifeste : 1 Mo au plus')
  return errors
}

/* ── Données des pages (module `virtual:legal`) ─────────────────────────── */

/**
 * Données affichées par la vue « Légal » (aucun octet figé ici : seulement le
 * contenu de lecture et les métadonnées). `includePending` : serveur de dev.
 */
export function legalViewData(sources, { includePending = false } = {}) {
  const versions = (includePending ? displayableVersions(sources) : publishedVersions(sources)).map((v) => ({
    code: v.code,
    origin: v.meta.origin,
    title: v.meta.title || CGUV_DEFAULT_TITLE,
    publishedAt: v.meta.publishedAt ?? null,
    effectiveAt: v.meta.effectiveAt ?? null,
    requiresReacceptance: typeof v.meta.requiresReacceptance === 'boolean' ? v.meta.requiresReacceptance : null,
    changeSummary: v.meta.changeSummary ?? null,
    sha256: v.sha256,
    pending: v.status !== 'publiee',
    html: displayHtml(v.text),
    permalinkPath: cguvVersionPath(v.code),
    textPath: cguvTextPath(v.code),
  }))
  return {
    documents: sources.documents.map(({ key, path: p, tabLabel, title, html, pending, updatedAt }) => ({ key, path: p, tabLabel, title, html, pending, updatedAt })),
    cguvVersions: versions,
    cguvCurrent: versions[0]?.code ?? null,
  }
}

/* ── Contrôle des termes interdits (contenu servi) ──────────────────────── */

/** Règles adaptables (`src/content/legal/controles.json`). */
export function loadControls(root) {
  const raw = JSON.parse(readFileSync(path.join(root, LEGAL_CONTROLS_FILE), 'utf8'))
  return {
    forbidden: (raw.forbidden ?? []).map((r) => ({ ...r, re: new RegExp(r.pattern, r.flags ?? '') })),
  }
}

/** Texte visible d'une page HTML : sans scripts, styles, commentaires ni balises (attributs compris). */
export function visibleText(html) {
  return String(html)
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
}

/** Occurrences des termes interdits dans un texte visible. */
export function forbiddenHits(text, controls, label) {
  const hits = []
  for (const r of controls.forbidden) {
    const m = r.re.exec(text)
    if (m) {
      const at = Math.max(0, m.index - 40)
      hits.push(`${label} : « ${m[0]} » interdit (${r.reason}) — …${text.slice(at, m.index + m[0].length + 40).trim()}…`)
    }
  }
  return hits
}
