import type { Directive } from 'vue'

/**
 * v-hover — applies a set of inline styles while the pointer is over the
 * element, and restores the previous values on leave. Reproduces the
 * `style-hover` behaviour of the design prototype.
 *
 * Usage:  <a v-hover="{ color: '#fff', transform: 'translateY(-1px)' }">
 */
type HoverStyles = Record<string, string>

interface HoverEl extends HTMLElement {
  __hoverEnter?: () => void
  __hoverLeave?: () => void
}

export const vHover: Directive<HoverEl, HoverStyles> = {
  mounted(el, binding) {
    const styles = binding.value || {}
    const original: HoverStyles = {}

    const enter = () => {
      for (const key in styles) {
        original[key] = (el.style as any)[key]
        ;(el.style as any)[key] = styles[key]
      }
    }
    const leave = () => {
      for (const key in styles) {
        ;(el.style as any)[key] = original[key] || ''
      }
    }

    el.__hoverEnter = enter
    el.__hoverLeave = leave
    el.addEventListener('mouseenter', enter)
    el.addEventListener('mouseleave', leave)
  },
  unmounted(el) {
    if (el.__hoverEnter) el.removeEventListener('mouseenter', el.__hoverEnter)
    if (el.__hoverLeave) el.removeEventListener('mouseleave', el.__hoverLeave)
  },
}
