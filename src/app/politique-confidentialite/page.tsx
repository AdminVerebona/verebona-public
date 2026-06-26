import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Comment Verebona collecte, utilise et protège vos données personnelles.",
  alternates: { canonical: 'https://verebona.app/politique-confidentialite' },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="public-page min-h-screen flex flex-col bg-[color:var(--bg-page)]">
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-[rgba(15,23,42,0.75)] border-b border-[rgba(31,41,55,0.4)] pt-[env(safe-area-inset-top)]">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 md:px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[color:var(--accent-soft)] mb-6">
              <Shield className="w-8 h-8 text-[color:var(--accent)]" />
            </div>
            <h1 className="text-3xl font-semibold text-[color:var(--text-primary)] mb-3">
              Politique de confidentialité de Verebona
            </h1>
            <p className="text-sm text-[color:var(--text-muted)]">
              Dernière mise à jour : 20/06/2026
            </p>
          </div>

          {/* Content */}
          <div className="bg-[color:var(--bg-card)] border border-[color:var(--border-subtle)] rounded-lg p-8 space-y-8">

            {/* Introduction */}
            <section>
              <div className="text-[color:var(--text-muted)] leading-relaxed space-y-3">
                <p>
                  La présente Politique de confidentialité décrit la manière dont Verebona traite les données à caractère personnel dans le cadre du Service proposé via le Site.
                </p>
                <p>
                  Elle complète les{" "}
                  <Link href="/cgsu" className="text-[color:var(--accent)] hover:underline">
                    CGSU
                  </Link>
                  , dont elle fait partie intégrante. En cas de contradiction, la Politique de confidentialité prévaut pour les aspects relatifs à la protection des données.
                </p>
              </div>
            </section>

            {/* 1. Responsable du traitement */}
            <section>
              <h2 className="text-xl font-semibold text-[color:var(--text-primary)] mb-4">
                1. Responsable du traitement
              </h2>
              <div className="text-[color:var(--text-muted)] leading-relaxed space-y-3">
                <p>Le responsable du traitement est :</p>
                <div className="ml-4 space-y-1">
                  <p><strong className="text-[color:var(--text-primary)]">Verebona</strong> [forme sociale]</p>
                  <p>Capital social : [●] €</p>
                  <p>Siège social : [adresse complète]</p>
                  <p>RCS : [ville] – [numéro]</p>
                  <p>
                    Email :{" "}
                    <a href="mailto:contact@verebona.com" className="text-[color:var(--accent)] hover:underline">
                      contact@verebona.com
                    </a>
                  </p>
                </div>
                <p>
                  DPO / contact données :{" "}
                  <a href="mailto:dpo@verebona.com" className="text-[color:var(--accent)] hover:underline">
                    dpo@verebona.com
                  </a>
                </p>
              </div>
            </section>

            {/* 2. Données collectées */}
            <section>
              <h2 className="text-xl font-semibold text-[color:var(--text-primary)] mb-4">
                2. Données collectées
              </h2>
              <div className="text-[color:var(--text-muted)] leading-relaxed space-y-4">

                <div>
                  <p className="font-medium text-[color:var(--text-primary)] mb-2">2.1 Données de compte</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Nom, prénom</li>
                    <li>Adresse email</li>
                    <li>Mot de passe (chiffré)</li>
                    <li>Organisation, fonction (facultatif)</li>
                  </ul>
                </div>

                <div>
                  <p className="font-medium text-[color:var(--text-primary)] mb-2">2.2 Données liées au Service</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Informations sur les biens</li>
                    <li>Données saisies (dates, caractéristiques, etc.)</li>
                    <li>Documents déposés</li>
                    <li>Métadonnées (date, taille, type, etc.)</li>
                    <li>Données issues de traitements automatisés (OCR, indexation)</li>
                  </ul>

                  <div className="mt-4 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-3">
                    <p className="font-medium text-[color:var(--text-primary)]">⚠️ Traitement des documents</p>
                    <p>Les Documents peuvent contenir :</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>des données personnelles</li>
                      <li>des données de tiers</li>
                      <li>des données sensibles</li>
                    </ul>
                    <p className="font-medium text-[color:var(--text-primary)] mt-2">👉 Règles importantes :</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>L'Utilisateur est seul responsable du contenu des Documents</li>
                      <li>Il garantit disposer des droits nécessaires pour les déposer</li>
                      <li>Verebona ne sollicite pas de données sensibles</li>
                    </ul>
                    <p className="font-medium text-[color:var(--text-primary)] mt-2">👉 Position de Verebona :</p>
                    <p>Verebona agit comme prestataire technique de stockage et outil d'organisation. Verebona ne contrôle pas le contenu des Documents.</p>
                  </div>
                </div>

                <div>
                  <p className="font-medium text-[color:var(--text-primary)] mb-2">2.3 Données de paiement</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Données de facturation</li>
                    <li>Données d'abonnement</li>
                    <li>Paiement via Stripe — données bancaires non accessibles à Verebona</li>
                  </ul>
                </div>

                <div>
                  <p className="font-medium text-[color:var(--text-primary)] mb-2">2.4 Données techniques</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Logs (IP, navigateur, OS, date/heure)</li>
                    <li>Données de sécurité</li>
                    <li>Cookies (voir politique dédiée)</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 3. Données de tiers */}
            <section>
              <h2 className="text-xl font-semibold text-[color:var(--text-primary)] mb-4">
                3. Données de tiers
              </h2>
              <div className="text-[color:var(--text-muted)] leading-relaxed space-y-3">
                <p>Les Documents peuvent contenir des données relatives à des tiers.</p>
                <p>L'Utilisateur :</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>garantit avoir le droit de traiter ces données</li>
                  <li>assume la responsabilité de leur traitement</li>
                </ul>
                <p>Verebona n'intervient pas dans la qualification juridique de ces données.</p>
              </div>
            </section>

            {/* 4. Finalités et bases légales */}
            <section>
              <h2 className="text-xl font-semibold text-[color:var(--text-primary)] mb-4">
                4. Finalités et bases légales
              </h2>
              <div className="text-[color:var(--text-muted)] leading-relaxed space-y-4">

                <div>
                  <p className="font-medium text-[color:var(--text-primary)] mb-2">4.1 Fourniture du Service</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Gestion du compte</li>
                    <li>Gestion des biens</li>
                    <li>Stockage documentaire</li>
                    <li>OCR et indexation</li>
                  </ul>
                  <p className="mt-2"><strong className="text-[color:var(--text-primary)]">Base légale :</strong> exécution du contrat</p>
                </div>

                <div>
                  <p className="font-medium text-[color:var(--text-primary)] mb-2">4.2 Facturation</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Gestion abonnements</li>
                    <li>Paiements</li>
                  </ul>
                  <p className="mt-2"><strong className="text-[color:var(--text-primary)]">Base légale :</strong> contrat + obligation légale</p>
                </div>

                <div>
                  <p className="font-medium text-[color:var(--text-primary)] mb-2">4.3 Sécurité et amélioration</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Prévention fraude</li>
                    <li>Maintenance</li>
                    <li>Statistiques anonymisées</li>
                  </ul>
                  <p className="mt-2"><strong className="text-[color:var(--text-primary)]">Base légale :</strong> intérêt légitime</p>
                </div>

                <div>
                  <p className="font-medium text-[color:var(--text-primary)] mb-2">4.4 Communications</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Emails techniques</li>
                    <li>Notifications</li>
                  </ul>
                  <p className="mt-2"><strong className="text-[color:var(--text-primary)]">Base légale :</strong> contrat</p>
                </div>

                <div>
                  <p className="font-medium text-[color:var(--text-primary)] mb-2">4.5 Marketing (facultatif)</p>
                  <p className="mt-2"><strong className="text-[color:var(--text-primary)]">Base légale :</strong> intérêt légitime ou consentement</p>
                </div>
              </div>
            </section>

            {/* 5. Destinataires et sous-traitants */}
            <section>
              <h2 className="text-xl font-semibold text-[color:var(--text-primary)] mb-4">
                5. Destinataires et sous-traitants
              </h2>
              <div className="text-[color:var(--text-muted)] leading-relaxed space-y-3">
                <p>Les données peuvent être traitées par :</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Équipes internes Verebona</li>
                  <li>Hébergement : Vercel (app), Supabase (base de données), OVH (fichiers)</li>
                  <li>Paiement : Stripe</li>
                  <li>Emailing : Resend</li>
                  <li>Outils techniques (monitoring, OCR, etc.)</li>
                </ul>
                <p>Ces acteurs agissent en tant que sous-traitants ou responsables indépendants.</p>
              </div>
            </section>

            {/* 6. Transferts hors UE */}
            <section>
              <h2 className="text-xl font-semibold text-[color:var(--text-primary)] mb-4">
                6. Transferts hors UE
              </h2>
              <div className="text-[color:var(--text-muted)] leading-relaxed space-y-3">
                <p>Certains prestataires peuvent être hors UE. Garanties mises en place :</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Clauses contractuelles types</li>
                  <li>Décisions d'adéquation</li>
                  <li>Mesures techniques</li>
                </ul>
              </div>
            </section>

            {/* 7. Durées de conservation */}
            <section>
              <h2 className="text-xl font-semibold text-[color:var(--text-primary)] mb-4">
                7. Durées de conservation
              </h2>
              <div className="text-[color:var(--text-muted)] leading-relaxed space-y-3">
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong className="text-[color:var(--text-primary)]">Compte :</strong> durée de la relation + 3 ans</li>
                  <li><strong className="text-[color:var(--text-primary)]">Documents :</strong> jusqu'à 60 jours après suppression du compte</li>
                  <li><strong className="text-[color:var(--text-primary)]">Sauvegardes :</strong> conservation temporaire sécurisée</li>
                  <li><strong className="text-[color:var(--text-primary)]">Facturation :</strong> 10 ans</li>
                  <li><strong className="text-[color:var(--text-primary)]">Logs :</strong> 12 mois</li>
                </ul>
                <p>Les données sont ensuite supprimées ou anonymisées.</p>
              </div>
            </section>

            {/* 8. Suppression et sauvegardes */}
            <section>
              <h2 className="text-xl font-semibold text-[color:var(--text-primary)] mb-4">
                8. Suppression et sauvegardes
              </h2>
              <div className="text-[color:var(--text-muted)] leading-relaxed space-y-3">
                <p>La suppression du compte entraîne :</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Suppression des données en production</li>
                  <li>Conservation temporaire en sauvegardes sécurisées</li>
                </ul>
                <p>Les données en sauvegarde ne sont plus accessibles et sont supprimées progressivement.</p>
              </div>
            </section>

            {/* 9. Sécurité */}
            <section>
              <h2 className="text-xl font-semibold text-[color:var(--text-primary)] mb-4">
                9. Sécurité
              </h2>
              <div className="text-[color:var(--text-muted)] leading-relaxed space-y-3">
                <p>Verebona met en œuvre des mesures adaptées :</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Chiffrement des communications (HTTPS)</li>
                  <li>Protection des accès (authentification)</li>
                  <li>Contrôle des droits utilisateurs</li>
                  <li>Stockage sécurisé des données</li>
                  <li>Journalisation des accès</li>
                </ul>
                <p>Malgré ces mesures, aucun système n'est totalement invulnérable.</p>
              </div>
            </section>

            {/* 10. Partage des données (fonction Duo) */}
            <section>
              <h2 className="text-xl font-semibold text-[color:var(--text-primary)] mb-4">
                10. Partage des données (fonction Duo)
              </h2>
              <div className="text-[color:var(--text-muted)] leading-relaxed space-y-3">
                <p>
                  Certaines fonctionnalités permettent le partage de données entre utilisateurs d'un même compte. Dans ce cas :
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Les données sont visibles par les membres du compte</li>
                  <li>Chaque utilisateur est responsable de l'usage des données partagées</li>
                </ul>
              </div>
            </section>

            {/* 11. Droits des utilisateurs */}
            <section>
              <h2 className="text-xl font-semibold text-[color:var(--text-primary)] mb-4">
                11. Droits des utilisateurs
              </h2>
              <div className="text-[color:var(--text-muted)] leading-relaxed space-y-3">
                <p>L'Utilisateur dispose des droits suivants :</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Accès</li>
                  <li>Rectification</li>
                  <li>Suppression</li>
                  <li>Limitation</li>
                  <li>Opposition</li>
                  <li>Portabilité</li>
                  <li>Retrait du consentement</li>
                </ul>
                <p>
                  Contact :{" "}
                  <a href="mailto:dpo@verebona.com" className="text-[color:var(--accent)] hover:underline">
                    dpo@verebona.com
                  </a>
                </p>
                <p>Réclamation possible auprès de la CNIL.</p>
              </div>
            </section>

            {/* 12. Cookies */}
            <section>
              <h2 className="text-xl font-semibold text-[color:var(--text-primary)] mb-4">
                12. Cookies
              </h2>
              <div className="text-[color:var(--text-muted)] leading-relaxed space-y-3">
                <p>Le Site utilise des cookies. Une politique spécifique ou un bandeau permet :</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>D'accepter / refuser</li>
                  <li>De paramétrer</li>
                </ul>
              </div>
            </section>

            {/* 13. Évolution */}
            <section>
              <h2 className="text-xl font-semibold text-[color:var(--text-primary)] mb-4">
                13. Évolution
              </h2>
              <div className="text-[color:var(--text-muted)] leading-relaxed space-y-3">
                <p>La présente politique peut être modifiée à tout moment. En cas de modification majeure, l'Utilisateur sera notifié.</p>
              </div>
            </section>

            {/* 14. Clause de responsabilité sur les contenus */}
            <section>
              <h2 className="text-xl font-semibold text-[color:var(--text-primary)] mb-4">
                14. Clause de responsabilité sur les contenus
              </h2>
              <div className="text-[color:var(--text-muted)] leading-relaxed space-y-3">
                <p>Verebona n'est pas responsable :</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Des données déposées par les utilisateurs</li>
                  <li>De leur exactitude</li>
                  <li>De leur conformité légale</li>
                </ul>
                <p>L'Utilisateur reste seul responsable.</p>
              </div>
            </section>

            {/* 15. Contact */}
            <section>
              <h2 className="text-xl font-semibold text-[color:var(--text-primary)] mb-4">
                15. Contact
              </h2>
              <div className="text-[color:var(--text-muted)] leading-relaxed space-y-2">
                <p>
                  Email :{" "}
                  <a href="mailto:dpo@verebona.com" className="text-[color:var(--accent)] hover:underline">
                    dpo@verebona.com
                  </a>
                </p>
                <p>Adresse : [à compléter]</p>
              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}
