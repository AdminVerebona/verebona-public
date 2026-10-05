/**
 * Navigation au clavier — CDC Centre d'aide A11Y-01 (complète axe-core, qui ne
 * vérifie ni l'ordre du focus ni sa visibilité). Utilisé par `scripts/a11y.mjs`.
 *
 * Pour chaque page, la touche Tab parcourt TOUTE la page, du haut jusqu'à la
 * sortie du document. À chaque arrêt :
 *   - l'élément est visible (taille non nulle, ni `visibility: hidden` ni
 *     opacité nulle) ;
 *   - le focus est visible : `outline` effectif (style ≠ none, couleur non
 *     transparente, épaisseur > 0 ou style `auto`) ou `box-shadow` différent de
 *     celui de l'élément au repos (relevé avant le parcours) ;
 *   - l'ordre suit celui du document (pas de `tabindex` positif ni de saut en
 *     arrière) et les zones se succèdent : barre intégrée / en-tête, contenu,
 *     pied de page ;
 *   - pas de piège : chaque Tab déplace le focus.
 * Puis des parcours précis, entièrement au clavier : ordre attendu des
 * éléments clés (en-tête, recherche d'aide, retour d'article, formulaire de
 * contact, menu mobile), recherche lancée par Entrée, ouverture d'un résultat,
 * retour « Non » activé à la barre d'espace, envoi du formulaire de contact.
 */

/** Nombre maximal d'arrêts de tabulation par page (garde-fou anti-boucle). */
const MAX_STOPS = 250

const SEL = {
  logo: 'header a[aria-label="Verebona — accueil"]',
  headerNav: 'header nav a',
  burger: 'header button[aria-label="Menu"]',
  mobileMenuLink: 'header .r-mobile-menu a',
  embedBack: '.ha-embedbar button',
  searchInput: 'form[role="search"] input[type="search"]',
  searchButton: 'form[role="search"] button[type="submit"]',
  helpCard: 'a.ha-card',
  crumb: '.ha-crumbs a',
  footer: 'footer a',
}

/**
 * Relève l'état « au repos » des éléments focalisables (box-shadow) pour
 * distinguer un indicateur de focus d'une ombre décorative permanente.
 */
async function snapshotRest(page) {
  await page.evaluate(() => {
    const base = new WeakMap()
    for (const el of document.querySelectorAll('a[href], button, input, select, textarea, [tabindex]')) {
      base.set(el, getComputedStyle(el).boxShadow)
    }
    window.__kbBase = base
    window.__kbPrev = null
  })
}

/** État de l'élément qui a le focus, et contrôles faits dans la page. */
function readStop(page, selectors) {
  return page.evaluate((sels) => {
    const el = document.activeElement
    if (!el || el === document.body || el === document.documentElement) return null
    const cs = getComputedStyle(el)
    const r = el.getBoundingClientRect()
    const transparent = (c) => c === 'transparent' || /rgba\(.*,\s*0\)$/.test(c)
    const outline = cs.outlineStyle !== 'none' && !transparent(cs.outlineColor)
      && (cs.outlineStyle === 'auto' || parseFloat(cs.outlineWidth) > 0)
    const rest = window.__kbBase?.get(el)
    const shadow = cs.boxShadow !== 'none' && cs.boxShadow !== rest
    const prev = window.__kbPrev
    const inOrder = !prev || !prev.isConnected || prev === el
      || Boolean(prev.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING)
    const same = prev === el
    window.__kbPrev = el
    const region = el.closest('.ha-embedbar') ? 0 : el.closest('header') ? 1 : el.closest('footer') ? 3 : 2
    const text = (el.getAttribute('aria-label') || el.labels?.[0]?.textContent || el.textContent
      || el.getAttribute('placeholder') || el.getAttribute('name') || '').trim().replace(/\s+/g, ' ')
    return {
      desc: `<${el.tagName.toLowerCase()}> « ${text.slice(0, 48)} »`,
      label: el.labels?.[0] ? [...el.labels[0].childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim() : null,
      visible: r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.opacity !== '0',
      indicator: outline || shadow,
      style: `outline: ${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor} ; box-shadow: ${cs.boxShadow}`,
      inOrder,
      same,
      region,
      matches: sels.map((s) => el.matches(s)),
    }
  }, selectors)
}

/** Appuie sur Tab et renvoie l'arrêt atteint (null : sortie du document). */
async function tab(page, selectors = [], key = 'Tab') {
  await page.keyboard.press(key)
  return readStop(page, selectors)
}

/**
 * Parcourt toute la page au Tab depuis le haut ; renvoie les arrêts et les
 * défauts génériques (visibilité, indicateur, ordre, zones, piège).
 */
async function walk(page, selectors = []) {
  await page.evaluate(() => { document.activeElement?.blur?.(); window.scrollTo(0, 0) })
  await snapshotRest(page)
  const stops = []
  const problems = []
  const positive = await page.evaluate(() => [...document.querySelectorAll('[tabindex]')]
    .filter((e) => e.tabIndex > 0).map((e) => `<${e.tagName.toLowerCase()} tabindex=${e.tabIndex}>`))
  for (const p of positive) problems.push(`tabindex positif : ${p}`)
  let region = 0
  for (let i = 0; i < MAX_STOPS; i++) {
    const s = await tab(page, selectors)
    if (!s) return { stops, problems }
    const n = stops.length + 1
    stops.push(s)
    if (s.same) { problems.push(`piège clavier : Tab ne quitte pas ${s.desc}`); return { stops, problems } }
    if (!s.visible) problems.push(`arrêt ${n} invisible : ${s.desc}`)
    if (!s.indicator) problems.push(`arrêt ${n} sans focus visible : ${s.desc} (${s.style})`)
    if (!s.inOrder) problems.push(`arrêt ${n} hors de l'ordre du document : ${s.desc}`)
    if (s.region < region) problems.push(`arrêt ${n} revient dans une zone précédente : ${s.desc}`)
    region = Math.max(region, s.region)
  }
  problems.push(`plus de ${MAX_STOPS} arrêts sans sortir de la page (boucle de focus ?)`)
  return { stops, problems }
}

/**
 * Les sélecteurs `order` doivent être atteints dans cet ordre (sous-suite des
 * arrêts) ; `first` : sélecteur du tout premier arrêt.
 */
function checkOrder(stops, order, first) {
  const problems = []
  if (first !== undefined && !stops[0]?.matches[first]) {
    problems.push(`premier arrêt inattendu : ${stops[0]?.desc ?? '(aucun)'} — attendu ${order[first]}`)
  }
  let from = 0
  for (let k = 0; k < order.length; k++) {
    const at = stops.findIndex((s, i) => i >= from && s.matches[k])
    if (at < 0) { problems.push(`non atteint au clavier (ou hors ordre) : ${order[k]}`); break }
    from = at + 1
  }
  return problems
}

/** Tab jusqu'au premier élément qui correspond à `selector`. */
async function tabTo(page, selector, max = MAX_STOPS) {
  for (let i = 0; i < max; i++) {
    const s = await tab(page, [selector])
    if (!s) break
    if (s.matches[0]) return s
  }
  throw new Error(`élément jamais atteint au Tab : ${selector}`)
}

async function open(page, base, url) {
  const res = await page.goto(base + url, { waitUntil: 'networkidle' })
  if (!res || res.status() >= 400) throw new Error(`${url} : HTTP ${res?.status()}`)
  await page.waitForFunction(() => document.querySelector('#app')?.children.length, null, { timeout: 10000 })
  await page.waitForTimeout(150)
}

/** Ordre générique + ordre attendu des éléments clés, pour une page. */
function orderScenario(name, url, order, { first = 0, viewports } = {}) {
  return {
    name, url, viewports,
    run: async (page) => {
      const { stops, problems } = await walk(page, order)
      return { problems: [...problems, ...checkOrder(stops, order, first)], info: `${stops.length} arrêts` }
    },
  }
}

export const KEYBOARD_SCENARIOS = [
  orderScenario('Accueil du Centre d’aide', '/aide',
    [SEL.logo, SEL.headerNav, SEL.searchInput, SEL.searchButton, SEL.helpCard, SEL.footer], { viewports: ['bureau'] }),
  orderScenario('Accueil du Centre d’aide', '/aide',
    [SEL.logo, SEL.burger, SEL.searchInput, SEL.searchButton, SEL.helpCard, SEL.footer], { viewports: ['mobile'] }),
  orderScenario('Recherche d’aide', '/aide?q=document', [SEL.logo, SEL.searchInput, SEL.helpCard, SEL.footer]),
  orderScenario('Thème', '/aide/theme/documents', [SEL.logo, SEL.crumb, SEL.helpCard, SEL.footer]),
  orderScenario('Article', '/aide/ajouter-un-document',
    [SEL.logo, SEL.crumb, SEL.footer]),
  orderScenario('Vue intégrée — accueil', '/aide?integre=app', [SEL.embedBack, SEL.searchInput, SEL.helpCard]),
  orderScenario('Vue intégrée — article', '/aide/ajouter-un-document?integre=app',
    [SEL.embedBack, SEL.crumb]),
  {
    name: 'Contact : champs dans l’ordre, envoi au clavier', url: '/contact',
    run: async (page) => {
      const { stops, problems } = await walk(page, ['input, select, textarea', 'button[type="submit"]'])
      const fields = stops.filter((s) => s.matches[0]).map((s) => s.label)
      const expected = ['Prénom', 'Nom', 'Email', 'Sujet', 'Message']
      if (fields.join('|') !== expected.join('|')) problems.push(`ordre des champs : ${fields.join(', ')} — attendu ${expected.join(', ')}`)
      const submitAt = stops.findIndex((s) => s.matches[1])
      const lastField = stops.findLastIndex((s) => s.matches[0])
      if (submitAt < lastField) problems.push('le bouton d’envoi n’est pas atteint après le dernier champ')
      // Remplissage et envoi sans souris.
      await page.evaluate(() => { document.activeElement?.blur?.(); window.scrollTo(0, 0) })
      await tabTo(page, 'input')
      await page.keyboard.type('Camille'); await tab(page)
      await page.keyboard.type('Durand'); await tab(page)
      await page.keyboard.type('camille@example.com'); await tab(page)
      await page.keyboard.press('ArrowDown'); await tab(page)
      await page.keyboard.type('Test clavier')
      const btn = await tab(page, ['button[type="submit"]'])
      if (!btn?.matches[0]) problems.push(`après « Message », Tab atteint ${btn?.desc ?? '(rien)'} au lieu du bouton d’envoi`)
      await page.keyboard.press('Enter')
      try {
        await page.getByTestId('contact-error').waitFor({ timeout: 5000 })
      } catch {
        problems.push('envoi au clavier (Entrée) : aucun retour affiché')
      }
      return { problems, info: `${stops.length} arrêts, envoi au clavier` }
    },
  },
  {
    name: 'Recherche au clavier puis ouverture d’un résultat', url: '/aide',
    run: async (page) => {
      const problems = []
      await tabTo(page, SEL.searchInput)
      await page.keyboard.type('document')
      await page.keyboard.press('Enter')
      await page.waitForURL(/[?&]q=document/, { timeout: 5000 })
      await page.locator('.ha-body a.ha-card').first().waitFor()
      const s = await tabTo(page, SEL.helpCard, 20)
      if (!s.indicator) problems.push(`résultat sans focus visible : ${s.desc}`)
      const href = await page.evaluate(() => document.activeElement.getAttribute('href'))
      await page.keyboard.press('Enter')
      await page.waitForURL((u) => u.pathname === href.split('?')[0], { timeout: 5000 })
      await page.locator('.ha-crumbs').waitFor()
      // Après la navigation, la tabulation reprend en haut de la nouvelle page.
      const next = await tab(page, [`${SEL.logo}, ${SEL.headerNav}, ${SEL.crumb}, h1, .ha-hero *`])
      if (!next?.matches[0]) problems.push(`après ouverture du résultat, Tab atteint ${next?.desc ?? '(rien)'} au lieu du haut de page`)
      return { problems, info: `recherche « document » → ${href}` }
    },
    viewports: ['bureau'],
  },
  {
    name: 'Menu mobile au clavier', url: '/aide',
    run: async (page) => {
      const problems = []
      const b = await tabTo(page, SEL.burger, 5)
      if (!b.indicator) problems.push(`bouton Menu sans focus visible (${b.style})`)
      const expanded = () => page.locator(SEL.burger).getAttribute('aria-expanded')
      if (await expanded() !== 'false') problems.push('bouton Menu : aria-expanded="false" attendu menu fermé')
      await page.keyboard.press('Enter')
      await page.locator('.r-mobile-menu').waitFor()
      if (await expanded() !== 'true') problems.push('bouton Menu : aria-expanded="true" attendu menu ouvert')
      const s = await tab(page, [SEL.mobileMenuLink])
      if (!s?.matches[0]) problems.push(`menu ouvert : Tab atteint ${s?.desc ?? '(rien)'} au lieu du premier lien du menu`)
      else if (!s.indicator) problems.push(`lien du menu sans focus visible (${s.style})`)
      await page.locator(SEL.burger).focus()
      await page.keyboard.press('Enter')
      await page.locator('.r-mobile-menu').waitFor({ state: 'detached' })
      return { problems, info: 'ouverture/fermeture à Entrée' }
    },
    viewports: ['mobile'],
  },
]

/**
 * Exécute les parcours clavier pour un viewport ; renvoie le nombre de
 * parcours en échec.
 */
export async function runKeyboard(context, base, vpName) {
  let failed = 0
  let run = 0
  for (const sc of KEYBOARD_SCENARIOS) {
    if (sc.viewports && !sc.viewports.includes(vpName)) continue
    const page = await context.newPage()
    const label = `clavier — ${sc.name} (${sc.url}) — ${vpName}`
    try {
      await open(page, base, sc.url)
      const { problems, info } = await sc.run(page)
      run++
      if (problems.length === 0) {
        console.log(`  ✓ ${label} : ${info}`)
      } else {
        failed++
        console.log(`  ✗ ${label} : ${problems.length} défaut(s)`)
        for (const p of problems.slice(0, 12)) console.log(`      · ${p}`)
        if (problems.length > 12) console.log(`      … et ${problems.length - 12} autre(s)`)
      }
    } catch (e) {
      run++
      failed++
      console.log(`  ✗ ${label} : ${e.message.split('\n')[0]}`)
    } finally {
      await page.close()
    }
  }
  return { run, failed }
}
