import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import {
  isIndexable,
  parseEnvironment,
  resolveDefaultMode,
} from './src/config/site-mode.rules'

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
      if (indexable) return []
      return [
        {
          tag: 'meta',
          attrs: { name: 'robots', content: 'noindex, nofollow' },
          injectTo: 'head-prepend',
        },
      ]
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: indexable
          ? 'User-agent: *\nAllow: /\n'
          : 'User-agent: *\nDisallow: /\n',
      })
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
