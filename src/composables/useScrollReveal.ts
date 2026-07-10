/**
 * Scroll-reveal: adds `.vb-in` to `.vb-reveal` / `.vb-rgroup` elements as they
 * enter the viewport (staggering the children of a group). Ported from the
 * prototype's IntersectionObserver logic. Honours prefers-reduced-motion and
 * has a safety timeout so content is never left hidden.
 */
let io: IntersectionObserver | null = null

const reduce =
  typeof window !== 'undefined' &&
  !!window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

if (!reduce && typeof document !== 'undefined') {
  document.documentElement.classList.add('vb-anim')
}

function revealAll() {
  document.querySelectorAll('.vb-reveal').forEach((e) => e.classList.add('vb-in'))
  document.querySelectorAll('.vb-rgroup > *').forEach((e) => e.classList.add('vb-in'))
}

function ensureObserver() {
  if (io || reduce || typeof window === 'undefined' || !('IntersectionObserver' in window)) return
  io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const el = entry.target as HTMLElement
        io!.unobserve(el)
        if (el.classList.contains('vb-rgroup')) {
          Array.from(el.children).forEach((c, i) => {
            ;(c as HTMLElement).style.transitionDelay = i * 90 + 'ms'
            c.classList.add('vb-in')
          })
        } else {
          el.classList.add('vb-in')
        }
      })
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
  )
}

export function useScrollReveal() {
  function scan() {
    if (reduce || typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      revealAll()
      return
    }
    ensureObserver()
    document.querySelectorAll('.vb-reveal, .vb-rgroup').forEach((el) => io!.observe(el))
    // Safety net: never leave content hidden.
    window.setTimeout(revealAll, 2200)
  }
  return { scan }
}
