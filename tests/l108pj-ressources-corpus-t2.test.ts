// @vitest-environment node
/**
 * Chantier 108J — corpus interrogeable des Ressources (`/ressources/corpus-t2.json`).
 *
 * Généré au build depuis les MÊMES fichiers Markdown que les pages : aucune
 * copie manuelle. Seuls les articles publiés sont des sources ; un retrait
 * ou une modification change la version ; l'environnement est déclaré ; le
 * serveur le sert sans authentification, avec l'en-tête d'environnement.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { spawn, type ChildProcess } from 'node:child_process'
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { request } from 'node:http'
import { loadRessourceCorpus, readRessourceSources } from '../ressources.build'
import { loadRessources } from '../src/ressources/corpus'
import { RESSOURCES_T2_CORPUS_PATH, RESSOURCES_T2_SCHEMA, buildRessourcesT2Corpus, ressourceSections } from '../src/ressources/t2-corpus'

const root = process.cwd()
const corpus = loadRessourceCorpus(root)
const opts = { siteOrigin: 'https://www.verebona.fr', commit: null, generatedAt: '2026-11-03T00:00:00.000Z' }

describe('L108PJ-01 — contenu du corpus de l’assistant', () => {
  const t2 = buildRessourcesT2Corpus(corpus, 'preprod', opts)

  it('schéma, environnement, version ; un article par article PUBLIÉ, identifiants stables', () => {
    expect(t2.schema).toBe(RESSOURCES_T2_SCHEMA)
    expect(t2.environment).toBe('preprod')
    expect(t2.version).toMatch(/^contenu-[0-9a-f]{16}$/)
    const publies = corpus.articles.filter((a) => a.status === 'published')
    expect(t2.articles.map((a) => a.id)).toEqual(publies.map((a) => a.id))
    for (const a of t2.articles) {
      expect(a.status).toBe('published')
      expect(a.path).toMatch(/^\/ressources\/[a-z0-9-]+$/)
      expect(a.canonicalUrl).toBe(`https://www.verebona.fr${a.path}`)
      expect(a.title.length).toBeGreaterThan(10)
      expect(a.sections.length).toBeGreaterThan(3)
      expect(a.sections[0].anchor).toBe('presentation')
      for (const s of a.sections) expect(s.text.trim().length, `${a.id} ${s.anchor}`).toBeGreaterThan(0)
    }
  })

  it('le texte vient des fichiers Markdown (aucune copie) : la réponse immédiate d’A01 est celle de la page', () => {
    const src = readFileSync(path.join(root, 'src/content/ressources/articles/A01.md'), 'utf8')
    const intro = t2.articles.find((a) => a.id === 'A01')!.sections[0].text
    expect(src).toContain(intro.slice(0, 80))
    // Aucun HTML ni syntaxe Markdown de lien dans le texte citable.
    for (const a of t2.articles) for (const s of a.sections) expect(s.text, `${a.id}`).not.toMatch(/<[a-z]|\]\(/i)
  })

  it('un article retiré de la publication disparaît, et la version change ; une modification aussi', () => {
    const { files, categories } = readRessourceSources(root)
    const variante = (edit: (raw: string) => string) => {
      const r = loadRessources(files.map((f) => (f.path.endsWith('/L01.md') ? { ...f, raw: edit(f.raw) } : f)), categories)
      return buildRessourcesT2Corpus(r, 'preprod', opts)
    }
    const retire = variante((raw) => raw.replace(/^status: published$/m, 'status: review'))
    expect(retire.articles.some((a) => a.id === 'L01')).toBe(false)
    expect(retire.version).not.toBe(t2.version)
    const modifie = variante((raw) => raw.replace(/^revision: (\d+)$/m, (_m, n) => `revision: ${Number(n) + 1}`))
    expect(modifie.articles.find((a) => a.id === 'L01')!.revision).toBe(t2.articles.find((a) => a.id === 'L01')!.revision + 1)
    expect(modifie.version).not.toBe(t2.version)
  })

  it('sections : réponse immédiate, intertitres, liste de contrôle, questions fréquentes', () => {
    const a = corpus.articles.find((x) => x.id === 'L01')!
    const s = ressourceSections(a)
    expect(s.map((x) => x.anchor)).toEqual(['presentation', ...a.sections.map((x) => x.anchor), 'checklist', 'faq-1', 'faq-2'])
  })

  it('aucun lien Ressources → Centre d’aide n’est ajouté par le corpus', () => {
    expect(JSON.stringify(t2)).not.toMatch(/"\/aide\//)
  })
})

describe('L108PJ-02 — le serveur sert le corpus sans identifiants, environnement déclaré', () => {
  let dir: string
  let child: ChildProcess
  let port = 0
  beforeAll(async () => {
    dir = mkdtempSync(path.join(tmpdir(), 'verebona-108pj-'))
    copyFileSync(path.join(root, 'server.cjs'), path.join(dir, 'server.cjs'))
    const dist = path.join(dir, 'dist')
    mkdirSync(path.join(dist, 'ressources'), { recursive: true })
    mkdirSync(path.join(dist, 'aide'), { recursive: true })
    writeFileSync(path.join(dist, 'index.html'), '<html>ACCUEIL</html>')
    writeFileSync(path.join(dist, 'spa.html'), '<html>SPA</html>')
    writeFileSync(path.join(dist, 'ressources', '.routes.json'), JSON.stringify({ redirects: {}, gone: [] }))
    writeFileSync(path.join(dist, RESSOURCES_T2_CORPUS_PATH.slice(1)), JSON.stringify(buildRessourcesT2Corpus(corpus, 'preprod', opts)))
    writeFileSync(path.join(dist, '.site-env.json'), JSON.stringify({ environment: 'preprod', defaultMode: 'full', indexable: false, appOrigin: 'https://app.example.test' }))
    port = 41000 + Math.floor(Math.random() * 10000)
    child = spawn(process.execPath, ['server.cjs'], {
      cwd: dir,
      env: { ...process.env, PORT: String(port), NODE_PATH: path.join(root, 'node_modules'), BASIC_AUTH_ENABLED: 'true', BASIC_AUTH_USER: 'u', BASIC_AUTH_PASSWD: 'p' },
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    await new Promise<void>((resolve, reject) => {
      const t = setTimeout(() => reject(new Error('server.cjs n’a pas démarré')), 8000)
      child.stdout!.on('data', (d) => { if (String(d).includes('Listening')) { clearTimeout(t); resolve() } })
      child.on('exit', (code) => { clearTimeout(t); reject(new Error(`server.cjs arrêté (${code})`)) })
    })
  })
  afterAll(() => { child?.kill(); if (dir) rmSync(dir, { recursive: true, force: true }) })

  it('200 sans authentification basique, JSON du bon environnement, en-têtes CORS et environnement', async () => {
    const r = await new Promise<{ status: number; headers: Record<string, unknown>; body: string }>((resolve, reject) => {
      const req = request({ host: '127.0.0.1', port, path: RESSOURCES_T2_CORPUS_PATH }, (res) => {
        let body = ''
        res.on('data', (c) => { body += c })
        res.on('end', () => resolve({ status: res.statusCode ?? 0, headers: res.headers, body }))
      })
      req.on('error', reject)
      req.end()
    })
    expect(r.status).toBe(200)
    expect(JSON.parse(r.body).environment).toBe('preprod')
    expect(r.headers['x-verebona-environment']).toBe('preprod')
    expect(r.headers['cache-control']).toBe('public, max-age=300')
  })
})
