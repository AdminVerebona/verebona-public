/**
 * Contrôle des tarifs dans le HTML prérendu de l'accueil — lot 76P.
 *
 * Exécuté à la fin de `npm run build` et de `npm run build:preprod`.
 * La source est celle que le build a figée dans `dist/.site-env.json`
 * (`pricingSource`, voir src/config/pricing-source.rules.ts) :
 *
 *   prelaunch_fixed  les trois prix mensuels TTC de PRELAUNCH_PRICE_GRID et la
 *                    mention « Tarifs prévus à l'ouverture — TTC » sont dans
 *                    `dist/index.html` ; ni « Tarif indisponible » ni état de
 *                    chargement → sinon échec ;
 *   catalog          aucun montant ni mention figés dans le HTML (les prix
 *                    viennent de l'API au chargement) → sinon échec.
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const env = JSON.parse(await readFile(path.join(dist, '.site-env.json'), 'utf8'))
const html = (await readFile(path.join(dist, 'index.html'), 'utf8')).replace(/[  ]/g, ' ')

const PLANS = { standard: '3,90 €', premium: '6,90 €', premium_duo: '9,90 €' }
const NOTICE = 'Tarifs prévus à l’ouverture — TTC'
const priceText = (code) => {
  const m = html.match(new RegExp(`data-testid="price-${code}"[^>]*>([\\s\\S]*?)</div>`))
  return m ? m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : null
}

const problems = []
const source = env.pricingSource ?? 'catalog'
for (const [code, monthly] of Object.entries(PLANS)) {
  const t = priceText(code)
  if (t === null) { problems.push(`prix ${code} absent du HTML prérendu`); continue }
  if (source === 'prelaunch_fixed' && t !== `${monthly} /mois TTC`) problems.push(`${code} : « ${t} » au lieu de « ${monthly} /mois TTC »`)
  if (source !== 'prelaunch_fixed' && /\d/.test(t)) problems.push(`${code} : montant figé « ${t} » alors que la source est le catalogue`)
}
if (source === 'prelaunch_fixed') {
  if (!html.includes(NOTICE)) problems.push(`mention « ${NOTICE} » absente`)
  if (/Tarif indisponible/.test(html)) problems.push('« Tarif indisponible » présent')
  if (/class="pr__price"[^>]*aria-busy="true"|aria-busy="true"[^>]*class="pr__price"/.test(html)) problems.push('état de chargement des prix présent')
} else if (html.includes(NOTICE)) problems.push('mention de grille temporaire présente avec le catalogue')

if (problems.length) {
  console.error(`[check-prelaunch-prices] ${env.environment} · tarifs=${source} :\n  - ${problems.join('\n  - ')}`)
  process.exit(1)
}
console.log(`[check-prelaunch-prices] ${env.environment} · tarifs=${source} : ${source === 'prelaunch_fixed' ? 'trois prix mensuels TTC et mention dans dist/index.html' : 'aucun montant figé (catalogue au chargement)'}`)
