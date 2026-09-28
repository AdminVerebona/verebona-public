/**
 * Formulaire de contact — CDC Centre d'aide GAP-17 / CONTACT-02 et A11Y-02.
 *
 * Le sujet choisi est transmis à l'API ; « Choisir… » est refusé ; les
 * erreurs sont annoncées aux lecteurs d'écran.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { defineComponent, h } from 'vue'
import ContactView from '../src/views/ContactView.vue'
import { vHover } from '../src/directives/hover'

const Stub = defineComponent({ render: () => h('div') })

async function render() {
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/:p(.*)*', component: Stub }] })
  await router.push('/contact')
  await router.isReady()
  return mount(ContactView, { global: { plugins: [router], directives: { hover: vHover } } })
}

async function fill(w: Awaited<ReturnType<typeof render>>, subject: string) {
  const inputs = w.findAll('input')
  await inputs[0].setValue('Camille')
  await inputs[1].setValue('Durand')
  await inputs[2].setValue('camille@example.org')
  await w.find('textarea').setValue('Bonjour')
  await w.find('[data-testid="contact-subject"]').setValue(subject)
}

afterEach(() => vi.unstubAllGlobals())

describe('formulaire de contact', () => {
  it('transmet le sujet choisi (CONTACT-02)', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)
    const w = await render()
    await fill(w, 'Aide technique')
    await w.find('form').trigger('submit')
    await flushPromises()
    expect(fetchMock).toHaveBeenCalledOnce()
    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body.subject).toBe('Aide technique')
    expect(body.name).toBe('Camille Durand')
    expect(w.text()).toContain('Message envoyé')
  })

  it('propose les quatre sujets, « Choisir… » non sélectionnable', async () => {
    const w = await render()
    const options = w.findAll('[data-testid="contact-subject"] option')
    expect(options.map((o) => o.text())).toEqual(['Choisir…', 'Question sur les offres', 'Aide technique', 'Partenariat', 'Autre'])
    expect(options[0].attributes('disabled')).toBeDefined()
  })

  it('refuse l’envoi sans sujet et annonce l’erreur (CONTACT-02, A11Y-02)', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const w = await render()
    await fill(w, '')
    await w.find('form').trigger('submit')
    await flushPromises()
    expect(fetchMock).not.toHaveBeenCalled()
    const live = w.find('#contact-error')
    expect(live.attributes('role')).toBe('alert')
    expect(live.attributes('aria-live')).toBe('assertive')
    expect(live.text()).toContain('choisir le sujet')
    const select = w.find('[data-testid="contact-subject"]')
    expect(select.attributes('aria-invalid')).toBe('true')
    expect(select.attributes('aria-describedby')).toBe('contact-error')
  })

  it("annonce aussi l'échec d'envoi du serveur", async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    const w = await render()
    await fill(w, 'Autre')
    await w.find('form').trigger('submit')
    await flushPromises()
    expect(w.find('[role="alert"]').text()).toContain("n'a pas pu être envoyé")
  })
})
