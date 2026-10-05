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
  writeFileSync(path.join(dist, 'aide', 'catalogue.json'), '{"articles":[]}')
  // PUB-PERF-01 : une sortie hachée de Vite et une image à nom fixe dans le même dossier.
  mkdirSync(path.join(dist, 'assets'))
  mkdirSync(path.join(dist, 'fonts'))
  writeFileSync(path.join(dist, 'assets', 'HelpHomeView-BIswMylZ.js'), 'export default 1')
  writeFileSync(path.join(dist, 'assets', 'surf-personal.webp'), 'IMG')
  writeFileSync(path.join(dist, 'fonts', 'space-mono-latin-400-5.3.0.woff2'), 'FONT')
  writeFileSync(path.join(dist, '.immutable-assets.json'), JSON.stringify(['/assets/HelpHomeView-BIswMylZ.js']))
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

  describe('cache HTTP (PUB-PERF-01)', () => {
    const YEAR = 'public, max-age=31536000, immutable'

    it('sortie hachée de Vite : un an, immutable', async () => {
      const r = await get(srv.port, '/assets/HelpHomeView-BIswMylZ.js', https)
      expect(r.status).toBe(200)
      expect(r.headers['cache-control']).toBe(YEAR)
      expect(r.headers.etag).toBeTruthy()
    })

    it('image à nom fixe du même dossier : cache court, jamais un an', async () => {
      const r = await get(srv.port, '/assets/surf-personal.webp', https)
      expect(r.status).toBe(200)
      expect(r.headers['cache-control']).toBe('public, max-age=3600')
    })

    it('polices versionnées : un an, immutable', async () => {
      const r = await get(srv.port, '/fonts/space-mono-latin-400-5.3.0.woff2', https)
      expect(r.headers['cache-control']).toBe(YEAR)
    })

    it('HTML (accueil, coquille SPA, page d’aide) : revalidé, 304 sur ETag inchangé', async () => {
      for (const p of ['/', '/contact', '/aide', '/aide/parrainage']) {
        const r = await get(srv.port, p, https)
        expect(r.status, p).toBe(200)
        expect(r.headers['cache-control'], p).toBe('public, no-cache')
        const etag = String(r.headers.etag)
        expect(etag, p).toBeTruthy()
        const again = await get(srv.port, p, { ...https, 'if-none-match': etag })
        expect(again.status, p).toBe(304)
        expect(again.body, p).toBe('')
      }
    })

    it('données d’aide : politique courte inchangée (suivent les publications)', async () => {
      const r = await get(srv.port, '/aide/catalogue.json', https)
      expect(r.status).toBe(200)
      expect(r.headers['cache-control']).toBe('public, max-age=300')
    })

    it('chunk d’une ancienne version : 404 texte non mis en cache, jamais la coquille (PUB-PERF-04)', async () => {
      const r = await get(srv.port, '/assets/HelpHomeView-OLDHASH1.js', https)
      expect(r.status).toBe(404)
      expect(String(r.headers['content-type'])).toContain('text/plain')
      expect(r.headers['cache-control']).toBe('no-store')
      const shell = await get(srv.port, '/aide/nexiste-pas', https)
      expect(shell.headers['cache-control']).toBe('no-store')
    })

    it('liste des fichiers versionnés jamais servie', async () => {
      expect((await get(srv.port, '/.immutable-assets.json', https)).status).toBe(404)
    })
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

describe('préproduction protégée (PUB-PERF-01, CA-03)', () => {
  let dir: string, srv: { port: number; child: ChildProcess }
  const auth = { authorization: `Basic ${Buffer.from('admin:secret').toString('base64')}` }
  beforeAll(async () => {
    dir = makeDist(false)
    srv = await start(dir, { CANONICAL_HOST: '', BASIC_AUTH_ENABLED: 'true', BASIC_AUTH_USER: 'admin', BASIC_AUTH_PASSWD: 'secret' })
  })
  afterAll(() => { srv?.child.kill(); rmSync(dir, { recursive: true, force: true }) })

  it('sans identifiants : 401', async () => {
    expect((await get(srv.port, '/assets/HelpHomeView-BIswMylZ.js')).status).toBe(401)
  })

  it('ressources protégées : jamais en cache partagé (`private`)', async () => {
    expect((await get(srv.port, '/', auth)).headers['cache-control']).toBe('private, no-cache')
    expect((await get(srv.port, '/contact', auth)).headers['cache-control']).toBe('private, no-cache')
    expect((await get(srv.port, '/assets/HelpHomeView-BIswMylZ.js', auth)).headers['cache-control'])
      .toBe('private, max-age=31536000, immutable')
    expect((await get(srv.port, '/assets/surf-personal.webp', auth)).headers['cache-control']).toBe('private, max-age=3600')
    expect((await get(srv.port, '/fonts/space-mono-latin-400-5.3.0.woff2', auth)).headers['cache-control'])
      .toBe('private, max-age=31536000, immutable')
  })

  it('données d’aide, publiques par conception : lisibles sans identifiants, cache court', async () => {
    const r = await get(srv.port, '/aide/catalogue.json')
    expect(r.status).toBe(200)
    expect(r.headers['cache-control']).toBe('public, max-age=300')
  })
})
