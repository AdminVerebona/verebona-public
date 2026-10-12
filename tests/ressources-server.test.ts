// @vitest-environment node
/**
 * Ressources — serveur de production (CDC Ressources V6 §8, §15, NAV-03,
 * SEO-01, SEO-05, ADM-07, NFR-05 ; T02, T03, T09, T10).
 *
 * Même méthode que `server.test.ts` : `server.cjs` copié avec un `dist/`
 * minimal, puis lancé réellement.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { spawn, type ChildProcess } from 'node:child_process'
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { request } from 'node:http'

const repo = process.cwd()

function makeDist(): string {
  const dir = mkdtempSync(path.join(tmpdir(), 'verebona-ressources-'))
  copyFileSync(path.join(repo, 'server.cjs'), path.join(dir, 'server.cjs'))
  const dist = path.join(dir, 'dist')
  mkdirSync(path.join(dist, 'ressources'), { recursive: true })
  writeFileSync(path.join(dist, 'index.html'), '<html>ACCUEIL</html>')
  writeFileSync(path.join(dist, 'spa.html'), '<html>SPA</html>')
  writeFileSync(path.join(dist, 'ressources', 'index.html'), '<html><h1>Ressources</h1></html>')
  writeFileSync(path.join(dist, 'ressources', 'retrouver-facture-ticket-perdu.html'), '<html><h1>Facture perdue</h1></html>')
  writeFileSync(path.join(dist, 'ressources', '.routes.json'), JSON.stringify({
    redirects: { '/ressources/ancien-slug': '/ressources/retrouver-facture-ticket-perdu' },
    gone: ['/ressources/page-retiree'],
  }))
  writeFileSync(path.join(dist, '.site-env.json'), JSON.stringify({ environment: 'production', defaultMode: 'prelaunch', indexable: true, appOrigin: 'https://app.verebona.fr' }))
  return dir
}

interface Res { status: number; headers: Record<string, string | string[] | undefined>; body: string }
const get = (port: number, p: string): Promise<Res> => new Promise((resolve, reject) => {
  const req = request({ host: '127.0.0.1', port, path: p }, (res) => {
    let body = ''
    res.on('data', (c) => { body += c })
    res.on('end', () => resolve({ status: res.statusCode ?? 0, headers: res.headers, body }))
  })
  req.on('error', reject)
  req.end()
})

let dir: string
let child: ChildProcess
let port: number

beforeAll(async () => {
  dir = makeDist()
  port = 41000 + Math.floor(Math.random() * 10000)
  child = spawn(process.execPath, ['server.cjs'], {
    cwd: dir,
    env: { ...process.env, PORT: String(port), NODE_PATH: path.join(repo, 'node_modules'), BASIC_AUTH_ENABLED: 'false', CANONICAL_HOST: '' },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  await new Promise<void>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('server.cjs n’a pas démarré')), 8000)
    child.stdout!.on('data', (d) => { if (String(d).includes('Listening')) { clearTimeout(t); resolve() } })
    child.on('exit', (code) => { clearTimeout(t); reject(new Error(`server.cjs arrêté (${code})`)) })
  })
})
afterAll(() => { child?.kill(); rmSync(dir, { recursive: true, force: true }) })

describe('Ressources — réponses HTTP', () => {
  it('T01 / T02 — index et article : 200, HTML pré-rendu, revalidé (NFR-06)', async () => {
    for (const p of ['/ressources', '/ressources/retrouver-facture-ticket-perdu', '/ressources/retrouver-facture-ticket-perdu?utm_source=x']) {
      const r = await get(port, p)
      expect(r.status, p).toBe(200)
      expect(r.body, p).toContain('<h1>')
      expect(r.headers['cache-control'], p).toBe('public, no-cache')
    }
  })

  it('NAV-03 — slash final et majuscules : UNE 301 vers l’URL canonique', async () => {
    const a = await get(port, '/ressources/retrouver-facture-ticket-perdu/')
    expect(a.status).toBe(301)
    expect(a.headers.location).toBe('/ressources/retrouver-facture-ticket-perdu')
    const b = await get(port, '/Ressources/Retrouver-Facture-Ticket-Perdu?x=1')
    expect(b.status).toBe(301)
    expect(b.headers.location).toBe('/ressources/retrouver-facture-ticket-perdu?x=1')
  })

  it('T09 — ancien slug : 301 directe vers la page canonique', async () => {
    const r = await get(port, '/ressources/ancien-slug/')
    expect(r.status).toBe(301)
    expect(r.headers.location).toBe('/ressources/retrouver-facture-ticket-perdu')
  })

  it('T10 — article archivé sans remplacement : 410, jamais mis en cache', async () => {
    const r = await get(port, '/ressources/page-retiree')
    expect(r.status).toBe(410)
    expect(r.headers['cache-control']).toBe('no-store')
  })

  it('T03 — slug inexistant : 404 réel (coquille avec retour à l’index), jamais l’accueil', async () => {
    for (const p of ['/ressources/inexistant', '/ressources/index', '/ressources/retrouver-facture-ticket-perdu.html', '/ressources/../aide']) {
      const r = await get(port, p)
      expect(r.status, p).toBe(404)
      expect(r.body, p).not.toContain('ACCUEIL')
    }
  })

  it('la table des routes (dotfile) n’est pas servie', async () => {
    expect((await get(port, '/ressources/.routes.json')).status).toBe(404)
  })
})
