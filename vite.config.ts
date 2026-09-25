import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import {
  isIndexable,
  parseEnvironment,
  resolveDefaultMode,
} from './src/config/site-mode.rules'
import { INDEXABLE_PATHS, SITE_ORIGIN, buildRobotsTxt, buildSitemapXml } from './src/config/sitemap.rules'
import { deployedCommit, loadHelpCorpus, HELP_CONTENT_DIR } from './help.build'
import type { Corpus } from './src/help/corpus'
import {
  buildCatalog, buildRedirects, buildT2Corpus, contentVersion, helpSitemapPaths, publishedArticles,
  type HelpEnvironment,
} from './src/help/outputs'
import { CATALOG_PATH, REDIRECTS_FILE, T2_CORPUS_PATH } from './src/help/config'
import { structuredDataScript } from './src/config/structured-data'
import { HOME_DESCRIPTIONS, HOME_TITLE, escapeHtmlAttr } from './src/config/head.rules'

/**
 * Règles SEO et marqueur d'exploitation par environnement
 * (CDC pré-lancement §8 et §9). Les règles de mode sont celles de
 * `src/config/site-mode.rules.ts` : aucune logique dupliquée ici.
 *
 * - hors production : <meta name="robots" content="noindex, nofollow"> ;
 * - robots.txt adapté à l'environnement ;
 * - `.site-env.json` (non servi) lu par `server.cjs` pour l'en-tête X-Robots-Tag.
 */
function siteModePlugin(): Plugin {
  // Valeurs figées dans `configResolved`, à partir de `config.env` : exactement
  // les variables que verra le front (fichiers .env + process.env prioritaire).
  let environment = parseEnvironment(undefined)
  let defaultMode = resolveDefaultMode(environment, undefined)
  let indexable = isIndexable(environment)
  let appOrigin: string | null = null

  return {
    name: 'verebona-site-mode',
    configResolved(config) {
      const raw = config.env.VITE_ENVIRONMENT as string | undefined
      environment = parseEnvironment(raw)
      defaultMode = resolveDefaultMode(environment, config.env.VITE_DEFAULT_SITE_MODE)
      indexable = isIndexable(environment)
      try {
        appOrigin = new URL(String(config.env.VITE_APP_URL || 'https://app.verebona.fr')).origin
      } catch {
        appOrigin = null
      }
      const warn = raw ? '' : ' (VITE_ENVIRONMENT absent : traité comme production)'
      config.logger.info(
        `\n[verebona] environnement=${environment} · mode par défaut=${defaultMode} · ` +
          `${indexable ? 'indexable' : 'noindex'}${warn}\n`,
      )
    },
    transformIndexHtml(html) {
      // ══════════════════════════════════════════════════════════════════
      // HEAD DE L'ACCUEIL — ticket SEO accueil
      //
      // `index.html` devient le document de l'accueil (pré-rendu, voir
      // scripts/prerender.mjs) : un seul <title> et une seule meta
      // description, aux valeurs de `head.rules.ts`. La description suit le
      // mode par défaut du build (prelaunch → « Disponible bientôt »,
      // full → version ouverture) sans que ce plugin modifie ce mode.
      // ══════════════════════════════════════════════════════════════════
      const homeHtml = html
        .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtmlAttr(HOME_TITLE)}</title>`)
        .replace(
          /(<meta\s+name="description"\s+content=")[^"]*(")/,
          `$1${escapeHtmlAttr(HOME_DESCRIPTIONS[defaultMode])}$2`,
        )

      const tags = []

      // ══════════════════════════════════════════════════════════════════
      // JSON-LD Organization + WebSite — CDC Données structurées §6
      //
      // Injecté dans `index.html` au build, donc présent dans le HTML servi
      // par express : le §6 exige un balisage lisible « sans exécuter une
      // logique métier côté client ». Le site étant une SPA rendue par le
      // navigateur, c'est le seul point où le balisage existe avant que le
      // JavaScript ne s'exécute.
      //
      // Conséquence assumée : `index.html` servant toutes les routes, le
      // balisage accompagne aussi /aide et /contact. Ce ne sont pas des
      // doublons contradictoires — un seul graphe existe, et ses `@id` et
      // `url` désignent sans ambiguïté l'accueil (§2 : la duplication
      // n'est pas « nécessaire », elle n'est pas interdite).
      // ══════════════════════════════════════════════════════════════════
      const jsonLd = structuredDataScript(indexable)
      if (jsonLd) {
        tags.push({
          tag: 'script',
          attrs: { type: 'application/ld+json' },
          children: jsonLd,
          injectTo: 'head' as const,
        })
      }

      if (!indexable) {
        tags.push({
          tag: 'meta',
          attrs: { name: 'robots', content: 'noindex, nofollow' },
          injectTo: 'head-prepend' as const,
        })
      }

      return { html: homeHtml, tags }
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: buildRobotsTxt(indexable),
      })

      // ══════════════════════════════════════════════════════════════════
      // SITEMAP — CDC Sitemap §5, §6 et §10
      //
      // Émis comme un asset du build, donc servi par `express.static` avec
      // le bon type MIME. C'est ce qui corrige l'anomalie d'origine : sans
      // fichier à ce chemin, `/sitemap.xml` tombait dans le repli SPA de
      // `server.cjs` et répondait 200 `text/html` — d'où le « le sitemap
      // est un fichier HTML » de Search Console.
      //
      // Hors production, aucun sitemap n'est produit : le §10 interdit
      // qu'un environnement de préproduction expose un sitemap, et celui-ci
      // ne contiendrait de toute façon que des URLs de production.
      // ══════════════════════════════════════════════════════════════════
      if (indexable) {
        // SEO-02 (CDC Centre d'aide) : accueil, thèmes et articles publiés. La
        // liste reste explicite pour le reste du site (§8 du CDC Sitemap) ;
        // pour l'aide, elle est dérivée du corpus, seule source des articles.
        const help = helpSitemapPaths(loadHelpCorpus(process.cwd()), 'production')
        this.emitFile({
          type: 'asset',
          fileName: 'sitemap.xml',
          source: buildSitemapXml([...INDEXABLE_PATHS, ...help]),
        })
      }

      this.emitFile({
        type: 'asset',
        fileName: '.site-env.json',
        // `appOrigin` : seule origine autorisée à encadrer le site (mode intégré
        // du Centre d'aide) et à lire ses fichiers d'aide depuis le navigateur.
        source: JSON.stringify({ environment, defaultMode, indexable, appOrigin }, null, 2) + '\n',
      })
    },
  }
}

/**
 * Centre d'aide — CDC Centre d'aide V1 §2, §6, §16.1.
 *
 * Le corpus `src/content/aide/` est lu et VALIDÉ à chaque build : un défaut
 * éditorial (article lié inexistant, slug en double, vocabulaire interne…)
 * interrompt le build avec la liste complète des défauts.
 *
 * Il produit, depuis la même source et avec la même version :
 *   · `virtual:help-center` — les articles publiés, pour les pages et la
 *     recherche du site ;
 *   · `/aide/catalogue.json` — ID → titre, URL, statut, lu par l'application
 *     pour « Besoin d'aide » (§2.1, §13) ;
 *   · `/aide/corpus-t2.json` — les sections citables, lues par l'assistant (§5) ;
 *   · `aide/.redirects.json` — anciennes URLs, lu par server.cjs (§13.1).
 *
 * Chaque environnement produit les siens : le catalogue de préproduction ne
 * décrit que la préproduction (§2, ENV-02).
 */
function helpCenterPlugin(): Plugin {
  const VIRTUAL = 'virtual:help-center'
  const RESOLVED = '\0' + VIRTUAL
  let environment: HelpEnvironment = 'production'
  let corpus: Corpus | null = null
  let version = ''
  let isSsr = false

  const load = () => {
    corpus = loadHelpCorpus(process.cwd())
    version = contentVersion(corpus, deployedCommit(process.cwd()))
    return corpus
  }

  const outputs = (c: Corpus) => {
    const at = new Date().toISOString()
    return {
      catalog: buildCatalog(c, environment, version, SITE_ORIGIN, at),
      t2: buildT2Corpus(c, environment, version, at),
      redirects: buildRedirects(c, environment),
    }
  }

  return {
    name: 'verebona-help-center',
    configResolved(config) {
      environment = parseEnvironment(config.env.VITE_ENVIRONMENT as string | undefined)
      isSsr = Boolean(config.build.ssr)
    },
    buildStart() {
      const c = load()
      for (const a of c.articles) this.addWatchFile(a.source)
      this.addWatchFile(`${HELP_CONTENT_DIR}/categories.json`)
    },
    resolveId(id) {
      return id === VIRTUAL ? RESOLVED : null
    },
    load(id) {
      if (id !== RESOLVED) return null
      const c = corpus ?? load()
      return [
        `export const environment = ${JSON.stringify(environment)};`,
        `export const version = ${JSON.stringify(version)};`,
        `export const categories = ${JSON.stringify(c.categories)};`,
        `export const articles = ${JSON.stringify(publishedArticles(c, environment))};`,
        `export const redirects = ${JSON.stringify(buildRedirects(c, environment))};`,
      ].join('\n')
    },
    configureServer(server) {
      // En local, l'application peut lire le catalogue du serveur de dev.
      server.middlewares.use((req, res, next) => {
        const url = (req.url ?? '').split('?')[0]
        if (url !== CATALOG_PATH && url !== T2_CORPUS_PATH) return next()
        const o = outputs(corpus ?? load())
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.end(JSON.stringify(url === CATALOG_PATH ? o.catalog : o.t2))
      })
      server.watcher.on('change', (file) => {
        if (!file.includes(`${HELP_CONTENT_DIR}/`)) return
        try { load() } catch (e) { server.config.logger.error(String((e as Error).message)) }
        const mod = server.moduleGraph.getModuleById(RESOLVED)
        if (mod) server.moduleGraph.invalidateModule(mod)
        server.ws.send({ type: 'full-reload' })
      })
    },
    generateBundle() {
      // Le build SSR (pré-rendu) n'est pas déployé : il ne publie rien.
      if (isSsr) return
      const o = outputs(corpus ?? load())
      const json = (v: unknown) => JSON.stringify(v, null, 2) + '\n'
      this.emitFile({ type: 'asset', fileName: CATALOG_PATH.slice(1), source: json(o.catalog) })
      this.emitFile({ type: 'asset', fileName: T2_CORPUS_PATH.slice(1), source: json(o.t2) })
      this.emitFile({ type: 'asset', fileName: REDIRECTS_FILE, source: json(o.redirects) })
      this.info?.(`[verebona] centre d'aide ${version} · ${o.t2.articles.length}/${o.catalog.articles.length} articles publiés (${environment})`)
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), siteModePlugin(), helpCenterPlugin()],
})
