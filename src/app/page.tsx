import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Lock, Users, CalendarDays, FileCheck, Zap, Crown, Package, Link2, AlertCircle } from 'lucide-react';
import { LandingFooter } from '@/components/LandingFooter';
import { Header } from '@/components/Header';
import { MobileMockupCarousel, DesktopMockupCarousel } from '@/components/landing/AppCarousel';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PricingSection } from '@/components/landing/PricingSection';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Centralisez, organisez, valorisez",
  description: "Verebona organise vos documents, informations et échéances pour les retrouver facilement, anticiper les dates importantes et valoriser vos biens le moment venu.",
  openGraph: {
    title: "Verebona — Centralisez, organisez, valorisez",
    description: "Centralisez vos biens, documents et échéances. Retrouvez, anticipez, valorisez.",
    url: 'https://verebona.app',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Verebona' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Verebona — Centralisez, organisez, valorisez",
    description: "Centralisez vos biens, documents et échéances. Retrouvez, anticipez, valorisez.",
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://verebona.app',
  },
};

const jsonLdOrganization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Verebona',
  url: 'https://verebona.app',
  logo: 'https://verebona.app/images/logo.png',
  description: 'Centralisez vos biens, documents et échéances. Retrouvez, anticipez, valorisez.',
};

const jsonLdSoftware = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Verebona',
  description: "Verebona organise vos documents, informations et échéances pour les retrouver facilement, anticiper les dates importantes et valoriser vos biens le moment venu.",
  applicationCategory: 'ProductivityApplication',
  operatingSystem: 'Web, iOS, Android',
  offers: [
    { '@type': 'Offer', name: 'Standard', price: '19', priceCurrency: 'EUR' },
    { '@type': 'Offer', name: 'Premium', price: '59', priceCurrency: 'EUR' },
    { '@type': 'Offer', name: 'Premium Duo', price: '79', priceCurrency: 'EUR' },
  ],
};

const jsonLdFaq = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Verebona gère-t-il uniquement les logements ?',
      acceptedAnswer: { '@type': 'Answer', text: 'Non. Verebona centralise tous vos biens : logements, véhicules, matériel pro, outillage, loisirs... Chaque bien sert de point d\'ancrage pour organiser les documents, informations et événements associés.' },
    },
    {
      '@type': 'Question',
      name: 'Quelle est la différence entre les offres ?',
      acceptedAnswer: { '@type': 'Answer', text: 'Standard inclut 2 biens actifs, l\'analyse IA des documents et l\'agenda. Premium augmente les quotas et débloque les fonctions avancées. Premium Duo ajoute un deuxième utilisateur sur un quota commun.' },
    },
    {
      '@type': 'Question',
      name: 'Les documents générés par Verebona ont-ils une valeur juridique ?',
      acceptedAnswer: { '@type': 'Answer', text: 'Non. Verebona est une plateforme de centralisation et d\'organisation documentaire. Les documents importés ne sont ni certifiés, ni validés, ni garantis juridiquement par Verebona.' },
    },
    {
      '@type': 'Question',
      name: 'Mes données sont-elles sécurisées ?',
      acceptedAnswer: { '@type': 'Answer', text: 'Oui. Vos données sont hébergées sur une infrastructure sécurisée et protégées par des mécanismes de chiffrement lors du stockage et des échanges. L\'accès aux données est strictement contrôlé.' },
    },
    {
      '@type': 'Question',
      name: 'Dois-je m\'abonner dès le début ?',
      acceptedAnswer: { '@type': 'Answer', text: 'Oui. Vous choisissez votre offre dès l\'inscription, avec 2 mois offerts (3 mois en cas de parrainage) — aucun paiement aujourd\'hui, carte bancaire requise.' },
    },
    {
      '@type': 'Question',
      name: 'Puis-je récupérer mes données si je mets fin à mon abonnement ?',
      acceptedAnswer: { '@type': 'Answer', text: 'Oui. L\'arrêt de l\'abonnement ne doit pas vous priver de vos informations. Verebona prévoit des modalités de récupération de vos données pour éviter tout verrouillage.' },
    },
  ],
};

export default function LandingPage() {
  return (
    <div className="public-page min-h-screen flex flex-col bg-gradient-to-b from-[#111827] via-[#020617] to-[#000] overflow-x-hidden pt-[72px] md:pt-0 relative isolate">
      {/* Fixed ambient glow effects — stay visible while scrolling */}
      <div className="fixed top-[-15%] left-[-10%] w-[500px] md:w-[800px] h-[500px] md:h-[800px] bg-[#3b82f6]/15 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed top-[-10%] right-[-10%] w-[350px] md:w-[600px] h-[350px] md:h-[600px] bg-[#22c55e]/10 rounded-full blur-[100px] pointer-events-none -z-10" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSoftware) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }} />
      <Header />

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-12 md:py-20">
          <div className="container mx-auto px-4 md:px-6 max-w-5xl">
            {/* Hero text — full width, centered */}
            <div className="flex flex-col items-center text-center mb-10">

              <p className="text-lg md:text-xl text-[color:var(--text-primary)] font-medium mb-4 tracking-wide">
                One place. Higher value.
              </p>

              <h1 className="text-3xl md:text-5xl lg:text-6xl font-semibold text-[color:var(--text-primary)] mb-5 leading-tight max-w-3xl">
                Centralisez,{' '}
                <span className="bg-gradient-to-r from-[#3b82f6] to-[#22c55e] bg-clip-text text-transparent">
                  organisez, valorisez.
                </span>
              </h1>

              <p className="text-base md:text-lg text-[color:var(--text-muted)] mb-8 max-w-2xl leading-relaxed">
                Verebona organise vos documents, informations et échéances pour les retrouver facilement, anticiper les dates importantes et valoriser vos biens le moment venu.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch gap-4 mb-6 w-full max-w-2xl">
                {/* Biens */}
                <div className="flex-1 flex flex-col items-center gap-3 px-5 py-5 rounded-2xl border border-[rgba(31,41,55,0.9)] bg-[rgba(15,23,42,0.85)]">
                  <div className="w-[110px] h-[110px] flex items-center justify-center">
                    <Image src="/images/triptych-biens-v2.png" alt="Biens : logements, véhicules, objets" width={110} height={110} className="object-contain rounded-xl" />
                  </div>
                  <span className="text-sm font-semibold text-[color:var(--text-primary)] tracking-wide">Biens</span>
                  <span className="text-xs text-[color:var(--text-muted)] text-center leading-relaxed">Logements, véhicules, objets</span>
                </div>
                {/* Documents */}
                <div className="flex-1 flex flex-col items-center gap-3 px-5 py-5 rounded-2xl border border-[rgba(31,41,55,0.9)] bg-[rgba(15,23,42,0.85)]">
                  <div className="w-[110px] h-[110px] flex items-center justify-center">
                    <Image src="/images/triptych-documents.png" alt="Documents : factures, garanties, contrats" width={110} height={110} className="object-contain rounded-xl" />
                  </div>
                  <span className="text-sm font-semibold text-[color:var(--text-primary)] tracking-wide">Documents</span>
                  <span className="text-xs text-[color:var(--text-muted)] text-center leading-relaxed">Factures, garanties, contrats...</span>
                </div>
                {/* Agendas */}
                <div className="flex-1 flex flex-col items-center gap-3 px-5 py-5 rounded-2xl border border-[rgba(31,41,55,0.9)] bg-[rgba(15,23,42,0.85)]">
                  <div className="w-[110px] h-[110px] flex items-center justify-center">
                    <Image src="/images/triptych-agendas.png" alt="Agendas : échéances, entretiens, rappels" width={110} height={110} className="object-contain rounded-xl" />
                  </div>
                  <span className="text-sm font-semibold text-[color:var(--text-primary)] tracking-wide">Agendas</span>
                  <span className="text-xs text-[color:var(--text-muted)] text-center leading-relaxed">Échéances, entretiens, rappels...</span>
                </div>
              </div>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5 mb-8 w-full text-left">
                <li className="flex items-start gap-2.5 text-sm text-[color:var(--text-primary)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] mt-1.5 flex-shrink-0"></span>
                  <span className="flex flex-col gap-0.5">
                    <strong>Retrouvez vite ce qui compte</strong>
                    <span className="text-[color:var(--text-muted)]">Documents, contrats, garanties, diagnostics et justificatifs restent accessibles au bon endroit.</span>
                  </span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-[color:var(--text-primary)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] mt-1.5 flex-shrink-0"></span>
                  <span className="flex flex-col gap-0.5">
                    <strong>Anticipez les dates importantes</strong>
                    <span className="text-[color:var(--text-muted)]">Assurances, contrôles, garanties, entretiens et renouvellements remontent au moment utile.</span>
                  </span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-[color:var(--text-primary)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] mt-1.5 flex-shrink-0"></span>
                  <span className="flex flex-col gap-0.5">
                    <strong>Suivez l'histoire de vos biens</strong>
                    <span className="text-[color:var(--text-muted)]">Achats, travaux, entretiens, diagnostics et documents clés construisent un historique clair dans le temps.</span>
                  </span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-[color:var(--text-primary)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] mt-1.5 flex-shrink-0"></span>
                  <span className="flex flex-col gap-0.5">
                    <strong>Valorisez-les le moment venu</strong>
                    <span className="text-[color:var(--text-muted)]">Vente, location, assurance ou transmission : présentez des biens mieux documentés, avec les bons éléments sous la main.</span>
                  </span>
                </li>
              </ul>

              <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 mb-4">
                <Link href="/signup">
                  <Button className="rounded-full bg-gradient-to-br from-[#00D4AA] to-[#00A882] hover:shadow-[0_18px_40px_rgba(0,180,140,0.5)] transition-all hover:translate-y-[-1px] w-full text-base md:text-lg font-semibold px-8 py-3 text-white border-0">
                    Commencez par 2 mois offerts
                  </Button>
                </Link>

              </div>

              <p className="text-xs md:text-sm text-[color:var(--text-muted)]">
                <strong className="text-[color:var(--text-primary)] font-medium">2 mois offerts</strong> : aucun paiement aujourd'hui, carte bancaire requise.
              </p>
            </div>

            {/* Mobile carousel */}
            <MobileMockupCarousel />

            {/* Desktop (md+): carousel */}
            <div className="relative">
              <DesktopMockupCarousel />
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-2/3 h-16 bg-[#3b82f6]/20 blur-3xl rounded-full pointer-events-none hidden md:block" />
            </div>
          </div>
        </section>

        {/* Reassurance Banner */}
        <section className="py-10 md:py-14 border-t border-b border-[rgba(31,41,55,0.7)]">
          <div className="container mx-auto px-4 md:px-6 max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Hébergement en France */}
              <div className="reveal flex flex-col items-center text-center p-6 rounded-2xl border border-[rgba(31,41,55,0.9)] bg-[rgba(15,23,42,0.6)] hover:border-[rgba(59,130,246,0.3)] transition-colors">
                <div className="mb-5 flex items-center justify-center" style={{height: 90}}>
                  <Image src="/images/france-hosting.png" alt="Hébergement en France" width={90} height={90} className="object-contain" />
                </div>
                <h3 className="text-base font-semibold text-[color:var(--text-primary)] mb-2">Hébergement en France</h3>
                <p className="text-sm text-[color:var(--text-muted)] leading-relaxed">
                  Vos données sont stockées exclusivement sur des serveurs sécurisés en France, sous la protection des réglementations européennes les plus rigoureuses.
                </p>
              </div>

              {/* Connexion Sécurisée */}
              <div className="reveal reveal-delay-1 flex flex-col items-center text-center p-6 rounded-2xl border border-[rgba(31,41,55,0.9)] bg-[rgba(15,23,42,0.6)] hover:border-[rgba(59,130,246,0.3)] transition-colors">
                <div className="mb-5 flex items-center justify-center" style={{height: 90}}>
                  <Image src="/images/ssl-2fa.png" alt="Connexion Sécurisée SSL 2FA" width={90} height={90} className="object-contain" />
                </div>
                <h3 className="text-base font-semibold text-[color:var(--text-primary)] mb-2">Connexion Sécurisée</h3>
                <p className="text-sm text-[color:var(--text-muted)] leading-relaxed">
                  Verebona utilise une connexion sécurisée pour protéger les échanges avec l'application et une authentification à deux facteurs (2FA) pour une sécurité renforcée.
                </p>
              </div>

              {/* Sauvegarde Protégée */}
              <div className="reveal reveal-delay-2 flex flex-col items-center text-center p-6 rounded-2xl border border-[rgba(31,41,55,0.9)] bg-[rgba(15,23,42,0.6)] hover:border-[rgba(59,130,246,0.3)] transition-colors">
                <div className="mb-5 flex items-center justify-center" style={{height: 90}}>
                  <Image src="/images/cloud-backup.png" alt="Sauvegarde Protégée" width={90} height={90} className="object-contain" />
                </div>
                <h3 className="text-base font-semibold text-[color:var(--text-primary)] mb-2">Sauvegarde Protégée</h3>
                <p className="text-sm text-[color:var(--text-muted)] leading-relaxed">
                  Des sauvegardes automatiques et chiffrées sont effectuées quotidiennement sur des serveurs redondants, garantissant la pérennité de vos informations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section id="problem" className="py-12 md:py-16 bg-[rgba(15,23,42,0.3)]">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            {/* Scrolling subcategory words carousel */}
            <div className="w-full overflow-hidden pb-6">
              <div className="relative flex overflow-hidden mask-fade-x">
                <div className="flex gap-16 animate-scroll-left whitespace-nowrap">
                  {[...Array(3)].map((_, i) => (
                    <span key={i} className="flex gap-16">
                      <span className="text-2xl md:text-3xl font-light text-[color:var(--text-muted)]/40">Voiture</span>
                      <span className="text-2xl md:text-3xl font-light text-[color:var(--text-muted)]/40">Appartement</span>
                      <span className="text-2xl md:text-3xl font-light text-[color:var(--text-muted)]/40">Garage</span>
                      <span className="text-2xl md:text-3xl font-light text-[color:var(--text-muted)]/40">Moto</span>
                      <span className="text-2xl md:text-3xl font-light text-[color:var(--text-muted)]/40">Camion</span>
                      <span className="text-2xl md:text-3xl font-light text-[color:var(--text-muted)]/40">Maison</span>
                      <span className="text-2xl md:text-3xl font-light text-[color:var(--text-muted)]/40">Terrain</span>
                      <span className="text-2xl md:text-3xl font-light text-[color:var(--text-muted)]/40">Vélo</span>
                      <span className="text-2xl md:text-3xl font-light text-[color:var(--text-muted)]/40">Local commercial</span>
                      <span className="text-2xl md:text-3xl font-light text-[color:var(--text-muted)]/40">Loisir / Sport</span>
                      <span className="text-2xl md:text-3xl font-light text-[color:var(--text-muted)]/40">Tech / IT / Électronique</span>
                      <span className="text-2xl md:text-3xl font-light text-[color:var(--text-muted)]/40">Equipement de la maison</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="reveal text-center mb-8">
              <h2 className="text-3xl font-semibold text-[color:var(--text-primary)] mb-4">
                Vos biens méritent mieux qu'un dossier papier et un tableur.
              </h2>
              <p className="text-[color:var(--text-muted)] max-w-2xl mx-auto mb-6 leading-relaxed">
                Avec Verebona, chaque bien a sa fiche, ses documents, ses échéances — tout au même endroit.<br />
                Plus de recherche, plus d'oubli : vous avez toujours la bonne information au bon moment.
              </p>
              <Link href="/pourquoi-verebona">
                <Button className="rounded-full bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] hover:shadow-[0_18px_40px_rgba(37,99,235,0.45)] transition-all hover:translate-y-[-1px]">
                  Découvrir pourquoi Verebona
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <Card className="reveal border border-[rgba(31,41,55,0.95)] bg-[rgba(15,23,42,0.9)] rounded-2xl overflow-hidden hover:border-[rgba(59,130,246,0.5)] transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-radial from-[#3b82f6] to-[rgba(15,23,42,0.8)] flex items-center justify-center text-sm font-bold text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                      01
                    </div>
                    <h3 className="text-lg font-semibold">Le chaos documentaire</h3>
                  </div>
                  <p className="text-sm text-[color:var(--text-muted)] leading-relaxed">
                    Factures, garanties, notices, devis… dispersés entre emails, portails fournisseurs et dossiers papier. 
                    Vous perdez des heures à chercher ce qui devrait être à portée de main.
                  </p>
                </CardContent>
              </Card>

              <Card className="reveal reveal-delay-1 border border-[rgba(31,41,55,0.95)] bg-[rgba(15,23,42,0.88)] rounded-2xl overflow-hidden hover:border-[rgba(59,130,246,0.5)] transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-radial from-[#3b82f6] to-[rgba(15,23,42,0.8)] flex items-center justify-center text-sm font-bold text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                      02
                    </div>
                    <h3 className="text-lg font-semibold">Les échéances oubliées</h3>
                  </div>
                  <p className="text-sm text-[color:var(--text-muted)] leading-relaxed">
                    Assurance, entretien, contrôle technique… Sans vision claire, les alertes arrivent trop tard.
                    Les interventions sont retardées et votre patrimoine se dégrade silencieusement.
                  </p>
                </CardContent>
              </Card>

              <Card className="reveal border border-[rgba(31,41,55,0.95)] bg-[rgba(15,23,42,0.9)] rounded-2xl overflow-hidden hover:border-[rgba(239,68,68,0.5)] transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-radial from-[#ef4444] to-[rgba(15,23,42,0.8)] flex items-center justify-center text-sm font-bold text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                      03
                    </div>
                    <h3 className="text-lg font-semibold">La perte financière</h3>
                  </div>
                  <p className="text-sm text-[color:var(--text-muted)] leading-relaxed">
                    Sans facture ni justificatif, une garantie saute, une assurance indemnise mal, ou un entretien n'est pas reconnu.
                    Chaque document manquant est un coût direct pour vous.
                  </p>
                </CardContent>
              </Card>

              <Card className="reveal reveal-delay-1 border border-[rgba(31,41,55,0.95)] bg-[rgba(15,23,42,0.88)] rounded-2xl overflow-hidden hover:border-[rgba(239,68,68,0.5)] transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-radial from-[#ef4444] to-[rgba(15,23,42,0.8)] flex items-center justify-center text-sm font-bold text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                      04
                    </div>
                    <h3 className="text-lg font-semibold">La décote à la revente</h3>
                  </div>
                  <p className="text-sm text-[color:var(--text-muted)] leading-relaxed">
                    Un bien sans historique d'achat, d'usage ou d'entretien se vend toujours moins cher. 
                    L'absence de preuves dégrade immédiatement la valeur perçue par l'acheteur.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-12 md:py-16">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <div className="reveal mb-8">
              <div className="text-xs uppercase tracking-wider text-[color:var(--text-muted)] mb-2">
                Fonctionnalités
              </div>
              <h2 className="text-3xl font-semibold text-[color:var(--text-primary)] mb-3">
                Ce que Verebona vous permet de faire.
              </h2>
              <p className="text-[color:var(--text-muted)] max-w-2xl">
                Des bénéfices concrets, pour reprendre le contrôle de ce que vous possédez.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="reveal border border-[rgba(31,41,55,0.95)] bg-[rgba(15,23,42,0.9)] rounded-2xl overflow-hidden hover:border-[rgba(59,130,246,0.5)] transition-colors group">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-[0_5px_15px_rgba(59,130,246,0.3)]">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Centralisez vos biens</h3>
                  <p className="text-sm text-[color:var(--text-muted)] leading-relaxed">
                    Regroupez tous vos biens dans un seul espace structuré.
                  </p>
                </CardContent>
              </Card>

              <Card className="reveal reveal-delay-1 border border-[rgba(31,41,55,0.95)] bg-[rgba(15,23,42,0.9)] rounded-2xl overflow-hidden hover:border-[rgba(59,130,246,0.5)] transition-colors group">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-[0_5px_15px_rgba(59,130,246,0.3)]">
                    <Link2 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Reliez vos documents et informations</h3>
                  <p className="text-sm text-[color:var(--text-muted)] leading-relaxed">
                    Associez chaque document, équipement ou événement à un bien pour garder du contexte.
                  </p>
                </CardContent>
              </Card>

              <Card className="reveal reveal-delay-2 border border-[rgba(31,41,55,0.95)] bg-[rgba(15,23,42,0.9)] rounded-2xl overflow-hidden hover:border-[rgba(59,130,246,0.5)] transition-colors group">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-[0_5px_15px_rgba(59,130,246,0.3)]">
                    <CalendarDays className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">L'agenda de vos biens</h3>
                  <p className="text-sm text-[color:var(--text-muted)] leading-relaxed">
                    Toutes les dates liées à vos biens, réunies dans un agenda unique et automatiquement alimenté.
                  </p>
                </CardContent>
              </Card>

              <Card className="reveal border border-[rgba(31,41,55,0.95)] bg-[rgba(15,23,42,0.9)] rounded-2xl overflow-hidden hover:border-[rgba(245,158,11,0.5)] transition-colors group">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#d97706] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-[0_5px_15px_rgba(245,158,11,0.3)]">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Gardez un espace toujours à jour</h3>
                  <p className="text-sm text-[color:var(--text-muted)] leading-relaxed">
                    Identifiez immédiatement les éléments incomplets et corrigez-les facilement.
                  </p>
                </CardContent>
              </Card>

              <Card className="reveal reveal-delay-1 border border-[rgba(31,41,55,0.95)] bg-[rgba(15,23,42,0.9)] rounded-2xl overflow-hidden hover:border-[rgba(139,92,246,0.5)] transition-colors group">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-[0_5px_15px_rgba(139,92,246,0.3)]">
                    <FileCheck className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Un dossier complet en un clic</h3>
                  <p className="text-sm text-[color:var(--text-muted)] leading-relaxed">
                    Exportez en un clic un dossier structuré — vente, assurance, succession — prêt à partager.
                  </p>
                </CardContent>
              </Card>

              <Card className="reveal reveal-delay-2 border border-[rgba(31,41,55,0.95)] bg-[rgba(15,23,42,0.9)] rounded-2xl overflow-hidden hover:border-[rgba(34,197,94,0.5)] transition-colors group">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#22c55e] to-[#16a34a] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-[0_5px_15px_rgba(34,197,94,0.3)]">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Partagez à deux (Duo)</h3>
                  <p className="text-sm text-[color:var(--text-muted)] leading-relaxed">
                    Collaborez avec une autre personne dans un espace commun, sans perdre en organisation.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How it works Section */}
        <section id="how-it-works" className="py-12 md:py-16 bg-[rgba(15,23,42,0.3)]">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl font-semibold text-[color:var(--text-primary)] mb-4">
                  Votre patrimoine se met en ordre, sans effort.
                </h2>
                <p className="text-[color:var(--text-muted)] mb-8 leading-relaxed">
                  Ajoutez vos documents. Verebona les comprend, les relie à vos biens, complète vos informations et prépare vos prochaines échéances.
                </p>
                <div className="space-y-8">
                  {[
                    {
                      step: "01",
                      title: "Vous déposez",
                      desc: "Ajoutez vos documents comme ils viennent : factures, contrats, diagnostics, garanties, photos."
                    },
                    {
                      step: "02",
                      title: "Verebona organise",
                      desc: "Verebona analyse vos documents, les classe, les rattache aux bons biens et extrait les informations utiles."
                    },
                    {
                      step: "03",
                      title: "Vous gardez l'essentiel sous la main",
                      desc: "Vos échéances, dossiers, documents et informations importantes sont prêts quand vous en avez besoin."
                    }
                  ].map((s, idx) => (
                    <div key={idx} className="flex gap-6 items-start group">
                      <div className="text-4xl font-bold text-white/10 [.theme-beige_&]:text-black/10 [.public-page_&]:text-white/10 group-hover:text-[#3b82f6]/40 transition-colors leading-none">
                        {s.step}
                      </div>
                      <div>
                        <h4 className="text-xl font-semibold mb-2 text-[color:var(--text-primary)]">{s.title}</h4>
                        <p className="text-sm text-[color:var(--text-muted)] leading-relaxed">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#3b82f6]/20 to-transparent rounded-full blur-3xl -z-10" />
                <Image
                  src="/images/app-mockup-hand.png"
                  alt="Application Verebona sur smartphone"
                  width={480}
                  height={480}
                  className="w-full max-w-md object-contain drop-shadow-2xl"
                  sizes="(max-width: 1024px) 80vw, 480px"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <PricingSection />
        <section id="pricing-legacy" style={{display:'none'}}>
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <div className="mb-6">
              <div className="text-xs uppercase tracking-wider text-[color:var(--text-muted)] mb-2">
                Tarifs
              </div>
              <h2 className="text-3xl font-semibold text-[color:var(--text-primary)] mb-3">
                Verebona automatise l'organisation de votre patrimoine.
              </h2>
              <p className="text-[color:var(--text-muted)] max-w-2xl">
                Ajoutez vos documents. Verebona les analyse, les classe, complète vos informations et fait remonter vos échéances importantes. Choisissez l'offre adaptée à vos besoins, seul ou à deux.
              </p>
            </div>

            {/* Bandeau "2 mois offerts" commun à toutes les offres */}
            <div className="flex items-center gap-2 mb-2 px-1">
              <span className="text-sm text-[color:var(--text-muted)]">
                <strong className="text-[color:var(--text-primary)]">2 mois offerts</strong> sur toutes les offres — aucun paiement aujourd'hui, carte bancaire requise.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl">
              {/* Standard */}
              <Card className="border border-[rgba(31,41,55,0.95)] bg-[rgba(15,23,42,0.9)] rounded-2xl flex flex-col h-full">
                <CardContent className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-5 h-5 text-slate-400" />
                    <h3 className="text-lg font-medium">Standard</h3>
                  </div>
                  <p className="text-sm text-[color:var(--text-muted)] mb-3">
                    Pour découvrir Verebona et centraliser vos premiers biens et documents.
                  </p>
                  <div className="text-3xl font-semibold mb-1 h-12 flex items-start">
                    19 €<span className="text-base font-normal text-[color:var(--text-muted)]"> / an</span>
                  </div>
                  <Link href="/signup" className="block mb-3">
                      <Button variant="outline" className="w-full">
                        Choisir Standard
                      </Button>
                  </Link>
                  <ul className="space-y-2 text-sm text-[color:var(--text-muted)]">
                    <li className="flex items-start gap-2">
                      <Check className="w-3 h-3 text-slate-400 mt-1" />
                      <span>Jusqu'à 2 biens actifs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3 h-3 text-slate-400 mt-1" />
                      <span>Analyse automatique de 50 documents par an</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3 h-3 text-slate-400 mt-1" />
                      <span>Recherche intelligente</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3 h-3 text-slate-400 mt-1" />
                      <span>Agenda de mes biens</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3 h-3 text-slate-400 mt-1" />
                      <span>Accès desktop et mobile</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3 h-3 text-slate-400 mt-1" />
                      <span>Export ZIP de mes documents</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Premium */}
              <Card className="border border-[rgba(59,130,246,0.7)] bg-gradient-radial from-[rgba(59,130,246,0.25)] to-[rgba(15,23,42,0.98)] rounded-2xl shadow-[0_18px_40px_rgba(15,23,42,0.6)] relative flex flex-col h-full">
                <div className="absolute top-3 right-3 text-xs px-3 py-1 rounded-full bg-[rgba(15,23,42,0.95)] border border-[rgba(96,165,250,0.9)] text-[#bfdbfe]">
                  Recommandé
                </div>
                <CardContent className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Crown className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-medium">Premium</h3>
                  </div>
                  <p className="text-sm text-[color:var(--text-muted)] mb-3">
                    Pour ceux qui veulent des dossiers impeccables à présenter à un acheteur ou assureur.
                  </p>
                  <div className="text-3xl font-semibold mb-1 h-12 flex items-start">
                    59 €<span className="text-base font-normal text-[color:var(--text-muted)]"> / an</span>
                  </div>
                  <Link href="/signup?plan=premium" className="block mb-3">
                    <Button className="w-full rounded-full bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] hover:shadow-[0_18px_40px_rgba(37,99,235,0.45)] transition-all hover:translate-y-[-1px]">
                      Choisir Premium
                    </Button>
                  </Link>
                  <ul className="space-y-2 text-sm text-[color:var(--text-muted)]">
                      <li className="flex items-start gap-2">
                        <Check className="w-3 h-3 text-[#3b82f6] mt-1" />
                        <span><strong>Tout Standard +</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3 h-3 text-[#3b82f6] mt-1" />
                        <span>10 biens actifs</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3 h-3 text-[#3b82f6] mt-1" />
                        <span>200 documents analysés par an</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3 h-3 text-[#3b82f6] mt-1" />
                        <span>Synchronisation avec votre agenda personnel</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3 h-3 text-[#3b82f6] mt-1" />
                        <span>Exports documentaires prêts à utiliser</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3 h-3 text-[#3b82f6] mt-1" />
                        <span>Support prioritaire</span>
                      </li>
                    </ul>
                </CardContent>
              </Card>

              {/* Duo */}
              <Card className="border border-[rgba(52,211,153,0.4)] bg-gradient-radial from-[rgba(52,211,153,0.12)] to-[rgba(15,23,42,0.98)] rounded-2xl relative flex flex-col h-full">
                <div className="absolute top-3 right-3 text-xs px-3 py-1 rounded-full bg-[rgba(15,23,42,0.95)] border border-[rgba(52,211,153,0.6)] text-[#6ee7b7] flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Nouveau
                </div>
                <CardContent className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-medium">Premium Duo</h3>
                  </div>
                  <p className="text-sm text-[color:var(--text-muted)] mb-3">
                    Partagez un espace Verebona à deux pour gérer ensemble vos biens, documents et échéances.
                  </p>
                  <div className="text-3xl font-semibold mb-1 h-12 flex items-start">
                    79 €<span className="text-base font-normal text-[color:var(--text-muted)]"> / an</span>
                  </div>
                  <Link href="/signup?plan=premium_duo" className="block mb-3">
                    <Button className="w-full rounded-full bg-gradient-to-br from-[#34d399] to-[#059669] border-emerald-500 hover:shadow-[0_18px_40px_rgba(52,211,153,0.35)] transition-all hover:translate-y-[-1px]">
                      Choisir Premium Duo
                    </Button>
                  </Link>
                  <ul className="space-y-2 text-sm text-[color:var(--text-muted)]">
                      <li className="flex items-start gap-2">
                        <Check className="w-3 h-3 text-emerald-400 mt-1" />
                        <span><strong>Tout Premium +</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3 h-3 text-emerald-400 mt-1" />
                        <span>2 membres sur un même compte</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3 h-3 text-emerald-400 mt-1" />
                        <span>Espace commun : biens, documents, échéances</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3 h-3 text-emerald-400 mt-1" />
                        <span>Gestion collaborative</span>
                      </li>
                    </ul>
                </CardContent>
              </Card>

              {/* Pro */}
              <Card className="border border-[rgba(31,41,55,0.6)] bg-[rgba(15,23,42,0.6)] rounded-2xl relative opacity-75 flex flex-col h-full">
                <div className="absolute top-3 right-3 text-xs px-3 py-1 rounded-full bg-[rgba(31,41,55,0.95)] border border-[rgba(107,114,128,0.9)] text-[#9ca3af] flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Bientôt
                </div>
                <CardContent className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Lock className="w-5 h-5 text-slate-500" />
                    <h3 className="text-lg font-medium text-[color:var(--text-muted)]">Premium Pro</h3>
                  </div>
                  <p className="text-sm text-[color:var(--text-muted)] mb-3 h-12">
                    Pour les professionnels qui souhaitent suivre l'entretien et la valorisation de leur matériel.
                  </p>
                  <div className="text-3xl font-semibold mb-1 text-[color:var(--text-muted)] h-12 flex items-start"></div>
                  <Button disabled className="w-full rounded-full bg-[rgba(31,41,55,0.5)] text-[color:var(--text-muted)] cursor-not-allowed mb-3">
                    Bientôt
                  </Button>
                  <ul className="space-y-2 text-sm text-[color:var(--text-muted)]">
                    <li className="flex items-start gap-2">
                      <Check className="w-3 h-3 text-[#3b82f6]/50 mt-1" />
                      <span>Tout Premium inclus</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3 h-3 text-[#3b82f6]/50 mt-1" />
                      <span>Gestion matériel professionnel</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3 h-3 text-[#3b82f6]/50 mt-1" />
                      <span>Plusieurs utilisateurs avec rôles</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3 h-3 text-[#3b82f6]/50 mt-1" />
                      <span>Gestion TTC/HT et TVA</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3 h-3 text-[#3b82f6]/50 mt-1" />
                      <span>Rapports de valorisation avancés</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3 h-3 text-[#3b82f6]/50 mt-1" />
                      <span>API et intégrations avancées</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3 h-3 text-[#3b82f6]/50 mt-1" />
                      <span>Support prioritaire dédié</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-12 md:py-16 bg-[rgba(15,23,42,0.3)]">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl">
            <h2 className="text-4xl font-bold text-center text-[color:var(--text-primary)] mb-10">
              Questions Fréquentes
            </h2>

            <Accordion type="single" collapsible className="space-y-3">
              {[
                {
                  q: "Verebona gère-t-il uniquement les logements ?",
                  a: "Non.\nVerebona centralise tous vos biens : logements, véhicules, matériel pro, outillage, loisirs...\n\nChaque bien sert de point d'ancrage pour organiser les documents, informations et événements associés."
                },
                {
                  q: "Quelle est la différence entre les offres ?",
                  a: "Standard inclut 2 biens actifs et l'analyse IA des documents.\nPremium augmente les quotas (jusqu'à 200 analyses/an) et les fonctionnalités avancées.\nPremium Duo permet de gérer un même espace à deux sur un quota commun (300 analyses/an)."
                },
                {
                  q: "Les documents générés par Verebona ont-ils une valeur juridique ?",
                  a: "Non.\nVerebona est une plateforme de centralisation et d'organisation documentaire.\n\nLes documents importés ne sont ni certifiés, ni validés, ni garantis juridiquement par Verebona.\n\nL'usage des exports PDF dépend exclusivement des règles et exigences des tiers concernés (acheteurs, assureurs, autorités, etc.)."
                },
                {
                  q: "Mes données sont-elles sécurisées ?",
                  a: "Oui.\nVos données sont hébergées sur une infrastructure sécurisée et protégées par des mécanismes de chiffrement lors du stockage et des échanges.\n\nL'accès aux données est strictement contrôlé et vous restez l'unique propriétaire des contenus que vous importez."
                },
                {
                  q: "Dois-je m'abonner dès le début ?",
                  a: "Oui.\nVous choisissez votre offre dès l'inscription, avec 2 mois offerts (3 mois en cas de parrainage) — aucun paiement aujourd'hui, carte bancaire requise."
                },
                {
                  q: "Puis-je récupérer mes données si je mets fin à mon abonnement ?",
                  a: "Oui. L'arrêt de l'abonnement ne doit pas vous priver de vos informations. Verebona prévoit des modalités de récupération de vos données pour éviter tout verrouillage et vous permettre de garder la maîtrise de vos documents."
                }
              ].map((item, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="border border-[rgba(31,41,55,0.9)] rounded-xl px-6 bg-[rgba(15,23,42,0.5)] data-[state=open]:border-[rgba(59,130,246,0.3)]"
                >
                  <AccordionTrigger className="text-base font-medium text-[color:var(--text-primary)] hover:text-[#3b82f6] hover:no-underline py-5 text-left">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-[color:var(--text-muted)] leading-relaxed whitespace-pre-line pb-5">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
