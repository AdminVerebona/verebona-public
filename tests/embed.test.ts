/**
 * Mode intégré — MOB-02, MOB-03 et point d'UX A11Y-04 de l'audit : une seule
 * barre « Retour à Verebona ». Dans le cadre de l'application, c'est la barre
 * de l'application qui s'affiche ; dans une WebView (page principale), celle
 * du site.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'

async function load(framed: boolean) {
  vi.resetModules()
  if (framed) vi.spyOn(window, 'top', 'get').mockReturnValue({} as Window)
  const embed = await import('../src/help/embed')
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/:p(.*)*', component: { render: () => null } }] })
  embed.installEmbedGuard(router)
  return { embed, router }
}

afterEach(() => vi.restoreAllMocks())

describe('barre du mode intégré', () => {
  it('page principale (WebView) : la barre du site est affichée', async () => {
    const { embed, router } = await load(false)
    await router.push('/aide?integre=app')
    const { embedded, showEmbedBar } = embed.useEmbed()
    expect(embedded.value).toBe(true)
    expect(showEmbedBar.value).toBe(true)
  })

  it("dans le cadre de l'application : pas de seconde barre", async () => {
    const { embed, router } = await load(true)
    await router.push('/aide?integre=app')
    const { embedded, showEmbedBar } = embed.useEmbed()
    expect(embedded.value).toBe(true) // en-tête et pied du site toujours masqués
    expect(showEmbedBar.value).toBe(false)
  })

  it('le paramètre suit la navigation interne', async () => {
    const { router } = await load(false)
    await router.push('/aide?integre=app')
    await router.push('/aide/parrainage')
    expect(router.currentRoute.value.query.integre).toBe('app')
  })

  it('hors mode intégré : ni barre ni paramètre', async () => {
    const { embed, router } = await load(false)
    await router.push('/aide')
    expect(embed.useEmbed().showEmbedBar.value).toBe(false)
    expect(embed.embedQuery()).toEqual({})
  })
})

describe('liens externes en mode intégré (§1.1)', () => {
  it('s’ouvrent hors du cadre ; liens internes inchangés', async () => {
    const { embed, router } = await load(true)
    await router.push('/aide?integre=app')
    expect(embed.useEmbed().embedded.value).toBe(true)
    const { mount } = await import('@vue/test-utils')
    const HelpInlines = (await import('../src/components/help/HelpInlines.vue')).default
    const w = mount(HelpInlines, {
      props: { inlines: [{ kind: 'link', text: 'Ext', href: 'https://exemple.fr' }] },
      global: { plugins: [router] },
    })
    const a = w.find('a')
    expect(a.attributes('target')).toBe('_blank')
    expect(a.attributes('rel')).toBe('noopener noreferrer')
  })
})
