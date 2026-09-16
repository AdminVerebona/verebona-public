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

app.use(express.static(distDir));

app.get("/{*splat}", (_, res) => {
  res.sendFile(path.join(distDir, "index.html"));
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
