import { ref, computed, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'

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
    const headerEl = document.getElementById('vb-header')
    const headerH = headerEl ? headerEl.getBoundingClientRect().height : 68
    const padTop = parseFloat(getComputedStyle(el).paddingTop) || 0
    // On absorbe le padding haut de la section pour que le titre arrive juste sous le header.
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

  const burgerBase = 'display:block;width:20px;height:2px;border-radius:2px;background:#fff;transition:transform .25s,opacity .25s;'
  const burgerTop = computed(() => burgerBase + 'transform:' + (menuOpen.value ? 'translateY(6px) rotate(45deg)' : 'none'))
  const burgerMid = computed(() => burgerBase + 'opacity:' + (menuOpen.value ? '0' : '1'))
  const burgerBot = computed(() => burgerBase + 'transform:' + (menuOpen.value ? 'translateY(-6px) rotate(-45deg)' : 'none'))

  return {
    menuOpen, toggleMenu, closeMenu,
    goHome, goAide, goContact, goMentions, goCGU, goConfid,
    navHow, navFeatures, navPricing, navFaq, navCasUsage,
    burgerTop, burgerMid, burgerBot,
  }
}
