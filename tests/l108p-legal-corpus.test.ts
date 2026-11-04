/**
 * Chantier 108P-L — PREUVE DE FIDÉLITÉ des cinq contenus publiés au corpus
 * juridique fourni par le PO (`src/content/legal/import/sources/
 * corpus-juridique-2026-10-30.md`, copie octet pour octet du fichier reçu).
 *
 * Le texte source est extrait ICI, indépendamment de l'outil d'import (simple
 * retrait des marques Markdown), puis comparé MOT POUR MOT au texte affiché
 * par la vraie vue `LegalView.vue` sur chacune des cinq URL. Seuls éléments
 * non repris (décision PO du 03/11/2026) : le titre et le préambule
 * éditoriaux du fichier, les titres « CONTENU À INTÉGRER — ONGLET … » (avec
 * leurs mentions « PARTIE 1/2 / 2/2 ») et les filets de séparation entre blocs.
 */
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { createMemoryHistory, createRouter, type Router } from 'vue-router'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { cpSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { buildCguvManifest, checkManifestContract, loadLegalSources, publishedVersions, sha256Hex } from '../scripts/lib/legal-core.mjs'

const repo = process.cwd()
const SOURCE = 'src/content/legal/import/sources/corpus-juridique-2026-10-30.md'
const CGUV_CODE = '2026-10-30-v1'
const CGUV_FILE = `src/content/legal/cguv/versions/${CGUV_CODE}.html`

vi.mock('virtual:legal', async () => {
  const core = await import('../scripts/lib/legal-core.mjs')
  // Contenus RÉELS du dépôt : la version 2026-10-30-v1 est figée avec les décisions du PO (04/11/2026).
  return core.legalViewData(core.loadLegalSources(process.cwd()))
})

/* ── Extraction indépendante du corpus ── */
const TABS: Record<string, string> = {
  'MENTIONS LÉGALES': 'mentions-legales', CGUV: 'cguv', 'CONFIDENTIALITÉ': 'confidentialite',
  'SOUS-TRAITANTS ET PRESTATAIRES': 'sous-traitants', PARRAINAGE: 'parrainage',
}
function sourceBlocks(): Record<string, string[]> {
  const lines = readFileSync(path.join(repo, SOURCE), 'utf8').split('\n')
  const out: Record<string, string[]> = {}
  let cur: string[] | null = null
  let parts: string[][] = []
  const close = () => {
    if (!cur) return
    while (cur.length && (!cur[0].trim() || /^---\s*$/.test(cur[0]))) cur.shift()
    while (cur.length && (!cur[cur.length - 1].trim() || /^---\s*$/.test(cur[cur.length - 1]))) cur.pop()
    parts.push(cur)
  }
  let key: string | null = null
  for (const l of lines) {
    const m = /^## CONTENU À INTÉGRER — ONGLET « (.+?) »(?: — PARTIE \d\/2)?\s*$/.exec(l)
    if (m) {
      close()
      const k = TABS[m[1]]
      if (k !== key) { if (key) out[key] = (out[key] ?? []).concat(...parts); parts = []; key = k }
      cur = []
      continue
    }
    if (cur) cur.push(l)
  }
  close()
  if (key) out[key] = (out[key] ?? []).concat(...parts)
  return out
}
const strip = (l: string) => (/^---\s*$/.test(l) ? '' : l.replace(/^#{1,6}\s+/, '').replace(/^- /, '').replace(/\*\*/g, ''))
const words = (s: string) => s.normalize('NFC').split(/\s+/u).filter(Boolean)
// Balises de bloc = séparation de mots ; balises en ligne (<strong>, <em>, <a>…) = rien (« **mot**. » reste « mot. »).
const pageWords = (html: string) => words(html.replace(/<\/?(?:p|h[1-6]|li|ul|ol|br|hr|table|thead|tbody|tr|td|th|div|section|blockquote|dl|dt|dd)\b[^>]*>/gi, ' ').replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&'))

let router: Router
let wrapper: VueWrapper
beforeAll(async () => {
  vi.stubGlobal('scrollTo', vi.fn())
  const { default: LegalView } = await import('../src/views/LegalView.vue')
  const routes: Array<[string, string, string]> = [
    ['legal-mentions', '/legal/mentions-legales', 'mentions-legales'], ['legal-cguv', '/legal/cguv', 'cguv'],
    ['legal-confid', '/legal/confidentialite', 'confidentialite'], ['legal-sous-traitants', '/legal/sous-traitants', 'sous-traitants'],
    ['legal-parrainage', '/legal/parrainage', 'parrainage'], ['legal-cguv-version', '/legal/cguv/versions/:code', 'cguv'],
  ]
  router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: { render: () => null } }, { path: '/contact', component: { render: () => null } },
      ...routes.map(([name, p, tab]) => ({ name, path: p, component: LegalView, meta: { legalTab: tab } }))],
  })
  await router.push('/legal/mentions-legales')
  await router.isReady()
  const { defineComponent, h } = await import('vue')
  const { RouterView } = await import('vue-router')
  wrapper = mount(defineComponent({ render: () => h(RouterView) }), { global: { plugins: [router] }, attachTo: document.body })
  await flushPromises()
}, 60_000)

describe('L108P-CORPUS — fidélité au corpus du PO', () => {
  it('L108P-CORPUS-01 — la source du dépôt est le fichier reçu (empreinte relevée au rapport d’import)', () => {
    const sha = createHash('sha256').update(readFileSync(path.join(repo, SOURCE))).digest('hex')
    const report = JSON.parse(readFileSync(path.join(repo, 'src/content/legal/import/dernier-import.json'), 'utf8'))
    expect(report.source).toMatchObject({ fichier: 'corpus-juridique-2026-10-30.md', format: 'markdown', sha256: sha })
    expect(Object.keys(sourceBlocks()).sort()).toEqual(['cguv', 'confidentialite', 'mentions-legales', 'parrainage', 'sous-traitants'])
  })

  const pages: Array<[string, string]> = [
    ['mentions-legales', '/legal/mentions-legales'], ['cguv', '/legal/cguv'], ['confidentialite', '/legal/confidentialite'],
    ['sous-traitants', '/legal/sous-traitants'], ['parrainage', '/legal/parrainage'], ['cguv', `/legal/cguv/versions/${CGUV_CODE}`],
  ]
  for (const [key, url] of pages) {
    it(`L108P-CORPUS-02 — ${url} : texte affiché == bloc(s) source « ${key} », mot pour mot`, async () => {
      await router.push(url)
      await flushPromises()
      const doc = wrapper.find('.legal__doc')
      expect(doc.exists(), url).toBe(true)
      const expected = words(sourceBlocks()[key].map(strip).join(' '))
      const shown = pageWords(doc.element.innerHTML)
      expect(shown.length).toBe(expected.length)
      const at = shown.findIndex((w, i) => w !== expected[i])
      expect({ url, at, autour: at === -1 ? '' : `${shown.slice(Math.max(0, at - 5), at + 5).join(' ')} / source : ${expected.slice(Math.max(0, at - 5), at + 5).join(' ')}` }).toEqual({ url, at: -1, autour: '' })
      expect(doc.text()).not.toMatch(/CONTENU À INTÉGRER|PARTIE [12]\/2|Corpus juridique de référence|Règle de livraison|Navigation attendue|ticket Trello/)
    })
  }

  it('L108P-CORPUS-03 — lignes de fin conservées ; parties 1/2 et 2/2 en un seul texte continu', async () => {
    await router.push('/legal/cguv')
    await flushPromises()
    const cguv = wrapper.find('.legal__doc').text()
    expect(cguv).toContain('Fin du texte CGUV — version 2026-10-30-v1')
    expect(cguv.indexOf('12. Fonctionnalités automatisées')).toBeLessThan(cguv.indexOf('13. Documents et contenus'))
    await router.push('/legal/confidentialite')
    await flushPromises()
    expect(wrapper.find('.legal__doc').text()).toContain('Fin de la politique de confidentialité — mise à jour du 30 octobre 2026')
  })

  it('L108P-CORPUS-04 — mise en forme : gras, sauts de ligne « deux espaces », listes, titres (aucun <h1>)', () => {
    const m = readFileSync(path.join(repo, 'src/content/legal/mentions-legales.html'), 'utf8')
    expect(m).toContain('<p><strong>Verebona SAS</strong><br>Société par actions simplifiée au capital de <strong>200 €</strong><br>')
    expect(m).toContain('<h2>1. Éditeur</h2>')
    const c = readFileSync(path.join(repo, 'src/content/legal/confidentialite.html'), 'utf8')
    expect(c).toContain('<h3>3.1 Compte et authentification</h3>')
    expect(c).toMatch(/<ul>\n<li>nom et prénom ;<\/li>/)
    for (const f of ['mentions-legales', 'confidentialite', 'sous-traitants', 'parrainage']) expect(readFileSync(path.join(repo, `src/content/legal/${f}.html`), 'utf8')).not.toMatch(/<h1|TEXTE-JURIDIQUE-A-FOURNIR/)
  })
})

describe('L108P-CORPUS — CGUV 2026-10-30-v1 : archive figée et manifeste', () => {
  it('L108P-CORPUS-10 — décisions du PO (04/11/2026) figées : publication 30/10, entrée en vigueur 05/11 0 h Paris, substantielle', () => {
    const s = loadLegalSources(repo)
    const v = s.versions.find((x) => x.code === CGUV_CODE)!
    expect(v.status).toBe('publiee')
    expect(v.meta).toMatchObject({ publishedAt: '2026-10-30T09:00:00Z', effectiveAt: '2026-11-04T23:00:00Z', requiresReacceptance: true })
    expect(String(v.meta.changeSummary)).toMatch(/remplace la version du 30 juillet 2026/)
    expect(publishedVersions(s).map((x) => x.code)).toContain(CGUV_CODE)
    // 2026-07-30-v1 : archive de l'application, jamais régénérée (aucun .html tant qu'elle n'est pas importée).
    expect(s.versions.find((x) => x.code === '2026-07-30-v1')?.status).toBe('archive-absente')
  })

  it('L108P-CORPUS-11 — une fois décidée et figée, le manifeste publie EXACTEMENT l’empreinte du fichier déposé (contrat)', () => {
    const fileSha = sha256Hex(readFileSync(path.join(repo, CGUV_FILE)))
    const root = mkdtempSync(path.join(tmpdir(), 'verebona-108p-'))
    cpSync(path.join(repo, 'src/content/legal'), path.join(root, 'src/content/legal'), { recursive: true })
    // Déjà figée dans le dépôt : relancer le gel est idempotent et ne change rien.
    execFileSync(process.execPath, [path.join(repo, 'scripts/legal-figer-cguv.mjs'), CGUV_CODE], { env: { ...process.env, LEGAL_ROOT: root } })
    const s = loadLegalSources(root)
    const published = publishedVersions(s)
    expect(published.map((v) => v.code)).toEqual([CGUV_CODE])
    const manifest = buildCguvManifest(published, 'https://preprod.verebona.fr', '2026-11-03T12:00:00Z')
    expect(checkManifestContract(manifest, 'https://preprod.verebona.fr')).toEqual([])
    expect(manifest.current).toBe(CGUV_CODE)
    expect(manifest.versions[0]).toMatchObject({ code: CGUV_CODE, sha256: fileSha, textUrl: `https://preprod.verebona.fr/legal/cguv/versions/${CGUV_CODE}.html` })
    // Figer ne touche pas aux octets du texte.
    expect(sha256Hex(readFileSync(path.join(root, CGUV_FILE)))).toBe(fileSha)
  })
})
