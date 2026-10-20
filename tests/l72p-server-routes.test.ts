// @vitest-environment node
/**
 * Lot 72 — `server.cjs` : vraies 404, anciennes URL (ticket « liens
 * obsolètes app ↔ vitrine », §3.3).
 *
 * Le serveur est lancé RÉELLEMENT sur un `dist/` minimal, dont
 * `.site-routes.json` est produit par le même code que le build
 * (`computeLinkInventory`) : la liste des routes n'est pas recopiée ici.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { spawn, type ChildProcess } from 'node:child_process'
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { request } from 'node:http'
import { computeLinkInventory } from '../link-inventory.build'

const repo = process.cwd()
const inv = computeLinkInventory(repo)

function makeDist(opts: { indexable: boolean; siteRoutes: boolean }): string {
  const dir = mkdtempSync(path.join(tmpdir(), 'verebona-l72p-'))
  copyFileSync(path.join(repo, 'server.cjs'), path.join(dir, 'server.cjs'))
  const dist = path.join(dir, 'dist')
  mkdirSync(path.join(dist, 'aide', 'theme'), { recursive: true })
  mkdirSync(path.join(dist, 'ressources'), { recursive: true })
  writeFileSync(path.join(dist, 'index.html'), '<html>ACCUEIL <section id="how"></section></html>')
  writeFileSync(path.join(dist, 'spa.html'), '<html>SPA</html>')
  writeFileSync(path.join(dist, 'aide', 'index.html'), '<html>AIDE</html>')
  writeFileSync(path.join(dist, 'aide', 'parrainage.html'), '<html>PARRAINAGE</html>')
  writeFileSync(path.join(dist, 'aide', 'theme', 'compte.html'), '<html>THEME</html>')
  writeFileSync(path.join(dist, 'aide', '.redirects.json'), '{}')
  writeFileSync(path.join(dist, 'ressources', 'index.html'), '<html>RESSOURCES</html>')
  writeFileSync(path.join(dist, 'ressources', 'bail.html'), '<html>BAIL</html>')
  writeFileSync(path.join(dist, 'ressources', '.routes.json'), JSON.stringify({ redirects: {}, gone: [] }))
  writeFileSync(path.join(dist, '.site-env.json'), JSON.stringify({
    environment: opts.indexable ? 'production' : 'preprod', defaultMode: 'full', indexable: opts.indexable, appOrigin: 'https://app.verebona.fr',
  }))
  if (opts.siteRoutes) {
    writeFileSync(path.join(dist, '.site-routes.json'), JSON.stringify({
      staticRoutes: inv.routes.static, legacyRedirects: inv.legacyRedirects, retired: inv.retired, homeAnchors: inv.homeAnchors,
    }))
  }
  return dir
}

interface Res { status: number; headers: Record<string, string | string[] | undefined>; body: string }
function get(port: number, p: string, headers: Record<string, string> = {}): Promise<Res> {
  return new Promise((resolve, reject) => {
    const req = request({ host: '127.0.0.1', port, path: p, headers }, (res) => {
      let body = ''
      res.on('data', (c) => { body += c })
      res.on('end', () => resolve({ status: res.statusCode ?? 0, headers: res.headers, body }))
    })
    req.on('error', reject)
    req.end()
  })
}
async function start(dir: string, env: Record<string, string>): Promise<{ port: number; child: ChildProcess; logs: string[] }> {
  const port = 41000 + Math.floor(Math.random() * 10000)
  const logs: string[] = []
  const child = spawn(process.execPath, ['server.cjs'], {
    cwd: dir,
    env: { ...process.env, PORT: String(port), NODE_PATH: path.join(repo, 'node_modules'), BASIC_AUTH_ENABLED: 'false', ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  child.stderr!.on('data', (d) => logs.push(String(d)))
  await new Promise<void>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('server.cjs n’a pas démarré')), 8000)
    child.stdout!.on('data', (d) => { logs.push(String(d)); if (String(d).includes('Listening')) { clearTimeout(t); resolve() } })
    child.on('exit', (code) => { clearTimeout(t); reject(new Error(`server.cjs arrêté (${code})`)) })
  })
  return { port, child, logs }
}

describe('L72P-HTTP — préproduction (sans CANONICAL_HOST)', () => {
  let dir: string, srv: Awaited<ReturnType<typeof start>>
  beforeAll(async () => { dir = makeDist({ indexable: false, siteRoutes: true }); srv = await start(dir, {}) })
  afterAll(() => { srv?.child.kill(); rmSync(dir, { recursive: true, force: true }) })

  it('L72P-HTTP-01 — /pourquoi-verebona : vraie 404 (coquille SPA « page introuvable », no-store), jamais 200 ni redirection vers l’accueil', async () => {
    const r = await get(srv.port, '/pourquoi-verebona')
    expect(r.status).toBe(404)
    expect(r.headers.location).toBeUndefined()
    expect(r.body).toContain('SPA')
    expect(r.headers['cache-control']).toBe('no-store')
  })

  it('L72P-HTTP-02 — /comment-ca-marche : UNE 301 vers /#how (fragment dans Location), query conservée avant le fragment', async () => {
    const r = await get(srv.port, '/comment-ca-marche')
    expect(r.status).toBe(301)
    expect(r.headers.location).toBe('/#how')
    const q = await get(srv.port, '/comment-ca-marche/?utm_source=x')
    expect(q.status).toBe(301)
    expect(q.headers.location).toBe('/?utm_source=x#how')
    expect((await get(srv.port, '/Comment-Ca-Marche')).headers.location).toBe('/#how')
    // La destination est servie directement (pas de second saut).
    const dest = await get(srv.port, '/')
    expect(dest.status).toBe(200)
    expect(dest.body).toContain('id="how"')
  })

  it('L72P-HTTP-03 — adresse inconnue : 404 (plus de soft 404) ; route déclarée : 200', async () => {
    for (const p of ['/nexiste-pas', '/tarifs', '/contact/inconnu', '/cgv']) {
      const r = await get(srv.port, p)
      expect({ p, status: r.status }).toEqual({ p, status: 404 })
    }
    for (const p of inv.routes.static.filter((s) => s !== '/')) {
      const r = await get(srv.port, p)
      expect({ p, status: r.status }).toEqual({ p, status: 200 })
    }
    // Variantes tolérées par le routeur (insensible à la casse, slash final).
    expect((await get(srv.port, '/Contact')).status).toBe(200)
    expect((await get(srv.port, '/contact/?x=1')).status).toBe(200)
  })

  it('L72P-HTTP-04 — routes dynamiques du Centre d’aide et des Ressources : inchangées (200 si la page existe, 404 sinon)', async () => {
    expect((await get(srv.port, '/aide')).status).toBe(200)
    expect((await get(srv.port, '/aide/parrainage')).body).toContain('PARRAINAGE')
    expect((await get(srv.port, '/aide/theme/compte')).body).toContain('THEME')
    expect((await get(srv.port, '/aide/inconnu')).status).toBe(404)
    expect((await get(srv.port, '/ressources/bail')).body).toContain('BAIL')
    expect((await get(srv.port, '/ressources/inconnu')).status).toBe(404)
  })

  it('L72P-HTTP-05 — préproduction : X-Robots-Tag conservé sur la 404', async () => {
    expect((await get(srv.port, '/pourquoi-verebona')).headers['x-robots-tag']).toBe('noindex, nofollow')
  })
})

describe('L72P-HTTP — production avec CANONICAL_HOST : jamais de chaîne', () => {
  let dir: string, srv: Awaited<ReturnType<typeof start>>
  beforeAll(async () => { dir = makeDist({ indexable: true, siteRoutes: true }); srv = await start(dir, { CANONICAL_HOST: 'www.verebona.fr' }) })
  afterAll(() => { srv?.child.kill(); rmSync(dir, { recursive: true, force: true }) })

  it('L72P-HTTP-06 — http://verebona.fr/comment-ca-marche : UNE 301 directement vers https://www.verebona.fr/#how', async () => {
    const r = await get(srv.port, '/comment-ca-marche?a=1', { host: 'verebona.fr' })
    expect(r.status).toBe(301)
    expect(r.headers.location).toBe('https://www.verebona.fr/?a=1#how')
  })

  it('L72P-HTTP-07 — hôte canonique : 301 relative vers /#how ; page retirée : 404', async () => {
    const https = { host: 'www.verebona.fr', 'x-forwarded-proto': 'https' }
    expect((await get(srv.port, '/comment-ca-marche', https)).headers.location).toBe('/#how')
    expect((await get(srv.port, '/pourquoi-verebona', https)).status).toBe(404)
    expect((await get(srv.port, '/contact', https)).status).toBe(200)
  })
})

describe('L72P-HTTP — build sans `.site-routes.json` (repli prudent)', () => {
  let dir: string, srv: Awaited<ReturnType<typeof start>>
  beforeAll(async () => { dir = makeDist({ indexable: false, siteRoutes: false }); srv = await start(dir, {}) })
  afterAll(() => { srv?.child.kill(); rmSync(dir, { recursive: true, force: true }) })

  it('L72P-HTTP-08 — fichier absent : le site reste servi (coquille 200) et l’anomalie est signalée au démarrage', async () => {
    expect((await get(srv.port, '/contact')).status).toBe(200)
    expect(srv.logs.join('')).toMatch(/\.site-routes\.json not found/)
  })
})
