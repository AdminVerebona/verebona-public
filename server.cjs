const express = require("express");
const basicAuth = require("express-basic-auth");
const fs = require("fs");
const path = require("path");

const app = express();

const port = process.env.PORT || 3000;

const username = process.env.BASIC_AUTH_USER || "admin";
const password = process.env.BASIC_AUTH_PASSWD;

const distDir = path.join(__dirname, "dist");
const SPA_SHELL = path.join(distDir, "spa.html");

/**
 * Environnement du build servi (CDC pre-lancement §8).
 * `dist/.site-env.json` est ecrit par vite.config.ts ; les dotfiles ne sont
 * pas servis par express.static. Fichier absent ou illisible : aucun en-tete
 * ajoute, pour ne jamais desindexer la production par erreur.
 */
let siteEnv = null;
try {
  siteEnv = JSON.parse(fs.readFileSync(path.join(distDir, ".site-env.json"), "utf8"));
  console.log(
    `Site environment: ${siteEnv.environment} (default mode: ${siteEnv.defaultMode}, ` +
    `${siteEnv.indexable ? "indexable" : "noindex"})`
  );
} catch {
  console.warn("dist/.site-env.json not found: X-Robots-Tag not set");
}

/**
 * Hote canonique (ticket SEO accueil, « Indexabilite »).
 *
 * `CANONICAL_HOST=www.verebona.fr` (production uniquement) : toute requete
 * recue en HTTP ou sur un autre hote (apex `verebona.fr`, domaine technique
 * de l'hebergeur…) est redirigee en UNE seule 301 vers
 * `https://www.verebona.fr` + chemin + query — jamais de chaine
 * http -> https -> www. Sans la variable, rien ne change : l'hebergeur peut
 * deja assurer cette convergence, et la preproduction ne doit pas rediriger
 * vers la production.
 */
const canonicalHost = (process.env.CANONICAL_HOST || "").trim().toLowerCase();
if (canonicalHost) {
  app.set("trust proxy", true);
  app.use((req, res, next) => {
    const host = (req.hostname || "").toLowerCase();
    const isHttps = req.secure || req.get("x-forwarded-proto") === "https";
    if (host === canonicalHost && isHttps) return next();
    res.redirect(301, `https://${canonicalHost}${req.originalUrl}`);
  });
}

if (siteEnv && siteEnv.indexable === false) {
  app.use((_, res, next) => {
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    next();
  });
}

/**
 * Données du Centre d'aide lues par l'application SERVEUR (assistant) et
 * par son navigateur (« Besoin d'aide ») : hors authentification basique en
 * préproduction, sans quoi l'assistant de préproduction ne lirait aucun
 * article et le contrôle CI échouerait. Contenu d'aide uniquement, `noindex`.
 */
const HELP_DATA_PATHS = new Set(["/aide/catalogue.json", "/aide/corpus-t2.json"]);

if (process.env.BASIC_AUTH_ENABLED === "true") {
  const auth = basicAuth({
    users: {
      [username]: password,
    },
    challenge: true,
    realm: "Protected",
  });
  app.use((req, res, next) => (HELP_DATA_PATHS.has(req.path) ? next() : auth(req, res, next)));

  console.log("Basic authentication enabled");
}

/**
 * Polices auto-hebergees (dist/fonts). Les noms de fichiers portent la
 * version Fontsource (ex. `-5.3.0.woff2`) : une mise a jour change l'URL,
 * d'ou un cache long et immuable sans risque de servir une version perimee.
 * `fallthrough: false` : un fichier absent repond 404 au lieu de tomber
 * dans le repli SPA (qui renverrait du HTML a la place d'une police).
 */
app.use(
  "/fonts",
  express.static(path.join(distDir, "fonts"), {
    maxAge: "1y",
    immutable: true,
    fallthrough: false,
  })
);

/**
 * ══════════════════════════════════════════════════════════════════════════
 * CENTRE D'AIDE — CDC Centre d'aide V1 §13.1, REDIR-01 à REDIR-03, MOB-01
 *
 * · Anciennes URLs : UNE redirection 301, directement vers la destination
 *   finale (« sans chaîne de redirections »). La table est produite au build
 *   depuis le corpus (`dist/aide/.redirects.json`, dotfile non servi).
 * · Pages : servies depuis leur HTML pré-rendu, sans slash final. Un article
 *   inconnu répond 404 avec la coquille SPA, qui affiche l'état « Cet article
 *   n'est plus disponible » (REDIR-02) — jamais une page vide ni un 200.
 * · Fichiers de données (catalogue, corpus de l'assistant) : lisibles depuis
 *   l'application de l'environnement, et elle seule.
 * · Mode intégré : seule l'application peut encadrer le site.
 * ══════════════════════════════════════════════════════════════════════════
 */
const helpDir = path.join(distDir, "aide");
let helpRedirects = {};
try {
  helpRedirects = JSON.parse(fs.readFileSync(path.join(helpDir, ".redirects.json"), "utf8"));
} catch {
  console.warn("dist/aide/.redirects.json not found: no help redirects");
}

const appOrigin = siteEnv && typeof siteEnv.appOrigin === "string" ? siteEnv.appOrigin : null;

app.use((req, res, next) => {
  // Clickjacking : seul le site lui-même et l'application peuvent l'encadrer.
  res.setHeader(
    "Content-Security-Policy",
    `frame-ancestors 'self'${appOrigin ? ` ${appOrigin}` : ""}`,
  );
  next();
});

const HELP_DATA = new Set(["/aide/catalogue.json", "/aide/corpus-t2.json"]);
app.use((req, res, next) => {
  if (!HELP_DATA.has(req.path)) return next();
  res.setHeader("Access-Control-Allow-Origin", appOrigin || "*");
  res.setHeader("Vary", "Origin");
  // Court : un article publié doit apparaître dans « Besoin d'aide » et dans
  // l'assistant sans attendre longtemps après le déploiement.
  res.setHeader("Cache-Control", "public, max-age=300");
  next();
});

const notFoundShell = (res) =>
  res.status(404).sendFile(SPA_SHELL, (e) => {
    if (e) res.status(404).type("text/plain").send("Not found\n");
  });

app.get(/^\/aide(\/.*)?$/, (req, res, next) => {
  const q = req.originalUrl.indexOf("?");
  const query = q === -1 ? "" : req.originalUrl.slice(q);
  // Une seule URL par page : ni `.html`, ni `index`, ni remontée de dossier.
  if (req.path.includes("..") || /\.html$/i.test(req.path) || /^\/aide\/index\/?$/.test(req.path)) {
    return notFoundShell(res);
  }
  if (/\.[a-z0-9]+$/i.test(req.path)) return next();
  const p = req.path.length > 5 ? req.path.replace(/\/+$/, "") : req.path;

  const target = helpRedirects[p];
  if (target) {
    res.redirect(301, target + query);
    return;
  }
  // `/aide/x/` → `/aide/x` : une URL canonique par page, en un saut.
  if (p !== req.path) {
    res.redirect(301, p + query);
    return;
  }

  // Résultats de recherche interne : jamais indexés (SEO-03).
  if (p === "/aide" && typeof req.query.q === "string") {
    res.setHeader("X-Robots-Tag", "noindex, follow");
  }

  const file = p === "/aide" ? "index.html" : `${p.slice("/aide/".length)}.html`;
  const full = path.join(helpDir, file);
  if (!full.startsWith(helpDir + path.sep)) return notFoundShell(res);
  fs.access(full, fs.constants.R_OK, (err) => (err ? notFoundShell(res) : res.sendFile(full)));
});

/**
 * Sitemap servi en `application/xml; charset=utf-8` (CDC Sitemap §7
 * « Type de contenu » et « Encodage ») : le type par defaut d'express ne
 * declare pas l'encodage.
 */
app.use(
  express.static(distDir, {
    setHeaders(res, filePath) {
      if (path.basename(filePath) === "sitemap.xml") {
        res.setHeader("Content-Type", "application/xml; charset=utf-8");
      }
    },
  })
);

/**
 * Fichiers destines aux robots d'exploration (CDC Sitemap §7).
 *
 * ══════════════════════════════════════════════════════════════════════════
 * LE REPLI SPA REPONDAIT DU HTML SUR /sitemap.xml
 *
 * Le catch-all ci-dessous renvoie `index.html` pour tout chemin non servi
 * par `express.static`. Aucun sitemap n'etant genere jusqu'ici,
 * `/sitemap.xml` repondait donc 200 avec un document HTML : exactement ce
 * que Search Console signalait.
 *
 * Le build de production emet desormais le fichier, et `express.static` le
 * sert en `application/xml`. Mais le repli reste dangereux : hors production
 * (§10) aucun sitemap n'est emis, et sans cette garde le meme faux 200 HTML
 * reviendrait. Un 404 franc est la reponse honnete — et empeche l'anomalie
 * de se reinstaller silencieusement si l'emission casse un jour.
 *
 * La garde couvre tout chemin qui designe un fichier (derniere section avec
 * une extension : `/sitemap_index.xml`, `/SITEMAP.XML`, un chunk JS perime
 * apres deploiement…) : aucune route du router n'en comporte, et repondre
 * 200 HTML a une URL de fichier est precisement l'anomalie signalee par
 * Search Console.
 * ══════════════════════════════════════════════════════════════════════════
 */
const FILE_PATH = /\/[^/]*\.[a-z0-9]+$/i;

app.get("/{*splat}", (req, res) => {
  if (FILE_PATH.test(req.path)) {
    res.status(404).type("text/plain").send("Not found\n");
    return;
  }
  // `/` est servi par express.static (dist/index.html : accueil pré-rendu).
  // Toute autre route reçoit la coquille SPA, sans le contenu ni le titre de
  // l'accueil. Repli sur index.html si le pré-rendu n'a pas été exécuté.
  res.sendFile(SPA_SHELL, (err) => {
    if (err) res.sendFile(path.join(distDir, "index.html"));
  });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
