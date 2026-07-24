import { ref, computed } from 'vue'
import { appUrl } from '../config/urls'

/**
 * Formulaire de contact.
 *
 * Le message est transmis a l'API Verebona, qui se charge de l'envoi par
 * courriel. Le formulaire n'affiche la confirmation qu'apres reponse
 * favorable du serveur : une panne ne doit jamais faire croire a l'envoi.
 */
export function useContact() {
  const firstName = ref('')
  const lastName = ref('')
  const email = ref('')
  const message = ref('')

  const contactSent = ref(false)
  const sending = ref(false)
  const error = ref<string | null>(null)

  const notContactSent = computed(() => !contactSent.value)

  const sendContact = async (e?: Event) => {
    if (e && e.preventDefault) e.preventDefault()
    if (sending.value) return

    error.value = null

    if (!email.value.trim() || !message.value.trim()) {
      error.value = 'Merci de renseigner votre adresse e-mail et votre message.'
      return
    }

    sending.value = true
    try {
      const res = await fetch(appUrl('/api/contact'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${firstName.value} ${lastName.value}`.trim(),
          email: email.value.trim(),
          subject: 'Message depuis le site Verebona',
          message: message.value.trim(),
        }),
      })

      if (!res.ok) {
        error.value = "Votre message n'a pas pu être envoyé. Réessayez dans un instant."
        return
      }

      contactSent.value = true
    } catch {
      error.value = "Votre message n'a pas pu être envoyé. Vérifiez votre connexion."
    } finally {
      sending.value = false
    }
  }

  return {
    firstName, lastName, email, message,
    contactSent, notContactSent, sending, error,
    sendContact,
    crumbLabel: 'Contact',
  }
}
