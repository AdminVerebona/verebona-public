import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import {
  isIndexable,
  parseEnvironment,
  resolveDefaultMode,
} from './src/config/site-mode.rules'
import { buildRobotsTxt, buildSitemapXml } from './src/config/sitemap.rules'
import { structuredDataScript } from './src/config/structured-data'

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

  return {
    name: 'verebona-site-mode',
    configResolved(config) {
      const raw = config.env.VITE_ENVIRONMENT as string | undefined
      environment = parseEnvironment(raw)
      defaultMode = resolveDefaultMode(environment, config.env.VITE_DEFAULT_SITE_MODE)
      indexable = isIndexable(environment)
      const warn = raw ? '' : ' (VITE_ENVIRONMENT absent : traité comme production)'
      config.logger.info(
        `\n[verebona] environnement=${environment} · mode par défaut=${defaultMode} · ` +
          `${indexable ? 'indexable' : 'noindex'}${warn}\n`,
      )
    },
    transformIndexHtml() {
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

      return tags
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
        this.emitFile({
          type: 'asset',
          fileName: 'sitemap.xml',
          source: buildSitemapXml(),
        })
      }

      this.emitFile({
        type: 'asset',
        fileName: '.site-env.json',
        source: JSON.stringify({ environment, defaultMode, indexable }, null, 2) + '\n',
      })
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), siteModePlugin()],
})
