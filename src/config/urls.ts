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

/** Page de connexion de l'app. */
export const loginUrl = (): string => appUrl("/login");

/** Page de creation de compte de l'app. */
export const signupUrl = (): string => appUrl("/signup");
