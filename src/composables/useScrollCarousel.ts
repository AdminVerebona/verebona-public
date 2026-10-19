import { onMounted, onUnmounted, ref, type Ref } from 'vue'

/* ============================================================
   useScrollCarousel — carrousel horizontal NATIF piloté par l'utilisateur
   (lot 69P, page publique mobile).

   - Défilement natif (`overflow-x: auto` + `scroll-snap`) : swipe tactile,
     molette, flèches du clavier quand la piste a le focus.
   - Boutons précédent / suivant en complément (jamais le swipe seul).
   - AUCUN défilement automatique : rien ne bouge sans action de
     l'utilisateur (charte « Sérénité » : pas de mouvement continu).
   - prefers-reduced-motion : déplacement instantané (pas de `smooth`).
   - Position : premier / dernier élément entièrement visibles, bornes.
   - Annonce polie (`status`) seulement après un clic sur un bouton : le
     swipe ne déclenche pas de bavardage du lecteur d'écran.

   Sans effet au prérendu (SSR) : tout accès au DOM est dans onMounted.
   ============================================================ */

export interface ScrollCarousel {
  track: Ref<HTMLElement | null>
  /** Index du premier élément entièrement visible. */
  first: Ref<number>
  /** Index du dernier élément entièrement visible. */
  last: Ref<number>
  atStart: Ref<boolean>
  atEnd: Ref<boolean>
  /** Le contenu dépasse la largeur de la piste (boutons utiles). */
  overflow: Ref<boolean>
  /** Texte de la région `aria-live` (rempli après un clic sur un bouton). */
  status: Ref<string>
  prev: () => void
  next: () => void
  goTo: (i: number) => void
}

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function useScrollCarousel(opts: {
  /** Nombre d'éléments de la piste. */
  count: number
  /** `page` : avance d'autant d'éléments que visibles ; `one` : un par un. */
  step?: 'one' | 'page'
  /** Texte annoncé après un déplacement au bouton. */
  announce: (first: number, last: number) => string
}): ScrollCarousel {
  const track = ref<HTMLElement | null>(null)
  const first = ref(0)
  const last = ref(0)
  const atStart = ref(true)
  const atEnd = ref(false)
  const overflow = ref(true)
  const status = ref('')
  let raf = 0
  let ro: ResizeObserver | null = null
  let pendingAnnounce = false
  let announceTimer = 0

  const items = (): HTMLElement[] => (track.value ? Array.from(track.value.children) as HTMLElement[] : [])

  function measure() {
    raf = 0
    const el = track.value
    if (!el) return
    const list = items()
    const box = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    const left = box.left + (parseFloat(cs.paddingLeft) || 0) - 2
    const right = box.right - (parseFloat(cs.paddingRight) || 0) + 2
    let f = -1
    let l = -1
    list.forEach((it, i) => {
      const r = it.getBoundingClientRect()
      if (r.left >= left && r.right <= right) { if (f < 0) f = i; l = i }
    })
    if (f < 0) {
      // Élément plus large que la piste (zoom fort) : celui qui occupe le début.
      const i = list.findIndex((it) => it.getBoundingClientRect().right > left + 8)
      f = l = Math.max(0, i)
    }
    first.value = f
    last.value = l
    // Bornes : le premier (dernier) élément est entièrement visible, ou la
    // piste est au bout (le point d'accroche peut laisser 1 à 2 px de jeu).
    atStart.value = el.scrollLeft <= 1 || (list.length > 0 && f === 0)
    atEnd.value = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1 || (list.length > 0 && l === list.length - 1)
    overflow.value = el.scrollWidth > el.clientWidth + 1
    if (pendingAnnounce) {
      window.clearTimeout(announceTimer)
      announceTimer = window.setTimeout(() => {
        pendingAnnounce = false
        status.value = opts.announce(first.value, last.value)
      }, 250)
    }
  }
  const schedule = () => { if (!raf) raf = window.requestAnimationFrame(measure) }

  function goTo(i: number) {
    const el = track.value
    const list = items()
    if (!el || !list.length) return
    const target = list[Math.max(0, Math.min(i, list.length - 1))]
    const offset = target.offsetLeft - list[0].offsetLeft
    pendingAnnounce = true
    el.scrollTo({ left: offset, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
    schedule()
  }
  const span = () => (opts.step === 'page' ? Math.max(1, last.value - first.value + 1) : 1)
  const next = () => { if (!atEnd.value) goTo(Math.min(opts.count - 1, first.value + span())) }
  const prev = () => { if (!atStart.value) goTo(Math.max(0, first.value - span())) }

  onMounted(() => {
    const el = track.value
    if (!el) return
    el.addEventListener('scroll', schedule, { passive: true })
    if (typeof ResizeObserver !== 'undefined') { ro = new ResizeObserver(schedule); ro.observe(el) }
    else window.addEventListener('resize', schedule)
    measure()
  })
  onUnmounted(() => {
    track.value?.removeEventListener('scroll', schedule)
    ro?.disconnect()
    window.removeEventListener('resize', schedule)
    if (raf) window.cancelAnimationFrame(raf)
    window.clearTimeout(announceTimer)
  })

  return { track, first, last, atStart, atEnd, overflow, status, prev, next, goTo }
}
