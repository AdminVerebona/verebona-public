/**
 * URLs de l'application Verebona (repo verebona-app).
 *
 * verebona.fr (ce repo, vitrine)  ->  app.verebona.fr (application)
 *
 * L'URL de l'app vient de la variable d'environnement VITE_APP_URL,
 * injectee au build par Vite (import.meta.env), differente par
 * environnement (local / preprod / prod). Jamais codee en dur.
 */

// Fallback = prod. En preprod/local, definir VITE_APP_URL dans le .env adequat.
const APP_URL: string =
  (import.meta.env.VITE_APP_URL as string | undefined)?.replace(/\/+$/, "") ??
  "https://app.verebona.fr";

/** URL absolue vers une route de l'app. */
export function appUrl(path = "/"): string {
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${APP_URL}${suffix}`;
}

/* ══════════════════════════════════════════════════════════════════════════
 * CODE DE PARRAINAGE
 *
 * La vitrine et l'application sont sur deux domaines distincts
 * (verebona.fr et app.verebona.fr). Un lien de parrainage arrive donc ici,
 * mais le formulaire d'inscription est la-bas : sans propagation explicite,
 * le code etait perdu au moment meme ou l'utilisateur cliquait sur
 * « Essayer gratuitement ».
 *
 * Contraintes du CDC parrainage :
 *   §4.2 — aucune conservation persistante : ni cookie, ni localStorage, ni
 *          sessionStorage, ni IndexedDB, ni service worker.
 *   §4.3 — le code ne circule que par le parametre d'URL ou par l'etat
 *          memoire du front, pour la duree du parcours actif.
 *   §4.4 — propagation explicite lors d'une navigation interne, sans creer
 *          de cookie de session pour le seul parrainage.
 *   §4.6 — la perte du code (onglet ferme, retour sans le lien) est le
 *          comportement attendu, pas une anomalie.
 *
 * D'ou une simple variable de module : elle vit le temps de l'onglet, survit
 * a la navigation vue-router, et disparait a la fermeture ou au rechargement
 * sans le lien. Rien n'est ecrit dans le navigateur.
 * ══════════════════════════════════════════════════════════════════════════ */

/** Nom du parametre. Stable et documente (CDC §4.1). */
export const REFERRAL_PARAM = "ref";

/** Etat memoire, volontairement non persiste (CDC §4.2). */
let referralInMemory: string | null = null;

/**
 * Normalise un code recu.
 *
 * Le code est reinjecte dans une URL : on n'y laisse passer que des
 * caracteres alphanumeriques. Le serveur reste seul juge de sa validite
 * (CDC §4.7) — ce filtre ne fait qu'eviter de propager n'importe quoi.
 */
function sanitizeReferral(raw: string | null): string | null {
  if (!raw) return null;
  const cleaned = raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (cleaned.length === 0 || cleaned.length > 32) return null;
  return cleaned;
}

/**
 * Lit le code present dans l'URL courante et le retient pour la duree du
 * parcours. A appeler une fois au demarrage, puis a chaque navigation.
 */
export function captureReferralCode(search?: string): string | null {
  if (typeof window === "undefined") return referralInMemory;
  const params = new URLSearchParams(search ?? window.location.search);
  const fromUrl = sanitizeReferral(params.get(REFERRAL_PARAM));
  if (fromUrl) referralInMemory = fromUrl;
  return referralInMemory;
}

/** Code applicable au parcours en cours, ou `null`. */
export function getReferralCode(): string | null {
  if (typeof window !== "undefined") {
    const fromUrl = sanitizeReferral(
      new URLSearchParams(window.location.search).get(REFERRAL_PARAM),
    );
    // L'URL fait foi : un nouveau lien remplace le code precedent.
    if (fromUrl) referralInMemory = fromUrl;
  }
  return referralInMemory;
}

/** Efface le code retenu. Utile aux tests et a une sortie explicite du parcours. */
export function clearReferralCode(): void {
  referralInMemory = null;
}

/** Ajoute le code de parrainage a une URL, s'il y en a un. */
function withReferral(url: string): string {
  const code = getReferralCode();
  if (!code) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}${REFERRAL_PARAM}=${encodeURIComponent(code)}`;
}

/** Page de connexion de l'app. */
export const loginUrl = (): string => appUrl("/login");

/**
 * Page de creation de compte de l'app, code de parrainage propage.
 *
 * Tous les boutons « Essayer gratuitement » passent par ici : la propagation
 * est donc faite une seule fois, et aucun point d'entree ne peut l'oublier.
 */
export const signupUrl = (): string => withReferral(appUrl("/signup"));
