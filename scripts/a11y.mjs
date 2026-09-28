/**
 * Tests d'accessibilité automatisés (axe-core) — CDC Centre d'aide V1
 * A11Y-01 / A11Y-04.
 *
 *   npm run build && npm run test:a11y
 *
 * Sert le `dist/` construit (et pré-rendu) avec `server.cjs`, puis audite dans
 * Chromium, en viewport bureau ET mobile : l'accueil du Centre d'aide, un
 * thème, un article, le contact, et la vue intégrée à l'application
 * (`?integre=app` : accueil d'aide et article). Règles WCAG 2.0 / 2.1 / 2.2
 * A et AA.
 *
 * Échec (code 1) si une violation « serious » ou « critical » est trouvée ;
 * les violations « minor » / « moderate » sont listées sans faire échouer.
 * Volontairement hors de `vitest run` : il faut un build et un navigateur.
 *
 * Puis navigation au clavier (A11Y-01, `scripts/a11y-keyboard.mjs`) : ordre
 * du focus, focus visible, parcours clés au clavier seul. Tout défaut échoue.
 *
 * Navigateur : celui de `playwright-core`, installé une fois par
 * `npx playwright-core install chromium` (CI : `--with-deps --only-shell`) ;
 * `PLAYWRIGHT_BROWSERS_PATH` est respecté. `A11Y_CHROMIUM=<chemin>` force un
 * exécutable Chromium/Chrome déjà présent sur la machine.
 */
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import net from 'node:net'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'
import { AxeBuilder } from '@axe-core/playwright'
import { runKeyboard } from './a11y-keyboard.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')

/**
 * `then` : état interactif audité en plus de l'état initial (formulaire de
 * retour ouvert, erreurs du formulaire de contact affichées — A11Y-02/04).
 */
export const PAGES = [
  { name: 'Accueil du Centre d’aide', url: '/aide' },
  { name: 'Recherche d’aide', url: '/aide?q=document' },
  { name: 'Thème', url: '/aide/theme/documents' },
  {
    name: 'Article', url: '/aide/ajouter-un-document',
    then: { name: 'retour « Non » ouvert', act: async (page) => {
      await page.getByRole('button', { name: 'Non', exact: true }).click()
      await page.locator('#ha-feedback-comment').waitFor()
    } },
  },
  {
    name: 'Contact', url: '/contact',
    then: { name: 'erreur d’envoi affichée', act: async (page) => {
      await page.getByLabel('Prénom').fill('Camille')
      await page.getByLabel('Nom', { exact: true }).fill('Durand')
      await page.getByLabel('Email').fill('camille@example.com')
      await page.getByLabel('Sujet').selectOption({ index: 1 })
      await page.getByLabel('Message').fill('Test d’accessibilité')
      await page.getByRole('button', { name: 'Envoyer le message' }).click()
      await page.getByTestId('contact-error').waitFor()
    } },
  },
  { name: 'Vue intégrée — accueil', url: '/aide?integre=app' },
  { name: 'Vue intégrée — article', url: '/aide/ajouter-un-document?integre=app' },
]

export const VIEWPORTS = [
  { name: 'bureau', viewport: { width: 1280, height: 800 } },
  { name: 'mobile', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
]

export const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']
export const BLOCKING = new Set(['serious', 'critical'])

function freePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer()
    srv.unref()
    srv.on('error', reject)
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address()
      srv.close(() => resolve(port))
    })
  })
}

async function startServer() {
  const port = await freePort()
  const child = spawn(process.execPath, ['server.cjs'], {
    cwd: root,
    env: { ...process.env, PORT: String(port), CANONICAL_HOST: '', BASIC_AUTH_ENABLED: 'false' },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  await new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('server.cjs n’a pas démarré')), 10000)
    child.stdout.on('data', (d) => { if (String(d).includes('Listening')) { clearTimeout(t); resolve() } })
    child.on('exit', (code) => { clearTimeout(t); reject(new Error(`server.cjs arrêté (${code})`)) })
  })
  return { base: `http://127.0.0.1:${port}`, stop: () => child.kill() }
}

async function launchBrowser() {
  const executablePath = process.env.A11Y_CHROMIUM || undefined
  try {
    return await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) })
  } catch (e) {
    if (!executablePath && /Executable doesn't exist/i.test(e.message)) {
      throw new Error('Chromium de playwright-core absent : lancer `npx playwright-core install chromium` '
        + '(ou A11Y_CHROMIUM=<chemin vers chrome>).')
    }
    throw e
  }
}

function formatViolation(v) {
  const nodes = v.nodes.slice(0, 5).map((n) => `        · ${n.target.join(' ')}\n          ${n.failureSummary?.split('\n').slice(1).join(' ').trim() ?? ''}`)
  const more = v.nodes.length > 5 ? `\n        … et ${v.nodes.length - 5} autre(s)` : ''
  return `    [${v.impact}] ${v.id} — ${v.help} (${v.nodes.length} nœud(s))\n${nodes.join('\n')}${more}\n      ${v.helpUrl}`
}

async function main() {
  if (!existsSync(path.join(dist, 'spa.html'))) {
    console.error('[test:a11y] dist/ absent ou incomplet : lancer `npm run build` d’abord.')
    process.exit(2)
  }
  const server = await startServer()
  const browser = await launchBrowser()
  let blocking = 0
  let other = 0
  let audited = 0
  let kbRun = 0
  let kbFailed = 0
  try {
    for (const vp of VIEWPORTS) {
      const { name: vpName, ...options } = vp
      // Animations réduites : les éléments « scroll reveal » sont visibles
      // d'emblée, le contraste est mesuré sur l'état final.
      const context = await browser.newContext({ ...options, reducedMotion: 'reduce', locale: 'fr-FR' })
      // Aucun appel réel à l'API de l'application : réponses simulées (CORS
      // compris, l'application est une autre origine). Le retour d'article
      // renvoie un reçu (formulaire de commentaire affiché) ; le contact
      // échoue (message d'erreur affiché, A11Y-02).
      await context.route(/\/api\//, (route) => {
        const cors = {
          'access-control-allow-origin': '*',
          'access-control-allow-headers': 'content-type',
          'access-control-allow-methods': 'POST, OPTIONS',
        }
        if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors })
        const url = route.request().url()
        if (url.includes('/api/contact')) return route.fulfill({ status: 500, headers: cors, body: '' })
        return route.fulfill({
          status: 200, headers: cors, contentType: 'application/json',
          body: JSON.stringify({ feedbackId: 'a11y', commentToken: 'a11y' }),
        })
      })
      for (const p of PAGES) {
        const page = await context.newPage()
        const res = await page.goto(server.base + p.url, { waitUntil: 'networkidle' })
        if (!res || res.status() >= 400) throw new Error(`${p.url} : HTTP ${res?.status()}`)
        await page.waitForFunction(() => document.querySelector('#app')?.children.length, null, { timeout: 10000 })
        await page.waitForTimeout(150)
        const audit = async (label) => {
          const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze()
          const bad = violations.filter((v) => BLOCKING.has(v.impact))
          const rest = violations.filter((v) => !BLOCKING.has(v.impact))
          blocking += bad.length
          other += rest.length
          audited++
          if (violations.length === 0) {
            console.log(`  ✓ ${label}`)
          } else {
            console.log(`  ${bad.length ? '✗' : '!'} ${label} : ${bad.length} bloquante(s), ${rest.length} autre(s)`)
            for (const v of violations) console.log(formatViolation(v))
          }
        }
        await audit(`${p.name} (${p.url}) — ${vpName}`)
        if (p.then) {
          await p.then.act(page)
          await page.waitForTimeout(300)
          await audit(`${p.name}, ${p.then.name} (${p.url}) — ${vpName}`)
        }
        await page.close()
      }
      const kb = await runKeyboard(context, server.base, vpName)
      kbRun += kb.run
      kbFailed += kb.failed
      await context.close()
    }
  } finally {
    await browser.close()
    server.stop()
  }
  const kbSummary = `clavier : ${kbRun - kbFailed}/${kbRun} parcours sans défaut`
  if (blocking > 0 || kbFailed > 0) {
    console.error(`[test:a11y] ${blocking} violation(s) serious/critical sur ${audited} états audités ; ${kbSummary}.`)
    process.exit(1)
  }
  console.log(`[test:a11y] ${audited} états audités (${PAGES.length} pages × ${VIEWPORTS.length} viewports + états interactifs) : aucune violation serious/critical (${other} mineure(s)/modérée(s)) ; ${kbSummary}.`)
}

main().catch((e) => {
  console.error(`[test:a11y] ${e.stack || e.message}`)
  process.exit(2)
})
