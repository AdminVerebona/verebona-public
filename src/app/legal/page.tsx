import Link from "next/link";
import { ArrowLeft, Scale } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales de la plateforme Verebona.",
  alternates: { canonical: 'https://verebona.app/legal' },
};

export default function LegalPage() {
  return (
    <div className="public-page min-h-screen flex flex-col bg-[color:var(--bg-page)] pt-[72px] md:pt-0">
      {/* Header */}
      <header className="fixed md:sticky top-0 left-0 right-0 z-40 backdrop-blur-xl bg-[rgba(15,23,42,0.75)] border-b border-[rgba(31,41,55,0.4)] pt-[env(safe-area-inset-top)]">
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
              <Scale className="w-8 h-8 text-[color:var(--accent)]" />
            </div>
            <h1 className="text-3xl font-semibold text-[color:var(--text-primary)] mb-3">
              Mentions légales
            </h1>
            <p className="text-sm text-[color:var(--text-muted)]">
              Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
            </p>
          </div>

          {/* Content */}
          <div className="bg-[color:var(--bg-card)] border border-[color:var(--border-subtle)] rounded-lg p-8 space-y-8">
            
            {/* Éditeur du site */}
            <section>
              <h2 className="text-xl font-semibold text-[color:var(--text-primary)] mb-4">
                1. Éditeur du site
              </h2>
              <div className="space-y-2 text-[color:var(--text-muted)]">
                <p><strong className="text-[color:var(--text-primary)]">Raison sociale :</strong> Verebona</p>
                <p><strong className="text-[color:var(--text-primary)]">Siège social :</strong> [Adresse à compléter]</p>
                <p><strong className="text-[color:var(--text-primary)]">SIRET :</strong> [Numéro à compléter]</p>
                <p><strong className="text-[color:var(--text-primary)]">Email :</strong> contact@verebona.com</p>
                <p><strong className="text-[color:var(--text-primary)]">Directeur de la publication :</strong> [Nom à compléter]</p>
              </div>
            </section>

            {/* Hébergement */}
            <section>
              <h2 className="text-xl font-semibold text-[color:var(--text-primary)] mb-4">
                2. Hébergement
              </h2>
              <div className="space-y-2 text-[color:var(--text-muted)]">
                <p><strong className="text-[color:var(--text-primary)]">Hébergeur :</strong> Vercel Inc.</p>
                <p><strong className="text-[color:var(--text-primary)]">Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis</p>
                <p><strong className="text-[color:var(--text-primary)]">Téléphone :</strong> +1 859 373 3247</p>
              </div>
            </section>

            {/* Propriété intellectuelle */}
            <section>
              <h2 className="text-xl font-semibold text-[color:var(--text-primary)] mb-4">
                3. Propriété intellectuelle
              </h2>
              <p className="text-[color:var(--text-muted)] leading-relaxed">
                L'ensemble du contenu de ce site (textes, images, vidéos, etc.) est protégé par le droit d'auteur,
                le droit des marques et/ou tout autre droit de propriété intellectuelle. Ces contenus sont la propriété
                exclusive de Verebona. Toute reproduction, distribution, modification, adaptation, retransmission ou
                publication de ces différents éléments est strictement interdite sans l'accord exprès par écrit de
                Verebona.
              </p>
            </section>

            {/* Données personnelles */}
            <section>
              <h2 className="text-xl font-semibold text-[color:var(--text-primary)] mb-4">
                4. Protection des données personnelles
              </h2>
              <p className="text-[color:var(--text-muted)] leading-relaxed mb-4">
                Verebona s'engage à protéger la vie privée de ses utilisateurs. Les données personnelles collectées
                sur ce site sont traitées conformément au Règlement Général sur la Protection des Données (RGPD).
              </p>
              <div className="space-y-2 text-[color:var(--text-muted)]">
                <p><strong className="text-[color:var(--text-primary)]">Responsable du traitement :</strong> Verebona</p>
                <p><strong className="text-[color:var(--text-primary)]">Finalité :</strong> Gestion de votre compte et de vos biens patrimoniaux</p>
                <p><strong className="text-[color:var(--text-primary)]">Droits :</strong> Vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition concernant vos données personnelles.</p>
                <p><strong className="text-[color:var(--text-primary)]">Contact DPO :</strong> dpo@verebona.com</p>
              </div>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-xl font-semibold text-[color:var(--text-primary)] mb-4">
                5. Cookies
              </h2>
              <p className="text-[color:var(--text-muted)] leading-relaxed">
                Ce site utilise des cookies pour améliorer l'expérience utilisateur et permettre le fonctionnement
                de certaines fonctionnalités (authentification, préférences). Vous pouvez gérer vos préférences de
                cookies dans les paramètres de votre navigateur.
              </p>
            </section>

            {/* Limitation de responsabilité */}
            <section>
              <h2 className="text-xl font-semibold text-[color:var(--text-primary)] mb-4">
                6. Limitation de responsabilité
              </h2>
              <p className="text-[color:var(--text-muted)] leading-relaxed">
                Verebona s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur ce site.
                Toutefois, Verebona ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations
                mises à disposition sur ce site. Verebona ne pourra être tenue responsable des dommages directs ou
                indirects résultant de l'utilisation de ce site.
              </p>
            </section>

            {/* Droit applicable */}
            <section>
              <h2 className="text-xl font-semibold text-[color:var(--text-primary)] mb-4">
                7. Droit applicable
              </h2>
              <p className="text-[color:var(--text-muted)] leading-relaxed">
                Les présentes mentions légales sont régies par le droit français. En cas de litige et à défaut d'accord
                amiable, le litige sera porté devant les tribunaux français conformément aux règles de compétence en
                vigueur.
              </p>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}
