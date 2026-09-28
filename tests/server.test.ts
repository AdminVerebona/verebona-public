// @vitest-environment node
/**
 * Serveur de production `server.cjs` — CDC Données structurées §7 (hôte
 * canonique), CDC pré-lancement §8.2 (X-Robots-Tag), CDC Sitemap §7,
 * CDC Centre d'aide REDIR-01 à REDIR-03.
 *
 * Le serveur lit `dist/` à côté de lui au démarrage : on le copie dans un
 * dossier temporaire avec un `dist/` minimal, puis on le lance réellement.
 * `NODE_PATH` lui donne les dépendances du dépôt.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { spawn, type ChildProcess } from 'node:child_process'
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { request } from 'node:http'

const repo = process.cwd()

function makeDist(indexable: boolean): string {
  const dir = mkdtempSync(path.join(tmpdir(), 'verebona-server-'))
  copyFileSync(path.join(repo, 'server.cjs'), path.join(dir, 'server.cjs'))
  const dist = path.join(dir, 'dist')
  mkdirSync(path.join(dist, 'aide'), { recursive: true })
  writeFileSync(path.join(dist, 'index.html'), '<html>ACCUEIL</html>')
  writeFileSync(path.join(dist, 'spa.html'), '<html>SPA</html>')
  writeFileSync(path.join(dist, 'aide', 'index.html'), '<html>AIDE</html>')
  writeFileSync(path.join(dist, 'aide', 'parrainage.html'), '<html>PARRAINAGE</html>')
  writeFileSync(path.join(dist, 'aide', '.redirects.json'), JSON.stringify({ '/aide/ancien-parrainage': '/aide/parrainage' }))
  if (indexable) writeFileSync(path.join(dist, 'sitemap.xml'), '<?xml version="1.0"?><urlset/>')
  else writeFileSync(path.join(dist, 'index.prelaunch.html'), '<html>ACCUEIL PRELAUNCH</html>')
  writeFileSync(path.join(dist, '.site-env.json'), JSON.stringify({
    environment: indexable ? 'production' : 'preprod', defaultMode: indexable ? 'prelaunch' : 'full', indexable,
    appOrigin: 'https://app.verebona.fr',
  }))
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

async function start(dir: string, env: Record<string, string>): Promise<{ port: number; child: ChildProcess }> {
  const port = 41000 + Math.floor(Math.random() * 10000)
  const child = spawn(process.execPath, ['server.cjs'], {
    cwd: dir,
    env: { ...process.env, PORT: String(port), NODE_PATH: path.join(repo, 'node_modules'), ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  await new Promise<void>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('server.cjs n’a pas démarré')), 8000)
    child.stdout!.on('data', (d) => { if (String(d).includes('Listening')) { clearTimeout(t); resolve() } })
    child.on('exit', (code) => { clearTimeout(t); reject(new Error(`server.cjs arrêté (${code})`)) })
  })
  return { port, child }
}

describe('production avec CANONICAL_HOST', () => {
  let dir: string, srv: { port: number; child: ChildProcess }
  beforeAll(async () => {
    dir = makeDist(true)
    srv = await start(dir, { CANONICAL_HOST: 'www.verebona.fr', BASIC_AUTH_ENABLED: 'false' })
  })
  afterAll(() => { srv?.child.kill(); rmSync(dir, { recursive: true, force: true }) })

  it('http://verebona.fr → UNE 301 vers https://www.verebona.fr, chemin et query conservés', async () => {
    const r = await get(srv.port, '/aide?q=x', { host: 'verebona.fr' })
    expect(r.status).toBe(301)
    expect(r.headers.location).toBe('https://www.verebona.fr/aide?q=x')
  })

  it('production : ?mode= ignoré, toujours l’accueil du build', async () => {
    const r = await get(srv.port, '/?mode=full', { host: 'www.verebona.fr', 'x-forwarded-proto': 'https' })
    expect(r.body).toContain('ACCUEIL')
  })

  it('https://www.verebona.fr : servi sans redirection ni noindex', async () => {
    const r = await get(srv.port, '/', { host: 'www.verebona.fr', 'x-forwarded-proto': 'https' })
    expect(r.status).toBe(200)
    expect(r.body).toContain('ACCUEIL')
    expect(r.headers['x-robots-tag']).toBeUndefined()
  })

  const https = { host: 'www.verebona.fr', 'x-forwarded-proto': 'https' }

  it('sitemap.xml en application/xml; charset=utf-8 (CDC Sitemap §7)', async () => {
    const r = await get(srv.port, '/sitemap.xml', https)
    expect(r.status).toBe(200)
    expect(r.headers['content-type']).toBe('application/xml; charset=utf-8')
  })

  it('ancienne URL d’aide : une seule 301 vers la cible (REDIR-01)', async () => {
    const r = await get(srv.port, '/aide/ancien-parrainage?x=1', https)
    expect(r.status).toBe(301)
    expect(r.headers.location).toBe('/aide/parrainage?x=1')
  })

  it('article inconnu : 404 avec la coquille SPA (REDIR-02)', async () => {
    const r = await get(srv.port, '/aide/nexiste-pas', https)
    expect(r.status).toBe(404)
    expect(r.body).toContain('SPA')
  })

  it('autre route : coquille SPA ; chemin de fichier absent : 404 texte', async () => {
    expect((await get(srv.port, '/contact', https)).body).toContain('SPA')
    expect((await get(srv.port, '/absent.js', https)).status).toBe(404)
  })

  it("seule l'application peut encadrer le site (mode intégré)", async () => {
    const r = await get(srv.port, '/aide', https)
    expect(r.headers['content-security-policy']).toBe("frame-ancestors 'self' https://app.verebona.fr")
  })
})

describe('préproduction', () => {
  let dir: string, srv: { port: number; child: ChildProcess }
  beforeAll(async () => {
    dir = makeDist(false)
    srv = await start(dir, { CANONICAL_HOST: '', BASIC_AUTH_ENABLED: 'false' })
  })
  afterAll(() => { srv?.child.kill(); rmSync(dir, { recursive: true, force: true }) })

  it('X-Robots-Tag noindex, nofollow sur toutes les réponses, sans redirection (§8.2)', async () => {
    const r = await get(srv.port, '/', { host: 'preprod.example' })
    expect(r.status).toBe(200)
    expect(r.headers['x-robots-tag']).toBe('noindex, nofollow')
  })

  it('/?mode=prelaunch : accueil pré-rendu en pré-lancement, sans liens actifs avant le montage (§5.3)', async () => {
    const r = await get(srv.port, '/?mode=prelaunch')
    expect(r.status).toBe(200)
    expect(r.body).toContain('ACCUEIL PRELAUNCH')
    // Mode par défaut du build ou valeur invalide : accueil habituel.
    expect((await get(srv.port, '/?mode=full')).body).toBe('<html>ACCUEIL</html>')
    expect((await get(srv.port, '/?mode=xyz')).body).toBe('<html>ACCUEIL</html>')
  })

  it('pas de sitemap : 404 franc, jamais un 200 HTML (CDC Sitemap §10)', async () => {
    const r = await get(srv.port, '/sitemap.xml')
    expect(r.status).toBe(404)
    expect(String(r.headers['content-type'])).not.toContain('html')
  })
})
