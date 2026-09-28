/**
 * Registre des URLs d'articles — CDC Centre d'aide V1 §2.2, ARCH-05, §13.1.
 *
 * « Un slug publié ne disparaît pas » : renommer un article ou le supprimer
 * sans redirection casse les liens partagés, les favoris, l'index des
 * moteurs et les raccourcis de l'application.
 *
 * `src/content/aide/slug-registry.json` est versionné : pour chaque ID, toutes
 * les URLs qu'il a portées. Règles :
 *   1. chaque URL enregistrée mène encore quelque part — URL canonique de
 *      son article, ou `redirectFrom` d'un article (le même ou un autre, en
 *      cas de fusion) ;
 *   2. un article supprimé n'est admis que si toutes ses URLs sont reprises
 *      en `redirectFrom` ailleurs ;
 *   3. toute URL actuelle (canonique ou `redirectFrom`) est enregistrée : un
 *      nouveau slug s'ajoute au registre, l'ancien y reste.
 *
 * Fonction pure : aucune lecture de disque.
 */
import type { Corpus } from './corpus'

export type SlugRegistry = Record<string, string[]>

export function checkSlugRegistry(corpus: Corpus, registry: SlugRegistry): string[] {
  const errors: string[] = []
  const byId = new Map(corpus.articles.map((a) => [a.id, a]))
  const redirected = new Map<string, string>()
  for (const a of corpus.articles) for (const r of a.redirectFrom) redirected.set(r, a.id)

  for (const [id, paths] of Object.entries(registry)) {
    const a = byId.get(id)
    for (const p of paths) {
      if (a && a.canonical === p) continue
      if (redirected.has(p)) continue
      errors.push(
        a
          ? `${id} : l’URL publiée ${p} ne mène plus à rien. Ajoutez-la à « redirectFrom » (${a.canonical}).`
          : `${id} supprimé : son URL ${p} doit être reprise en « redirectFrom » d’un autre article.`,
      )
    }
  }

  for (const a of corpus.articles) {
    const known = new Set(registry[a.id] ?? [])
    for (const p of [a.canonical, ...a.redirectFrom]) {
      if (!known.has(p)) errors.push(`${a.id} : ${p} absent de slug-registry.json — l’enregistrer (sans retirer les anciennes URLs).`)
    }
  }
  return errors
}

/** Registre à jour (utilisé une fois pour l'initialiser, et par les tests). */
export function buildSlugRegistry(corpus: Corpus, previous: SlugRegistry = {}): SlugRegistry {
  const out: SlugRegistry = { ...previous }
  for (const a of corpus.articles) {
    out[a.id] = [...new Set([...(previous[a.id] ?? []), a.canonical, ...a.redirectFrom])].sort()
  }
  return Object.fromEntries(Object.entries(out).sort(([x], [y]) => x.localeCompare(y)))
}
