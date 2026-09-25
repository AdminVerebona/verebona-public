/**
 * Applique l'en-tête d'une page d'aide dans le navigateur.
 *
 * Les valeurs viennent de `head.ts`, comme au pré-rendu. Appelé avec
 * `flush: 'post'` : il passe APRÈS les gardes globaux (titre générique,
 * canonical par chemin), qui s'appliquent à toutes les routes.
 */
import { watch, type WatchSource } from 'vue'
import type { HelpHead } from './head'

const JSONLD_ID = 'help-jsonld'
const ROBOTS_ATTR = 'data-help-robots'

function upsertMeta(selector: string, create: () => HTMLMetaElement, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) { el = create(); document.head.appendChild(el) }
  el.content = content
}

export function applyHelpHead(h: HelpHead): void {
  if (typeof document === 'undefined') return
  document.title = h.title
  upsertMeta('meta[name="description"]', () => Object.assign(document.createElement('meta'), { name: 'description' }), h.description)

  const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (h.canonical) {
    const link = canonical ?? Object.assign(document.createElement('link'), { rel: 'canonical' })
    link.href = h.canonical
    if (!canonical) document.head.appendChild(link)
    document.head.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.setAttribute('content', h.canonical)
  } else {
    canonical?.remove()
  }

  // Robots propre à l'aide : distinct de la meta globale de préproduction,
  // qu'il ne doit jamais retirer.
  const robots = document.head.querySelector(`meta[${ROBOTS_ATTR}]`)
  if (h.noindex) {
    if (!robots) {
      const m = Object.assign(document.createElement('meta'), { name: 'robots', content: 'noindex, follow' })
      m.setAttribute(ROBOTS_ATTR, '')
      document.head.appendChild(m)
    }
  } else {
    robots?.remove()
  }

  document.getElementById(JSONLD_ID)?.remove()
  if (h.jsonLd) {
    const s = document.createElement('script')
    s.type = 'application/ld+json'
    s.id = JSONLD_ID
    s.textContent = JSON.stringify(h.jsonLd)
    document.head.appendChild(s)
  }
}

/** Retire ce que l'aide a ajouté, en quittant ses pages. */
export function clearHelpHead(): void {
  if (typeof document === 'undefined') return
  document.getElementById(JSONLD_ID)?.remove()
  document.head.querySelector(`meta[${ROBOTS_ATTR}]`)?.remove()
}

export function useHelpHead(source: WatchSource<HelpHead>): void {
  watch(source, (h) => applyHelpHead(h), { immediate: true, flush: 'post' })
}
