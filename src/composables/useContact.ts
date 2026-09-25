import { ref, computed } from 'vue'
import { appUrl } from '../config/urls'

/**
 * Formulaire de contact.
 *
 * Le message est transmis a l'API Verebona, qui se charge de l'envoi par
 * courriel. Le formulaire n'affiche la confirmation qu'apres reponse
 * favorable du serveur : une panne ne doit jamais faire croire a l'envoi.
 */
/**
 * GAP-17 / CONTACT-02 (CDC Centre d'aide §15) : le sujet choisi est transmis
 * tel quel a l'API. Liste fermee : l'API recopie le sujet dans l'objet du
 * courriel, on n'accepte donc que les valeurs proposees par le selecteur.
 */
export const CONTACT_SUBJECTS = [
  'Question sur les offres',
  'Aide technique',
  'Partenariat',
  'Autre',
] as const

export type ContactSubject = (typeof CONTACT_SUBJECTS)[number]

export function isContactSubject(value: string): value is ContactSubject {
  return (CONTACT_SUBJECTS as readonly string[]).includes(value)
}

export function useContact() {
  const firstName = ref('')
  const lastName = ref('')
  const email = ref('')
  // Vide = option « Choisir… » : refusee a la validation (CONTACT-02).
  const subject = ref('')
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

    // CONTACT-02 : « Choisir… » n'est pas un sujet ; toute valeur hors liste
    // (DOM modifie) est refusee plutot que remplacee silencieusement.
    if (!isContactSubject(subject.value)) {
      error.value = 'Merci de choisir le sujet de votre message.'
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
          subject: subject.value,
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
    firstName, lastName, email, subject, message,
    subjects: CONTACT_SUBJECTS,
    contactSent, notContactSent, sending, error,
    sendContact,
    crumbLabel: 'Contact',
  }
}
