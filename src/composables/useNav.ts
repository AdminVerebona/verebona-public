import { ref, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { siteModeQuery } from '../config/site'
import { embedQuery } from '../help/embed'

// Shared across header + footer + mobile menu.
const menuOpen = ref(false)

/**
 * useNav — header/footer navigation. Page links use vue-router; the four
 * in-page section links (Comment ça marche / Cas d'usage / Tarifs / FAQ) route to
 * home first if needed, then smooth-scroll to the anchor.
 */
export function useNav() {
  const router = useRouter()
  const route = useRoute()

  const toggleMenu = () => { menuOpen.value = !menuOpen.value }
  const closeMenu = () => { menuOpen.value = false }

  function scrollToId(id: string) {
    const el = document.getElementById(id)
    if (!el) return
    // Charte 2026 : le header n'est plus fixe. Sa hauteur n'est déduite que
    // s'il recouvre la page (position fixe ou collante).
    const headerEl = document.getElementById('vb-header')
    const pos = headerEl ? getComputedStyle(headerEl).position : 'static'
    const headerH = headerEl && (pos === 'fixed' || pos === 'sticky') ? headerEl.getBoundingClientRect().height : 0
    const padTop = parseFloat(getComputedStyle(el).paddingTop) || 0
    // On absorbe le padding haut de la section pour que le titre arrive près du haut de l'écran.
    const top = el.getBoundingClientRect().top + window.scrollY - headerH - 16 + Math.max(0, padTop - 28)
    try { window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' }) } catch { window.scrollTo(0, Math.max(0, top)) }
  }
  function goToAnchor(id: string) {
    closeMenu()
    if (route.path !== '/') {
      router.push('/').then(() => nextTick(() => setTimeout(() => scrollToId(id), 80)))
    } else {
      scrollToId(id)
    }
  }

  /**
   * Lien interne réel, à poser avec `v-bind="link('/aide')"`.
   *
   * Remplace les `href="#"` (CDC pré-lancement §10) : le lien a une vraie
   * cible (nouvel onglet, copie, lecteurs d'écran), conserve `?mode=` en
   * préprod, et un clic simple reste une navigation vue-router. Les clics
   * avec modificateur (Ctrl/Cmd/Maj/Alt) sont laissés au navigateur.
   */
  function link(path: string) {
    const to = { path, query: { ...siteModeQuery(), ...embedQuery() } }
    return {
      href: router.resolve(to).href,
      onClick: (event: MouseEvent) => {
        if (event.defaultPrevented || event.button !== 0) return
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
        event.preventDefault()
        closeMenu()
        router.push(to)
      },
    }
  }

  /**
   * Lien vers une section de l'accueil, à poser avec `v-bind="anchor('how')"`.
   *
   * Lot 72 : la cible est ABSOLUE (`/#how`, `?mode=` conservé en préprod).
   * L'ancienne cible relative (« #how » seul) visait la page courante : depuis
   * `/aide`, un nouvel onglet ou une navigation sans JavaScript ouvrait
   * `/aide#how`, où la section n'existe pas. Un clic simple garde le
   * défilement doux vers la section (retour à l'accueil si besoin).
   */
  function anchor(id: string) {
    const to = { path: '/', query: { ...siteModeQuery(), ...embedQuery() }, hash: `#${id}` }
    return {
      href: router.resolve(to).href,
      onClick: (event: MouseEvent) => {
        if (event.defaultPrevented || event.button !== 0) return
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
        event.preventDefault()
        goToAnchor(id)
      },
    }
  }

  const goHome = () => { closeMenu(); router.push('/') }
  const goAide = () => { closeMenu(); router.push('/aide') }
  const goContact = () => { closeMenu(); router.push('/contact') }
  const goMentions = () => { closeMenu(); router.push('/mentions-legales') }
  const goCGU = () => { closeMenu(); router.push('/cgu') }
  const goConfid = () => { closeMenu(); router.push('/confidentialite') }

  const navHow = () => goToAnchor('how')
  const navFeatures = () => goToAnchor('features')
  const navPricing = () => goToAnchor('pricing')
  const navFaq = () => goToAnchor('faq')
  const navCasUsage = () => goToAnchor('cas-usage')

  return {
    menuOpen, toggleMenu, closeMenu, link, anchor,
    goHome, goAide, goContact, goMentions, goCGU, goConfid,
    navHow, navFeatures, navPricing, navFaq, navCasUsage,
  }
}
