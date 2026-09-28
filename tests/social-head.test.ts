/**
 * CDC Données structurées §6 — balises Open Graph / Twitter par page, valeurs
 * centralisées ; CDC pré-lancement §5.3 — prévisualisation `?mode=` avant le
 * montage de Vue.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { OG_IMAGE_URL, socialMetaHtml, socialTags, stripSocialMeta } from '../src/config/social.rules'
import { SITE_NAME } from '../src/config/structured-data'
import { SITE_ORIGIN } from '../src/config/sitemap.rules'
import {
  MODE_PREVIEW_GUARD_CSS, MODE_PREVIEW_GUARD_SCRIPT, MODE_REQUEST_ATTR, PRERENDER_MODE_ATTR,
} from '../src/config/mode-preview-guard.rules'
import { readHelpSources } from '../help.build'
import { loadCorpus } from '../src/help/corpus'
import { helpArticleHead } from '../src/help/head'

const root = process.cwd()

describe('Open Graph / Twitter (CDC Données structurées §6)', () => {
  it('index.html ne code plus en dur canonical, og:* ni twitter:*', () => {
    const html = readFileSync(path.join(root, 'index.html'), 'utf8')
    expect(html).toContain('<!--vb:head-meta-->')
    expect(html).not.toMatch(/property="og:|name="twitter:|rel="canonical"/)
  })

  it('valeurs issues des constantes partagées ; og:title = titre de la page', () => {
    const tags = socialTags({ title: 'T', description: 'D', url: `${SITE_ORIGIN}/aide/x` })
    const get = (k: string) => tags.find((t) => t.key === k)?.content
    expect(get('og:site_name')).toBe(SITE_NAME)
    expect(get('og:title')).toBe('T')
    expect(get('twitter:title')).toBe('T')
    expect(get('og:description')).toBe('D')
    expect(get('og:url')).toBe(`${SITE_ORIGIN}/aide/x`)
    expect(get('og:image')).toBe(OG_IMAGE_URL)
    expect(OG_IMAGE_URL.startsWith(SITE_ORIGIN)).toBe(true)
  })

  it('page sans URL canonique : pas d’og:url', () => {
    expect(socialTags({ title: 'T', description: 'D', url: null }).some((t) => t.key === 'og:url')).toBe(false)
  })

  it('chaque page d’aide reçoit son titre, sa description et son URL (échappés)', () => {
    const { files, categories } = readHelpSources(root)
    const a = loadCorpus(files, categories).articles.find((x) => x.status === 'published')!
    const h = helpArticleHead(a, undefined)
    const html = socialMetaHtml({ title: h.title, description: h.description, url: h.canonical, type: 'article' })
    expect(html).toContain(`<meta property="og:url" content="${h.canonical}" data-social />`)
    expect(html).toContain('<meta property="og:type" content="article" data-social />')
    expect(html).toContain(`property="og:title" content="${h.title.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`)
    expect(socialMetaHtml({ title: 'A "B" <C>', description: 'd', url: null })).toContain('A &quot;B&quot; &lt;C&gt;')
  })

  it('stripSocialMeta retire les balises générées, et elles seules', () => {
    const doc = `<head>\n    <meta name="description" content="x" />\n    ${socialMetaHtml({ title: 'T', description: 'D', url: null })}\n</head>`
    const out = stripSocialMeta(doc)
    expect(out).not.toContain('data-social')
    expect(out).toContain('name="description"')
  })

  it('le pré-rendu remplace les balises de l’accueil sur la coquille et chaque page d’aide', () => {
    const src = readFileSync(path.join(root, 'scripts/prerender.mjs'), 'utf8')
    expect(src).toContain('ssr.stripSocialMeta(doc)')
    expect(src).toMatch(/withSocial\(shellBase, \{\s*title: h\.title,\s*description: h\.description,\s*url: h\.canonical/)
  })
})

describe('Prévisualisation ?mode= avant montage (CDC pré-lancement §5.3)', () => {
  it('le HTML d’un autre mode est masqué ; celui du mode demandé reste visible', () => {
    expect(MODE_PREVIEW_GUARD_CSS).toContain(`html[${MODE_REQUEST_ATTR}="prelaunch"] #app[${PRERENDER_MODE_ATTR}]:not([${PRERENDER_MODE_ATTR}="prelaunch"])`)
    expect(MODE_PREVIEW_GUARD_CSS).toContain('visibility:hidden')
  })

  it('le script ne retient que full ou prelaunch', () => {
    const run = (search: string) => {
      const attrs: Record<string, string> = {}
      const location = { search }
      const document = { documentElement: { setAttribute: (k: string, v: string) => { attrs[k] = v } } }
      new Function('location', 'document', 'URLSearchParams', MODE_PREVIEW_GUARD_SCRIPT)(location, document, URLSearchParams)
      return attrs[MODE_REQUEST_ATTR]
    }
    expect(run('?mode=prelaunch')).toBe('prelaunch')
    expect(run('?mode=full')).toBe('full')
    expect(run('?mode=autre')).toBeUndefined()
    expect(run('')).toBeUndefined()
  })

  it('injecté hors production seulement ; libéré au montage ; variante d’accueil pré-rendue', () => {
    const vite = readFileSync(path.join(root, 'vite.config.ts'), 'utf8')
    expect(vite).toMatch(/if \(allowsModeOverride\(environment\)\) \{\s*tags\.push\(/)
    expect(readFileSync(path.join(root, 'src/main.ts'), 'utf8')).toContain('releaseModePreviewGuard()')
    const pre = readFileSync(path.join(root, 'scripts/prerender.mjs'), 'utf8')
    expect(pre).toContain('ssr.renderInMode(\'/\', other)')
    expect(pre).toContain('lien d\\\'inscription ou de connexion actif dans l\\\'accueil pré-lancement')
  })
})
