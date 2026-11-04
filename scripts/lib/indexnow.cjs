/**
 * IndexNow — notification des URL publiques modifiées (chantier 105Q, audit Bing).
 *
 * Module CommonJS : lu par `server.cjs` (envoi au démarrage, production seule)
 * et par `scripts/indexnow-prepare.mjs` (liste des URL au build). Voir
 * docs/seo/indexnow.md.
 *
 * Principes :
 *   · jamais hors production : `.site-env.json` doit dire `production` ET
 *     `indexable`, sinon rien (ni clé servie, ni envoi) ;
 *   · aucun secret dans le dépôt : la clé vient de `INDEXNOW_KEY` ;
 *   · seules les URL du sitemap (pages publiques canoniques indexables), plus
 *     celles qui en sont sorties (suppression, redirection) ;
 *   · une notification n'est PAS une garantie d'indexation.
 */
"use strict";

const crypto = require("crypto");

const ENDPOINT = "https://api.indexnow.org/indexnow";
const MAX_URLS_PER_REQUEST = 10000;
/** Format de clé admis par le protocole : 8 à 128 caractères a-z, A-Z, 0-9, « - ». */
const KEY = /^[A-Za-z0-9-]{8,128}$/;

const isValidKey = (key) => typeof key === "string" && KEY.test(key);

/**
 * Notification active pour ce processus ? Raison lisible dans tous les cas.
 * `env` : variables du processus ; `siteEnv` : contenu de dist/.site-env.json.
 */
function indexNowStatus(env, siteEnv) {
  if (!siteEnv || siteEnv.environment !== "production" || siteEnv.indexable !== true) {
    return { enabled: false, reason: "environnement autre que la production indexable" };
  }
  if (String(env.INDEXNOW_ENABLED || "").toLowerCase() === "false") {
    return { enabled: false, reason: "INDEXNOW_ENABLED=false" };
  }
  if (!env.INDEXNOW_KEY) return { enabled: false, reason: "INDEXNOW_KEY absente" };
  if (!isValidKey(env.INDEXNOW_KEY)) return { enabled: false, reason: "INDEXNOW_KEY invalide (8 à 128 caractères a-z A-Z 0-9 -)" };
  return { enabled: true, reason: "production, clé présente", key: env.INDEXNOW_KEY };
}

/**
 * Empreinte du contenu SIGNIFICATIF d'une page pré-rendue : titre, meta
 * description, canonical, meta robots et contenu de `#app`. Les noms de
 * fichiers hachés de Vite (qui changent à chaque build) n'y entrent pas : une
 * page n'est « modifiée » que si ce qu'un moteur lit a changé.
 */
function pageFingerprint(html) {
  const pick = (re) => {
    const m = re.exec(html);
    return m ? m[0] : "";
  };
  const app = html.indexOf('<div id="app"');
  const end = html.lastIndexOf("</body>");
  const body = app === -1 ? html : html.slice(app, end === -1 ? undefined : end);
  // Ce que lit un moteur : texte visible, liens, images (src + alt). Les
  // identifiants techniques (ex. `id` aléatoire du champ de recherche) n'y
  // entrent pas : sinon chaque build « modifierait » toutes les pages.
  const visible = body.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const links = [...body.matchAll(/<a\b[^>]*\shref="([^"]*)"/g)].map((m) => m[1]).join(" ");
  const imgs = [...body.matchAll(/<img\b[^>]*>/g)].map((m) => `${(/\ssrc="([^"]*)"/.exec(m[0]) || [])[1] || ""}|${(/\salt="([^"]*)"/.exec(m[0]) || [])[1] ?? "∅"}`).join(" ");
  const parts = [
    pick(/<title>[\s\S]*?<\/title>/),
    pick(/<meta\s+name="description"[^>]*>/),
    pick(/<link rel="canonical"[^>]*>/),
    pick(/<meta name="robots"[^>]*>/),
    visible,
    links,
    imgs,
  ];
  return crypto.createHash("sha256").update(parts.join("\n")).digest("hex").slice(0, 32);
}

/**
 * URL à notifier : ajoutées, modifiées, retirées (sorties du sitemap : 404,
 * 410 ou 301 — le moteur doit le constater). `prev` null : état précédent
 * inconnu (premier déploiement) → toutes les URL actuelles.
 */
function changedUrls(prev, next) {
  const before = prev && prev.pages && typeof prev.pages === "object" ? prev.pages : null;
  const now = next.pages;
  if (!before) return Object.keys(now).sort();
  const out = new Set();
  for (const [url, fp] of Object.entries(now)) if (before[url] !== fp) out.add(url);
  for (const url of Object.keys(before)) if (!(url in now)) out.add(url);
  return [...out].sort();
}

/** URL `<loc>` d'un sitemap. */
function sitemapUrls(xml) {
  return [...String(xml).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) =>
    m[1].replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'"),
  );
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Envoi à IndexNow, par lots, avec reprise limitée :
 *   200 / 202           → succès ;
 *   429, 5xx, réseau    → nouvel essai (au plus `attempts`, délais croissants) ;
 *   400, 403, 422…      → échec définitif, journalisé (clé non vérifiée, URL
 *                          hors du domaine…), pas de nouvel essai.
 * Ne lève jamais : renvoie un bilan.
 */
async function submitIndexNow({ host, key, urls, fetchImpl = globalThis.fetch, log = console, attempts = 3, retryDelaysMs = [60000, 300000] }) {
  const result = { sent: 0, failed: 0, batches: [] };
  if (!urls.length) {
    log.log("[indexnow] aucune URL modifiée depuis la dernière notification : rien à envoyer");
    return result;
  }
  for (let i = 0; i < urls.length; i += MAX_URLS_PER_REQUEST) {
    const urlList = urls.slice(i, i + MAX_URLS_PER_REQUEST);
    const body = JSON.stringify({ host, key, keyLocation: `https://${host}/${key}.txt`, urlList });
    let outcome = null;
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        const res = await fetchImpl(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body,
          signal: AbortSignal.timeout(15000),
        });
        if (res.status === 200 || res.status === 202) {
          outcome = { ok: true, status: res.status, attempt };
          break;
        }
        const retry = res.status === 429 || res.status >= 500;
        outcome = { ok: false, status: res.status, attempt };
        log.error(`[indexnow] échec HTTP ${res.status} (essai ${attempt}/${attempts}, ${urlList.length} URL)${retry ? "" : " — définitif"}`);
        if (!retry) break;
      } catch (e) {
        outcome = { ok: false, status: null, attempt, error: e && e.message };
        log.error(`[indexnow] erreur réseau (essai ${attempt}/${attempts}) : ${e && e.message}`);
      }
      if (attempt < attempts) await sleep(retryDelaysMs[Math.min(attempt - 1, retryDelaysMs.length - 1)] || 0);
    }
    result.batches.push({ size: urlList.length, ...outcome });
    if (outcome && outcome.ok) {
      result.sent += urlList.length;
      log.log(`[indexnow] ${urlList.length} URL notifiée(s) (HTTP ${outcome.status}) : ${urlList.slice(0, 5).join(" ")}${urlList.length > 5 ? " …" : ""}`);
    } else {
      result.failed += urlList.length;
      log.error(`[indexnow] ${urlList.length} URL NON notifiée(s) — elles seront reprises au prochain déploiement seulement si elles changent encore ; relancer à la main si besoin (docs/seo/indexnow.md)`);
    }
  }
  return result;
}

module.exports = {
  ENDPOINT,
  MAX_URLS_PER_REQUEST,
  isValidKey,
  indexNowStatus,
  pageFingerprint,
  changedUrls,
  sitemapUrls,
  submitIndexNow,
};
