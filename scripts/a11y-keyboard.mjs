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
  // Lot 69P — accueil : ordinateur. Lot 71P : Fonctionnalités (neuf vues,
  // carrousel sur mobile). Lot 72G : le bandeau des types de biens n'a plus
  // de bouton de pause ; le bandeau lui-même est l'arrêt de tabulation.
  // Lot 71P : la maquette affiche de vraies captures ; plus de menu latéral cliquable.
  appArrow: '.app__arrow',
  featTrack: '#feat-track',
  featNext: '.feat__views button[aria-label="Fonctionnalité suivante"]',
  kindsMarquee: '.uc__marquee',
}

/** Décalage horizontal courant de la piste du bandeau (matrice de transformation). */
function marqueeX(page) {
  return page.evaluate(() => {
    const t = getComputedStyle(document.querySelector('.uc__marquee-track')).transform
    return t === 'none' ? 0 : new DOMMatrixReadOnly(t).m41
  })
}
/** Le bandeau bouge-t-il ? (deux mesures espacées de 700 ms) */
async function marqueeMoves(page) {
  // Laisse l'animation (fil du compositeur) prendre en compte la pause / reprise.
  await page.waitForTimeout(200)
  const a = await marqueeX(page)
  await page.waitForTimeout(700)
  return Math.abs((await marqueeX(page)) - a) > 0.5
}
/** Le bandeau est-il en arrêt durable (focus clavier, clic ou toucher) ? */
function marqueePaused(page) {
  return page.evaluate(() => document.querySelector('.uc__kinds').classList.contains('uc__kinds--paused'))
}
/** Débordement horizontal de la page (px). */
function pageOverflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
}

/** État visible d'un carrousel : position écrite, bornes, annonce. */
function carouselState(page, scope) {
  return page.evaluate((sc) => {
    const root = document.querySelector(sc)
    const btns = [...root.querySelectorAll('.vb-carousel__btn')]
    return {
      count: root.querySelector('.vb-carousel__count')?.textContent.trim(),
      disabled: btns.map((b) => b.getAttribute('aria-disabled')),
      live: root.querySelector('[aria-live]')?.textContent.trim(),
      scroll: root.querySelector('.vb-carousel__track').scrollLeft,
      focusIn: btns.indexOf(document.activeElement),
    }
  }, scope)
}

/**
 * Lot 69P : carrousel parcouru au clavier seul — bouton « suivant » atteint au
 * Tab avec focus visible, Entrée / Espace déplacent la piste, position et
 * annonce mises à jour, le focus reste sur le bouton (aria-disabled aux bornes,
 * jamais `disabled`), puis flèche droite sur la piste focalisée.
 */
function carouselScenario(name, scope, nextSel, trackSel, { viewports, presses = 1 } = {}) {
  return {
    name, url: '/', viewports,
    run: async (page) => {
      const problems = []
      const s = await tabTo(page, nextSel)
      if (!s.indicator) problems.push(`bouton suivant sans focus visible (${s.style})`)
      const before = await carouselState(page, scope)
      if (before.disabled[0] !== 'true') problems.push(`au départ, « précédent » devrait être aria-disabled="true" (${before.disabled[0]})`)
      for (let i = 0; i < presses; i++) { await page.keyboard.press(i % 2 ? ' ' : 'Enter'); await page.waitForTimeout(450) }
      const after = await carouselState(page, scope)
      if (after.count === before.count) problems.push(`position inchangée après Entrée : ${after.count}`)
      if (!(after.scroll > before.scroll)) problems.push('la piste n’a pas défilé')
      if (after.focusIn !== 1) problems.push('le focus a quitté le bouton « suivant »')
      if (after.disabled[0] !== 'false') problems.push('« précédent » reste désactivé après un déplacement')
      if (!after.live) problems.push('aucune annonce (aria-live) après le déplacement')
      // Flèche droite sur la piste elle-même (défilement natif au clavier).
      await page.locator(trackSel).focus()
      const t0 = await carouselState(page, scope)
      await page.keyboard.press('ArrowRight')
      await page.waitForTimeout(450)
      const t1 = await carouselState(page, scope)
      if (!(t1.scroll > t0.scroll) && t0.disabled[1] !== 'true') problems.push('flèche droite sur la piste : aucun défilement')
      return { problems, info: `${before.count} → ${after.count} (${after.live})` }
    },
  }
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
  // Lot 69P — accueil : ordre des contrôles de la démonstration produit.
  // Lot 71P : plus de visite sous la démonstration ; carrousel Fonctionnalités
  // sur mobile (grille sans arrêt sur ordinateur). Le bouton du bandeau est
  // masqué en mouvement réduit (contexte de l'audit) : voir le parcours dédié.
  orderScenario('Accueil', '/',
    [SEL.logo, SEL.headerNav, SEL.appArrow, SEL.footer], { viewports: ['bureau'] }),
  orderScenario('Accueil', '/',
    [SEL.logo, SEL.burger, SEL.appArrow, SEL.featTrack, SEL.featNext, SEL.footer], { viewports: ['mobile'] }),
  carouselScenario('Fonctionnalités : carrousel au clavier', '.feat__views', SEL.featNext, SEL.featTrack, { viewports: ['mobile'], presses: 2 }),
  {
    // Lot 71P (reprend le lot 70P) : sur ordinateur, les neuf vues forment une
    // grille 3 × 3 entièrement visible — aucun arrêt de tabulation inutile.
    name: 'Fonctionnalités : grille 3 × 3 sur ordinateur', url: '/', viewports: ['bureau'],
    run: async (page) => {
      const problems = []
      const st = await page.evaluate(() => {
        const t = document.querySelector('#feat-track')
        const vw = document.documentElement.clientWidth
        const items = [...t.children].map((li) => li.getBoundingClientRect())
        const btns = [...document.querySelectorAll('.feat__views .vb-carousel__btn')]
        return {
          shown: t.getBoundingClientRect().height > 0,
          n: items.length,
          inside: items.every((r) => r.width > 0 && r.left >= 0 && r.right <= vw),
          rows: new Set(items.map((r) => Math.round(r.top))).size,
          cols: new Set(items.map((r) => Math.round(r.left))).size,
          tabindex: t.getAttribute('tabindex'),
          scrolls: t.scrollWidth > t.clientWidth + 1,
          btnsHidden: btns.every((b) => b.offsetParent === null),
          tour: document.querySelectorAll('.tour, #tour-track').length,
        }
      })
      if (!st.shown) problems.push('Fonctionnalités non affichées sur ordinateur')
      if (st.n !== 9 || !st.inside) problems.push(`les neuf vues ne sont pas toutes visibles (${st.n}, inside=${st.inside})`)
      if (st.rows !== 3 || st.cols !== 3) problems.push(`grille 3 × 3 attendue : ${st.rows} rangées × ${st.cols} colonnes`)
      if (st.tabindex !== null || st.scrolls) problems.push(`piste encore défilante ou focalisable (tabindex=${st.tabindex})`)
      if (!st.btnsHidden) problems.push('boutons du carrousel visibles alors que rien ne défile')
      if (st.tour) problems.push('l’ancienne visite en six vues est encore présente')
      const { stops } = await walk(page, ['.feat__views *, #feat-track'])
      if (stops.some((s) => s.matches[0])) problems.push('un arrêt de tabulation dans les Fonctionnalités (grille)')
      return { problems, info: `${st.n} vues, ${st.rows} × ${st.cols}, aucun arrêt` }
    },
  },
  {
    // Lot 71P — WCAG 2.2.2 : bandeau défilant des types de biens. Lot 72G
    // (demande PO) : plus de surtitre ni de bouton de pause visible.
    // Alternative vérifiée ici, animations actives : il défile ; le focus
    // clavier l'arrête (le bandeau est un arrêt de tabulation nommé, focus
    // visible) et il reprend à la sortie du focus ; un toucher l'arrête puis
    // le relance ; un clic ou un survol VOLONTAIRE de la souris l'arrête
    // jusqu'à la sortie du pointeur ; jamais de débordement horizontal.
    // Lot 76P (PO : « ne tourne pas en web ») : sur ordinateur, amené sous un
    // pointeur immobile par la molette, il continue de défiler.
    name: 'Bandeau des types de biens : arrêt au focus clavier, au clic / toucher, au survol, puis reprise', url: '/',
    run: async (page) => {
      const problems = []
      await page.emulateMedia({ reducedMotion: 'no-preference' })
      const fresh = async () => {
        await page.reload({ waitUntil: 'networkidle' })
        await page.waitForFunction(() => document.querySelector('.uc__marquee-list--copy'), null, { timeout: 10000 })
        await page.locator('.uc__marquee').scrollIntoViewIfNeeded()
        await page.mouse.move(0, 0)
      }
      await fresh()
      const st = await page.evaluate(() => ({
        toggle: !!document.querySelector('.uc__kinds-toggle, .uc__kinds button'),
        title: !!document.querySelector('.uc__kinds-title') || /prend en charge/i.test(document.querySelector('.uc__kinds').innerText),
        tabindex: document.querySelector('.uc__marquee').getAttribute('tabindex'),
        name: document.querySelector('.uc__marquee').getAttribute('aria-label') || '',
        fineHover: matchMedia('(hover: hover)').matches,
      }))
      if (st.toggle) problems.push('bouton de pause encore présent (retiré à la demande du PO)')
      if (st.title) problems.push('surtitre « Les biens que Verebona prend en charge » encore affiché')
      if (st.tabindex !== '0' || !/s’arrête au focus/.test(st.name)) problems.push(`bandeau non focalisable ou sans nom explicite (tabindex=${st.tabindex}, « ${st.name} »)`)
      if (!(await marqueeMoves(page))) problems.push('le bandeau ne défile pas (animations actives)')
      const ov = await pageOverflow(page)
      if (ov > 0) problems.push(`débordement horizontal de la page : ${ov} px`)
      // Clavier : arrêt pendant le focus, reprise à la sortie (lot 76P).
      const s = await tabTo(page, SEL.kindsMarquee)
      if (!s.indicator) problems.push(`bandeau sans focus visible (${s.style})`)
      if (!(await marqueePaused(page)) || await marqueeMoves(page)) problems.push('focus clavier : le bandeau bouge encore')
      await page.keyboard.press('Tab')
      if (await marqueePaused(page) || !(await marqueeMoves(page))) problems.push('focus clavier quitté : le bandeau ne reprend pas')
      await fresh()
      const box = await page.locator('.uc__marquee').boundingBox()
      const x = box.x + 40, y = box.y + box.height / 2
      if (st.fineHover) {
        // Ordinateur : clic → arrêt tant que le pointeur reste ; sortie → reprise.
        await page.mouse.click(x, y)
        if (!(await marqueePaused(page)) || await marqueeMoves(page)) problems.push('clic : le bandeau ne s’arrête pas')
        await page.mouse.move(0, 0)
        if (await marqueePaused(page) || !(await marqueeMoves(page))) problems.push('pointeur sorti après un clic : le bandeau ne reprend pas')
        // Survol volontaire : arrêt ; sortie : reprise.
        await page.mouse.move(x, y, { steps: 3 })
        if (await marqueeMoves(page)) problems.push('survol : le bandeau ne s’arrête pas')
        await page.mouse.move(0, 0)
        if (!(await marqueeMoves(page))) problems.push('fin du survol : le bandeau ne reprend pas')
        // Molette : la page amène le bandeau sous un pointeur IMMOBILE → il défile.
        await page.evaluate(() => window.scrollTo(0, 0))
        const vh = page.viewportSize().height
        await page.mouse.move(page.viewportSize().width / 2, vh / 2)
        const target = await page.evaluate((h) => { const r = document.querySelector('.uc__marquee').getBoundingClientRect(); return r.top + scrollY + r.height / 2 - h / 2 }, vh)
        await page.mouse.wheel(0, target)
        await page.waitForTimeout(500)
        const under = await page.evaluate(([cx, cy]) => !!document.elementFromPoint(cx, cy)?.closest('.uc__marquee'), [page.viewportSize().width / 2, vh / 2])
        if (!under) problems.push('molette : le bandeau n’est pas arrivé sous le pointeur (scénario non joué)')
        else if (await marqueePaused(page) || !(await marqueeMoves(page))) problems.push('molette : bandeau sous un pointeur immobile arrêté (cause du « ne tourne pas en web »)')
      } else {
        // Écran tactile : toucher → arrêt ; second toucher → relance.
        await page.touchscreen.tap(x, y)
        if (!(await marqueePaused(page)) || await marqueeMoves(page)) problems.push('toucher : le bandeau ne s’arrête pas')
        await page.touchscreen.tap(x, y)
        if (await marqueePaused(page) || !(await marqueeMoves(page))) problems.push('second toucher : le bandeau ne repart pas')
      }
      return { problems, info: `arrêt au focus puis reprise, ${st.fineHover ? 'clic / survol puis reprise, défile sous un pointeur immobile' : 'toucher'}, aucun bouton` }
    },
  },
  {
    // Lot 71P — mouvement réduit (contexte de l'audit) : liste statique et
    // lisible, sans copie ni bouton, contenu unique pour les lecteurs d'écran ;
    // lot 72G : le bandeau immobile n'est pas un arrêt de tabulation.
    name: 'Bandeau des types de biens : mouvement réduit', url: '/',
    run: async (page) => {
      const problems = []
      const st = await page.evaluate(() => {
        const vw = document.documentElement.clientWidth
        const track = document.querySelector('.uc__marquee-track')
        const copy = document.querySelector('.uc__marquee-list--copy')
        const items = [...document.querySelectorAll('#uc-kinds li')].map((li) => li.getBoundingClientRect())
        return {
          anim: getComputedStyle(track).animationName,
          transform: getComputedStyle(track).transform,
          copyShown: !!copy && getComputedStyle(copy).display !== 'none',
          copyHidden: !copy || copy.getAttribute('aria-hidden') === 'true',
          focusable: document.querySelector('.uc__marquee').hasAttribute('tabindex'),
          toggle: !!document.querySelector('.uc__kinds-toggle, .uc__kinds button'),
          n: items.length,
          inside: items.every((r) => r.left >= 0 && r.right <= vw + 0.5),
        }
      })
      if (st.anim !== 'none' || st.transform !== 'none') problems.push(`le bandeau est encore animé (${st.anim}, ${st.transform})`)
      if (st.copyShown || !st.copyHidden) problems.push('copie de boucle affichée ou exposée aux lecteurs d’écran')
      if (st.toggle) problems.push('bouton de pause présent (retiré à la demande du PO)')
      if (st.focusable) problems.push('bandeau immobile mais encore arrêt de tabulation')
      if (st.n !== 10 || !st.inside) problems.push(`liste statique illisible (${st.n} types, entièrement visibles : ${st.inside})`)
      const ov = await pageOverflow(page)
      if (ov > 0) problems.push(`débordement horizontal de la page : ${ov} px`)
      return { problems, info: `${st.n} types visibles, aucune animation` }
    },
  },
  {
    // Lot 80P (PO du 22/10 : « parfois ça marche et parfois non », capture
    // figée sur deux lignes) : le bandeau défile à CHAQUE chargement, quelles
    // que soient les conditions — à froid (cache coupé), à chaud, arrivée par
    // #cas-usage, retour SPA vers l'accueil, polices puis JS servis en
    // retard, redimensionnement — et la seule cause de l'état « deux lignes,
    // immobile » est la préférence système « mouvement réduit », suivie dans
    // les deux sens sans recharger (Bureau à distance, réglage Windows).
    name: 'Bandeau des types de biens : défile à chaque chargement (conditions variées)', url: '/',
    run: async (page) => {
      const problems = []
      await page.emulateMedia({ reducedMotion: 'no-preference' })
      const cdp = await page.context().newCDPSession(page)
      const state = () => page.evaluate(() => {
        const tops = new Set([...document.querySelectorAll('#uc-kinds li')].map((li) => Math.round(li.getBoundingClientRect().top)))
        return {
          lines: tops.size,
          copy: !!document.querySelector('.uc__marquee-list--copy'),
          paused: document.querySelector('.uc__kinds').classList.contains('uc__kinds--paused'),
          tabindex: document.querySelector('.uc__marquee').getAttribute('tabindex'),
        }
      })
      const check = async (label) => {
        await page.waitForFunction(() => document.querySelector('.uc__marquee-list--copy'), null, { timeout: 10000 })
          .catch(() => problems.push(`${label} : copie de boucle jamais ajoutée`))
        await page.locator('.uc__marquee').scrollIntoViewIfNeeded()
        await page.mouse.move(0, 0)
        const st = await state()
        const moves = await marqueeMoves(page)
        if (!moves || st.lines !== 1 || !st.copy || st.paused || st.tabindex !== '0') {
          problems.push(`${label} : figé (défile=${moves}, lignes=${st.lines}, copie=${st.copy}, arrêt=${st.paused}, tabindex=${st.tabindex})`)
        }
      }
      const delay = (ms) => async (route) => { await new Promise((r) => setTimeout(r, ms)); await route.continue() }
      const CONDITIONS = [
        ['à froid', async () => { await cdp.send('Network.setCacheDisabled', { cacheDisabled: true }); await page.goto(new URL('/', page.url()).href); await cdp.send('Network.setCacheDisabled', { cacheDisabled: false }) }],
        ['à chaud', async () => { await page.reload() }],
        ['arrivée par #cas-usage', async () => { await page.goto(new URL('/#cas-usage', page.url()).href) }],
        ['retour SPA depuis /contact', async () => {
          await page.goto(new URL('/contact', page.url()).href)
          await page.evaluate(() => { window.__l80pSpa = true })
          await page.locator(SEL.logo).first().click()
          await page.waitForURL((u) => u.pathname === '/')
          if (!(await page.evaluate(() => window.__l80pSpa === true))) problems.push('retour SPA : la page a été rechargée (scénario non joué)')
        }],
        ['polices servies en retard', async () => { await page.route(/\/fonts\//, delay(1200)); await cdp.send('Network.setCacheDisabled', { cacheDisabled: true }); await page.goto(new URL('/', page.url()).href); await cdp.send('Network.setCacheDisabled', { cacheDisabled: false }); await page.unroute(/\/fonts\//) }],
        ['JS servi en retard', async () => { await page.route(/\/assets\/.*\.js$/, delay(600)); await cdp.send('Network.setCacheDisabled', { cacheDisabled: true }); await page.goto(new URL('/', page.url()).href); await cdp.send('Network.setCacheDisabled', { cacheDisabled: false }); await page.unroute(/\/assets\/.*\.js$/) }],
        ['redimensionnement', async () => { const vp = page.viewportSize(); await page.setViewportSize({ width: Math.max(320, vp.width - 500), height: vp.height }); await page.waitForTimeout(150); await page.setViewportSize(vp) }],
      ]
      for (let round = 1; round <= 2; round++) {
        for (const [label, act] of CONDITIONS) { await act(); await check(`${label} (${round})`) }
      }
      // Préférence système basculée en cours de visite : statique, puis défile.
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.waitForTimeout(150)
      const red = await state()
      if (red.lines < 2 && page.viewportSize().width < 1600) problems.push(`mouvement réduit : liste non repliée (${red.lines} ligne)`)
      if (await marqueeMoves(page)) problems.push('mouvement réduit activé en cours de visite : le bandeau bouge encore')
      if (red.tabindex !== null) problems.push('mouvement réduit : le bandeau reste un arrêt de tabulation')
      await page.emulateMedia({ reducedMotion: 'no-preference' })
      await check('mouvement réduit désactivé en cours de visite')
      return { problems, info: `${CONDITIONS.length * 2} chargements / navigations : défile à chaque fois ; mouvement réduit basculé à chaud suivi dans les deux sens` }
    },
  },
  {
    // Lot 76P (PO du 21/10, « Alignement ! ») : titres des cas d'usage alignés
    // sur une même verticale, juste après la colonne d'étiquettes (largeur
    // commune aux deux listes), aucune étiquette tronquée, chevron à droite ;
    // au zoom 200 % (≈ 195 px), aucun débordement horizontal.
    name: 'Cas d’usage : titres alignés en colonne, étiquettes entières', url: '/',
    run: async (page) => {
      const problems = []
      const measure = () => page.evaluate(() => [...document.querySelectorAll('.uc__head')].map((h) => {
        const b = h.querySelector('.uc__badge').getBoundingClientRect()
        const t = h.querySelector('.uc__item-title').getBoundingClientRect()
        const c = h.querySelector('.uc__chev').getBoundingClientRect()
        const badge = h.querySelector('.uc__badge')
        return { label: badge.textContent.trim(), bl: b.left, br: b.right, bt: b.top, tl: t.left, tt: t.top, cr: c.right, hr: h.getBoundingClientRect().right, cut: badge.scrollWidth > badge.clientWidth + 0.5 }
      }))
      const rows = await measure()
      if (rows.length !== 8) problems.push(`${rows.length} cas d’usage au lieu de 8`)
      const lefts = [...new Set(rows.map((r) => Math.round(r.tl)))]
      if (lefts.length !== 1) problems.push(`titres sur ${lefts.length} verticales : ${rows.map((r) => `${r.label}→${Math.round(r.tl)}`).join(', ')}`)
      for (const r of rows) {
        if (r.cut) problems.push(`étiquette « ${r.label} » tronquée`)
        if (r.br > r.tl - 4) problems.push(`étiquette « ${r.label} » collée au titre ou le chevauche`)
        if (r.cr > r.hr) problems.push(`chevron hors de la ligne (« ${r.label} »)`)
      }
      const ov = await pageOverflow(page)
      if (ov > 0) problems.push(`débordement horizontal : ${ov} px`)
      // Zoom 200 % d'un téléphone : ≈ 195 px CSS.
      const vp = page.viewportSize()
      await page.setViewportSize({ width: 195, height: vp.height })
      await page.waitForTimeout(150)
      const z = await measure()
      const zl = [...new Set(z.map((r) => Math.round(r.tl)))]
      if (zl.length !== 1) problems.push(`zoom 200 % : titres non alignés (${zl.join(', ')})`)
      if (z.some((r) => r.cut)) problems.push('zoom 200 % : étiquette tronquée')
      if (z.some((r) => Math.round(r.bl) !== Math.round(r.tl))) problems.push('zoom 200 % : étiquette et titre non alignés à gauche')
      const zov = await pageOverflow(page)
      if (zov > 0) problems.push(`zoom 200 % : débordement horizontal ${zov} px`)
      await page.setViewportSize(vp)
      return { problems, info: `8 titres à x=${lefts.join('/')} px ; zoom 200 % : étiquette au-dessus, x=${zl.join('/')} px` }
    },
  },
  {
    // Le bandeau des types de biens (lot 71P) est le SEUL contenu qui bouge
    // en continu — décision PO, arrêt au focus / clic / toucher / survol
    // (parcours ci-dessus ; lot 72G : sans bouton). L'illustration du dépôt
    // (lot 72G) n'est jouée qu'une fois, < 3 s. Les carrousels et
    // démonstrations restent immobiles sans action.
    name: 'Accueil : aucun défilement automatique des carrousels (animations non réduites)', url: '/',
    run: async (page) => {
      const problems = []
      await page.emulateMedia({ reducedMotion: 'no-preference' })
      await page.reload({ waitUntil: 'networkidle' })
      await page.waitForFunction(() => document.querySelector('#app')?.children.length, null, { timeout: 10000 })
      const snap = () => page.evaluate(() => JSON.stringify({
        app: document.querySelector('.app__dot[aria-pressed="true"]')?.getAttribute('aria-label'),
        how: [...document.querySelectorAll('.how__step')].map((b) => b.getAttribute('aria-pressed')),
        tracks: [...document.querySelectorAll('.vb-carousel__track')].map((t) => t.scrollLeft),
      }))
      const a = await snap()
      await page.waitForTimeout(4500)
      const b = await snap()
      if (a !== b) problems.push(`contenu modifié sans action en 4,5 s : ${a} → ${b}`)
      return { problems, info: 'état identique après 4,5 s' }
    },
  },
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
