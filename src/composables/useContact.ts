import { ref, computed } from 'vue'

/**
 * Contact form state. Front-only: submitting just flips to the success state
 * (no network call). Wire an API / mail service here later if needed.
 */
export function useContact() {
  const contactSent = ref(false)
  const notContactSent = computed(() => !contactSent.value)

  const sendContact = (e?: Event) => {
    if (e && e.preventDefault) e.preventDefault()
    contactSent.value = true
  }

  return { contactSent, notContactSent, sendContact, crumbLabel: 'Contact' }
}
