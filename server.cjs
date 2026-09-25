const express = require("express");
const basicAuth = require("express-basic-auth");
const fs = require("fs");
const path = require("path");

const app = express();

const port = process.env.PORT || 3000;

const username = process.env.BASIC_AUTH_USER || "admin";
const password = process.env.BASIC_AUTH_PASSWD;

const distDir = path.join(__dirname, "dist");

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

if (process.env.BASIC_AUTH_ENABLED === "true") {
  app.use(
    basicAuth({
      users: {
        [username]: password,
      },
      challenge: true,
      realm: "Protected",
    })
  );

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

app.use(express.static(distDir));

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
 * ══════════════════════════════════════════════════════════════════════════
 */
const CRAWLER_FILES = new Set(["/sitemap.xml", "/robots.txt"]);
const SPA_SHELL = path.join(distDir, "spa.html");

app.get("/{*splat}", (req, res) => {
  if (CRAWLER_FILES.has(req.path)) {
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
