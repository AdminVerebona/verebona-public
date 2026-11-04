// @vitest-environment node
/**
 * Chantier 104P — `server.cjs` RÉELLEMENT démarré sur un `dist/` produit par
 * la vraie publication (`publishLegalToDist`, sources factices) :
 * 200 pour chaque contenu, 301 des anciennes adresses, octets servis =
 * empreinte du manifeste, 404 explicite d'une version inconnue, en-têtes
 * (type, cache), accès sans authentification pour l'application.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { spawn, type ChildProcess } from 'node:child_process'
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { request } from 'node:http'
import { sha256Hex } from '../scripts/lib/legal-core.mjs'
import { publishLegalToDist } from '../scripts/lib/legal-publish.mjs'
import { computeLinkInventory } from '../link-inventory.build'
import { fakeAppArchive, fillVersion, makeLegalRoot, repo, runScript } from './helpers/legal-fixture'

const inv = computeLinkInventory(repo)
const DOCS = ['mentions-legales', 'cguv', 'confidentialite', 'sous-traitants', 'parrainage']

function makeSite(opts: { indexable: boolean; siteOrigin: string }) {
  const root = makeLegalRoot()
  // Archive de l'application (octets CRLF) + une seconde version du site.
  const archive = path.join(mkdtempSync(path.join(tmpdir(), 'verebona-arch-')), 'a.html')
  writeFileSync(archive, fakeAppArchive('2026-07-30-v1'))
  const imp = runScript(root, 'import-cguv-archive.mjs', [archive, '--code', '2026-07-30-v1', '--sha256', sha256Hex(readFileSync(archive))])
  if (imp.code !== 0) throw new Error(imp.out)
  runScript(root, 'legal-nouvelle-cguv.mjs', ['2026-11-15-v1'])
  fillVersion(root, '2026-11-15-v1', { requiresReacceptance: true, changeSummary: 'Résumé factice.' })
  runScript(root, 'legal-figer-cguv.mjs', ['2026-11-15-v1'])

  const dir = mkdtempSync(path.join(tmpdir(), 'verebona-l104p-'))
  copyFileSync(path.join(repo, 'server.cjs'), path.join(dir, 'server.cjs'))
  const dist = path.join(dir, 'dist')
  mkdirSync(dist, { recursive: true })
  writeFileSync(path.join(dist, 'index.html'), '<html>ACCUEIL</html>')
  writeFileSync(path.join(dist, 'spa.html'), '<html>SPA</html>')
  writeFileSync(path.join(dist, '.site-env.json'), JSON.stringify({
    environment: opts.indexable ? 'production' : 'preprod', defaultMode: 'full', indexable: opts.indexable,
    appOrigin: 'https://app.verebona.fr', siteOrigin: opts.siteOrigin,
  }))
  writeFileSync(path.join(dist, '.site-routes.json'), JSON.stringify({
    staticRoutes: inv.routes.static, legacyRedirects: inv.legacyRedirects, retired: inv.retired, homeAnchors: inv.homeAnchors,
  }))
  const pages = [...DOCS, 'cguv/version-inconnue', 'cguv/versions/2026-07-30-v1', 'cguv/versions/2026-10-30-v1', 'cguv/versions/2026-11-15-v1']
  for (const p of pages) {
    const f = path.join(dist, 'legal/.pages', `${p}.html`)
    mkdirSync(path.dirname(f), { recursive: true })
    writeFileSync(f, `<html><h1>PAGE ${p}</h1></html>`)
  }
  const published = publishLegalToDist({ root, dist, siteOrigin: opts.siteOrigin })
  return { dir, root, manifest: published.manifest as { current: string; versions: Array<{ code: string; sha256: string; textUrl: string; permalink: string }> } }
}

interface Res { status: number; headers: Record<string, string | string[] | undefined>; body: Buffer }
function get(port: number, p: string, headers: Record<string, string> = {}, method = 'GET'): Promise<Res> {
  return new Promise((resolve, reject) => {
    const req = request({ host: '127.0.0.1', port, path: p, headers, method }, (res) => {
      const chunks: Buffer[] = []
      res.on('data', (c: Buffer) => chunks.push(c))
      res.on('end', () => resolve({ status: res.statusCode ?? 0, headers: res.headers, body: Buffer.concat(chunks) }))
    })
    req.on('error', reject)
    req.end()
  })
}
async function start(dir: string, env: Record<string, string>): Promise<{ port: number; child: ChildProcess }> {
  const port = 41000 + Math.floor(Math.random() * 10000)
  const child = spawn(process.execPath, ['server.cjs'], {
    cwd: dir,
    env: { ...process.env, PORT: String(port), NODE_PATH: path.join(repo, 'node_modules'), BASIC_AUTH_ENABLED: 'false', CANONICAL_HOST: '', ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  await new Promise<void>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('server.cjs n’a pas démarré')), 8000)
    child.stdout!.on('data', (d) => { if (String(d).includes('Listening')) { clearTimeout(t); resolve() } })
    child.on('exit', (code) => { clearTimeout(t); reject(new Error(`server.cjs arrêté (${code})`)) })
  })
  return { port, child }
}

describe('L104P-HTTP — préproduction', () => {
  let site: ReturnType<typeof makeSite>, srv: Awaited<ReturnType<typeof start>>
  beforeAll(async () => {
    site = makeSite({ indexable: false, siteOrigin: 'https://preprod.verebona.fr' })
    srv = await start(site.dir, {})
  }, 30_000)
  afterAll(() => { srv?.child.kill(); rmSync(site.dir, { recursive: true, force: true }); rmSync(site.root, { recursive: true, force: true }) })

  it('L104P-HTTP-01 — chaque contenu : 200, sa page pré-rendue, HTML revalidé', async () => {
    for (const d of DOCS) {
      const r = await get(srv.port, `/legal/${d}`)
      expect({ d, status: r.status }).toEqual({ d, status: 200 })
      expect(r.body.toString()).toContain(`PAGE ${d}`)
      expect(String(r.headers['content-type'])).toMatch(/^text\/html/)
      expect(r.headers['cache-control']).toBe('public, no-cache')
    }
  })

  it('L104P-HTTP-02 — anciennes adresses : UNE 301 vers l’URL stable, query conservée ; destination servie en 200', async () => {
    const cases: Record<string, string> = {
      '/mentions-legales': '/legal/mentions-legales', '/cgu': '/legal/cguv', '/confidentialite': '/legal/confidentialite', '/legal': '/legal/mentions-legales',
      // 108P-L : anciens noms techniques des CGUV.
      '/cgvu': '/legal/cguv', '/cguv': '/legal/cguv',
    }
    for (const [from, to] of Object.entries(cases)) {
      const r = await get(srv.port, `${from}?utm_source=x`)
      expect({ from, status: r.status, location: r.headers.location }).toEqual({ from, status: 301, location: `${to}?utm_source=x` })
      expect((await get(srv.port, to)).status).toBe(200)
    }
    expect((await get(srv.port, '/CGU/')).headers.location).toBe('/legal/cguv')
    expect((await get(srv.port, '/legal/cguv/')).headers.location).toBe('/legal/cguv')
    expect((await get(srv.port, '/Legal/CGUV')).headers.location).toBe('/legal/cguv')
  })

  it('L104P-HTTP-03 — manifeste : 200, application/json; charset=utf-8, cache 5 min, conforme et relu depuis dist', async () => {
    const r = await get(srv.port, '/legal/cguv/versions.json')
    expect(r.status).toBe(200)
    expect(r.headers['content-type']).toBe('application/json; charset=utf-8')
    expect(r.headers['cache-control']).toBe('public, max-age=300')
    const m = JSON.parse(r.body.toString('utf8'))
    expect(m.current).toBe('2026-11-15-v1')
    expect(m.versions.map((v: { code: string }) => v.code)).toEqual(['2026-11-15-v1', '2026-10-30-v1', '2026-07-30-v1'])
    expect(m.versions[0].permalink).toBe('https://preprod.verebona.fr/legal/cguv/versions/2026-11-15-v1')
  })

  it('L104P-HTTP-04 — texte figé SERVI : sha256 des octets reçus = manifeste = fichier source ; type, cache, ETag, 304', async () => {
    const m = JSON.parse((await get(srv.port, '/legal/cguv/versions.json')).body.toString('utf8'))
    for (const v of m.versions as Array<{ code: string; sha256: string; textUrl: string }>) {
      const p = new URL(v.textUrl).pathname
      const r = await get(srv.port, p)
      expect({ code: v.code, status: r.status }).toEqual({ code: v.code, status: 200 })
      expect({ code: v.code, sha: sha256Hex(r.body) }).toEqual({ code: v.code, sha: v.sha256 })
      const src = readFileSync(path.join(site.root, 'src/content/legal/cguv/versions', `${v.code}.html`))
      expect(r.body.equals(src)).toBe(true)
      expect(r.headers['content-type']).toBe('text/html; charset=utf-8')
      expect(r.headers['cache-control']).toBe('public, max-age=31536000, immutable')
      expect(r.headers['content-encoding']).toBeUndefined()
      expect(Number(r.headers['content-length'])).toBe(src.length)
      expect(r.headers.etag).toBe(`"sha256-${v.sha256}"`)
      expect((await get(srv.port, p, { 'if-none-match': `"sha256-${v.sha256}"` })).status).toBe(304)
      const head = await get(srv.port, p, {}, 'HEAD')
      expect(head.status).toBe(200)
      expect(head.body.length).toBe(0)
    }
    // L'archive de l'application garde ses CRLF et son script : rien n'est réécrit.
    const archive = await get(srv.port, '/legal/cguv/versions/2026-07-30-v1.html')
    expect(archive.body.includes(Buffer.from('\r\n'))).toBe(true)
    expect(archive.body.toString()).toContain('onclick="window.print()"')
  })

  it('L104P-HTTP-05 — permalien : 200 pour chaque version publiée ; code inconnu → 404 explicite, jamais la version courante', async () => {
    for (const code of ['2026-07-30-v1', '2026-10-30-v1', '2026-11-15-v1']) {
      const r = await get(srv.port, `/legal/cguv/versions/${code}`)
      expect({ code, status: r.status }).toEqual({ code, status: 200 })
      expect(r.body.toString()).toContain(`PAGE cguv/versions/${code}`)
    }
    for (const p of ['/legal/cguv/versions/2026-12-01-v1', '/legal/cguv/versions/nimporte-quoi', '/legal/cguv/versions/2026-02-31-v1']) {
      const r = await get(srv.port, p)
      expect({ p, status: r.status }).toEqual({ p, status: 404 })
      expect(r.headers.location).toBeUndefined()
      expect(r.body.toString()).toContain('PAGE cguv/version-inconnue')
      expect(r.body.toString()).not.toContain('PAGE cguv/versions/2026-11-15-v1')
      expect(r.headers['cache-control']).toBe('no-store')
    }
    const file = await get(srv.port, '/legal/cguv/versions/2026-12-01-v1.html')
    expect(file.status).toBe(404)
    expect(String(file.headers['content-type'])).toMatch(/^text\/plain/)
  })

  it('L104P-HTTP-06 — pages internes jamais exposées ; adresse inconnue sous /legal : 404', async () => {
    for (const p of ['/legal/.pages/cguv.html', '/legal/.pages/cguv', '/legal/inconnu', '/legal/cguv/versions', '/legal/cguv/autre/x']) {
      expect({ p, status: (await get(srv.port, p)).status }).toEqual({ p, status: 404 })
    }
  })

  const appRepo = process.env.VEREBONA_APP_REPO
  it.skipIf(!appRepo)('L104P-HTTP-07 — le vérificateur de l’APPLICATION (verifyTextSha256) confirme chaque texte servi', async () => {
    const { verifyTextSha256 } = await import('@/services/legal/cguv-manifest')
    const m = JSON.parse((await get(srv.port, '/legal/cguv/versions.json')).body.toString('utf8'))
    const local = async (url: string) => {
      const r = await get(srv.port, new URL(url).pathname)
      return new Response(new Uint8Array(r.body), { status: r.status })
    }
    for (const v of m.versions as Array<{ sha256: string; textUrl: string }>) {
      expect(await verifyTextSha256(v.textUrl, v.sha256, { fetchImpl: local })).toBe(true)
      expect(await verifyTextSha256(v.textUrl, 'f'.repeat(64), { fetchImpl: local })).toBe(false)
    }
  })
})

describe('L104P-HTTP — préproduction protégée (Basic Auth)', () => {
  let site: ReturnType<typeof makeSite>, srv: Awaited<ReturnType<typeof start>>
  beforeAll(async () => {
    site = makeSite({ indexable: false, siteOrigin: 'https://preprod.verebona.fr' })
    srv = await start(site.dir, { BASIC_AUTH_ENABLED: 'true', BASIC_AUTH_USER: 'u', BASIC_AUTH_PASSWD: 'p' })
  }, 30_000)
  afterAll(() => { srv?.child.kill(); rmSync(site.dir, { recursive: true, force: true }); rmSync(site.root, { recursive: true, force: true }) })

  it('L104P-HTTP-08 — manifeste et textes figés lisibles sans identifiants (lecture serveur à serveur) ; pages protégées', async () => {
    expect((await get(srv.port, '/legal/cguv/versions.json')).status).toBe(200)
    expect((await get(srv.port, '/legal/cguv/versions/2026-10-30-v1.html')).status).toBe(200)
    expect((await get(srv.port, '/legal/cguv')).status).toBe(401)
  })
})

describe('L104P-HTTP — production avec CANONICAL_HOST', () => {
  let site: ReturnType<typeof makeSite>, srv: Awaited<ReturnType<typeof start>>
  beforeAll(async () => {
    site = makeSite({ indexable: true, siteOrigin: 'https://www.verebona.fr' })
    srv = await start(site.dir, { CANONICAL_HOST: 'www.verebona.fr' })
  }, 30_000)
  afterAll(() => { srv?.child.kill(); rmSync(site.dir, { recursive: true, force: true }); rmSync(site.root, { recursive: true, force: true }) })

  it('L104P-HTTP-09 — http://verebona.fr/cgu : UNE 301 directement vers https://www.verebona.fr/legal/cguv', async () => {
    const r = await get(srv.port, '/cgu?a=1', { host: 'verebona.fr' })
    expect(r.status).toBe(301)
    expect(r.headers.location).toBe('https://www.verebona.fr/legal/cguv?a=1')
  })

  it('L104P-HTTP-10 — même empreinte qu’en préproduction pour une même version (seules les URL changent)', async () => {
    const https = { host: 'www.verebona.fr', 'x-forwarded-proto': 'https' }
    const m = JSON.parse((await get(srv.port, '/legal/cguv/versions.json', https)).body.toString('utf8'))
    const pre = makeSite({ indexable: false, siteOrigin: 'https://preprod.verebona.fr' })
    const shaOf = (x: { versions: Array<{ code: string; sha256: string }> }) => Object.fromEntries(x.versions.map((v) => [v.code, v.sha256]))
    // Mêmes sources → mêmes octets figés : aucune empreinte ne dépend de l'environnement.
    expect(shaOf(m)['2026-10-30-v1']).toBe(shaOf(pre.manifest)['2026-10-30-v1'])
    expect(shaOf(m)['2026-07-30-v1']).toBe(shaOf(pre.manifest)['2026-07-30-v1'])
    expect(m.versions[0].permalink.startsWith('https://www.verebona.fr/')).toBe(true)
    rmSync(pre.dir, { recursive: true, force: true }); rmSync(pre.root, { recursive: true, force: true })
  }, 30_000)
})
