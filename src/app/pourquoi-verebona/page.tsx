"use client";

import { LandingFooter } from "@/components/LandingFooter";
import { ForceTheme } from '@/components/ForceTheme';
import { Header } from '@/components/Header';
import { ScrollRevealInit } from "@/components/ScrollRevealInit";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useState } from "react";
import {
  Bike,
  Calculator,
  CheckCircle2,
  Flame,
  FileText,
  ShoppingCart,
  Truck,
  Users,
  Shield,
  Lock,
  FileSpreadsheet,
  FilePieChart,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

type UseCase = {
  id: string;
  icon: React.ElementType;
  badge: string;
  title: string;
  scenario: string;
  without: string[];
  withSteps: string[];
  color: string;
  colorBg: string;
  colorBorder: string;
  isComingSoon?: boolean;
  hasExportProof?: boolean;
};

const useCases: UseCase[] = [
  {
    id: "duo-living",
    icon: Users,
    badge: "Duo",
    title: "Vie à deux & Biens communs",
    scenario: "Vous gérez ensemble un logement, une voiture ou des équipements dans un espace commun partagé.",
    without: [
      "Coordination difficile entre les parties",
      "Aucune vue centralisée des biens partagés",
      "Risque de désaccord sur les dépenses",
    ],
    withSteps: [
      "Gestion centralisée et partage d'informations sécurisé.",
      "Tableau de bord commun pour un suivi clair.",
      "Historique des transactions et accords accessible.",
    ],
    color: "text-green-400",
    colorBg: "bg-green-950/30",
    colorBorder: "border-green-700/40",
    hasExportProof: true,
  },
  {
    id: "home-claim",
    icon: Flame,
    badge: "Sinistre",
    title: "Incendie, dégât des eaux, cambriolage",
    scenario: "Vous devez déclarer un sinistre et prouver ce que vous aviez, où, et à quelle valeur.",
    without: [
      "Reconstitution de mémoire fastidieuse",
      "Factures introuvables au moment critique",
      "Dossier incomplet → indemnisation réduite",
    ],
    withSteps: [
      "Filtre instantané par pièce et par type d'objet.",
      "Export prêt à partager (liste + photos + preuves d'achat).",
      "Envoi en quelques minutes à l'assureur.",
    ],
    color: "text-red-400",
    colorBg: "bg-red-950/30",
    colorBorder: "border-red-700/40",
    hasExportProof: true,
  },
  {
    id: "street-theft",
    icon: Bike,
    badge: "Vol",
    title: "Vélo ou smartphone volé",
    scenario: "Vous déposez plainte puis activez une assurance (habitation ou spécifique).",
    without: [
      "Numéro de série introuvable",
      "Preuve d'achat et date manquantes",
      "Dépôt de plainte ralenti, assurance bloquée",
    ],
    withSteps: [
      "La fiche contient déjà modèle, numéro de série/IMEI, photos, facture.",
      "Génération d'un récapitulatif « plainte / assurance » en un clic.",
      "Ajout des infos du vol (date, lieu, n° de PV) dans l'historique.",
    ],
    color: "text-orange-400",
    colorBg: "bg-orange-950/30",
    colorBorder: "border-orange-700/40",
    hasExportProof: true,
  },
  {
    id: "resale",
    icon: ShoppingCart,
    badge: "Revente",
    title: "Électroménager & high-tech",
    scenario: "Vous revendez (Leboncoin, Back Market…) et voulez inspirer confiance.",
    without: [
      "Annonce réécrite à la main sans données précises",
      "Facture et garantie introuvables",
      "Allers-retours avec les acheteurs, délais rallongés",
    ],
    withSteps: [
      "Filtre par catégorie, état, garantie active.",
      "Fiche synthétique copiable (modèle, date d'achat, preuve, garantie).",
      "Meilleure transparence → moins de questions des acheteurs.",
    ],
    color: "text-green-400",
    colorBg: "bg-green-950/30",
    colorBorder: "border-green-700/40",
  },
  {
    id: "moving",
    icon: Truck,
    badge: "Déménagement",
    title: "Transfert de contrats & inventaire",
    scenario: "Vous changez de logement et devez résilier/transférer des contrats sans oublier de dates.",
    without: [
      "Contrats dispersés, échéances ratées",
      "Inventaire difficile à constituer",
      "Stress, pénalités, pertes de temps",
    ],
    withSteps: [
      "Contrats centralisés avec dates clés (préavis, échéances).",
      "Inventaire par pièce avant/après utile pour l'assurance.",
      "Rappels automatiques pour éviter les oublis.",
    ],
    color: "text-cyan-400",
    colorBg: "bg-cyan-950/30",
    colorBorder: "border-cyan-700/40",
    hasExportProof: true,
  },
  {
    id: "inheritance",
    icon: FileText,
    badge: "Succession",
    title: "Transmission patrimoniale",
    scenario: "Lors d'une succession, il faut établir un inventaire (valeurs + preuves) pour le notaire.",
    without: [
      "Semaines de recherche pour reconstituer l'inventaire",
      "Estimations approximatives, documents introuvables",
      "Tensions possibles entre les parties",
    ],
    withSteps: [
      "Biens importants déjà documentés (valeur, photos, preuves).",
      "Export complet formaté et partageable.",
      "Accès encadré et clair pour les personnes concernées.",
    ],
    color: "text-purple-400",
    colorBg: "bg-purple-950/30",
    colorBorder: "border-purple-700/40",
    hasExportProof: true,
  },
  {
    id: "pro-assets",
    icon: Calculator,
    badge: "Pro",
    title: "Inventaire valorisé (indépendants, artisans)",
    scenario: "Vous devez justifier des achats (outillage, matériel, véhicule) en cas de contrôle.",
    without: [
      "Factures éparpillées, justificatifs illisibles",
      "Aucune vue consolidée du matériel pro",
      "Risque de redressement fiscal",
    ],
    withSteps: [
      "Chaque bien enregistré avec facture, date, valeur.",
      "Tag « usage professionnel » pour filtrer.",
      "Export consolidé prêt à fournir.",
    ],
    color: "text-amber-400",
    colorBg: "bg-amber-950/30",
    colorBorder: "border-amber-700/40",
    isComingSoon: true,
    hasExportProof: true,
  },
];

function UseCasesTabPanel() {
  const [active, setActive] = useState(0);
  const uc = useCases[active];
  const Icon = uc.icon;

  return (
    <div className="flex flex-col lg:flex-row gap-0 rounded-2xl overflow-hidden border border-[color:var(--border-subtle)] bg-[color:var(--bg-card)]">
      {/* Sidebar */}
      <div className="lg:w-48 xl:w-56 flex-shrink-0 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible border-b lg:border-b-0 lg:border-r border-[color:var(--border-subtle)] bg-[color:var(--accent-soft)]">
        {useCases.map((item, idx) => {
          const ItemIcon = item.icon;
          const isActive = idx === active;
          return (
            <button
              key={item.id}
              onClick={() => setActive(idx)}
              className={`flex items-center gap-2.5 px-4 py-3.5 text-left transition-all relative flex-shrink-0 lg:flex-shrink
                ${isActive
                  ? "bg-[color:var(--bg-card)] text-[color:var(--text-primary)]"
                  : "text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] hover:bg-[color:var(--bg-card)]/40"
                }`}
            >
              {isActive && (
                <span className="hidden lg:block absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-blue-500" />
              )}
              {isActive && (
                <span className="lg:hidden absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-blue-500" />
              )}
              <ItemIcon className={`w-4 h-4 flex-shrink-0 ${isActive ? item.color : ""}`} />
              <span className="text-sm font-medium whitespace-nowrap lg:whitespace-normal">
                {item.badge}
              </span>
              {item.isComingSoon && (
                <Badge variant="outline" className="ml-auto hidden lg:flex text-[10px] px-1.5 py-0 border-[color:var(--border-subtle)] text-[color:var(--text-muted)]">
                  Bientôt
                </Badge>
              )}
            </button>
          );
        })}
      </div>

      {/* Content panel */}
      <div className="flex-1 p-6 md:p-8">
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border ${uc.colorBorder} ${uc.colorBg}`}>
            <Icon className={`w-5 h-5 ${uc.color}`} />
          </div>
          <div>
            <div className={`text-xs uppercase tracking-wider font-medium mb-0.5 ${uc.color}`}>{uc.badge}</div>
            <h3 className="text-xl font-semibold text-[color:var(--text-primary)] leading-tight">
              {uc.title}
              {uc.isComingSoon && (
                <Badge variant="outline" className="ml-2 text-[10px] px-1.5 py-0 border-[color:var(--border-subtle)] text-[color:var(--text-muted)] align-middle">
                  <Lock className="w-2.5 h-2.5 mr-1" />Bientôt
                </Badge>
              )}
            </h3>
          </div>
        </div>

        {/* Scenario */}
        <p className="text-sm text-[color:var(--text-muted)] leading-relaxed mb-6 italic">
          {uc.scenario}
        </p>

        {/* Sans / Avec columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sans Verebona */}
          <div className="p-5 rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--accent-soft)]">
            <div className="text-[10px] uppercase tracking-widest text-[color:var(--text-muted)] mb-4 font-semibold">
              Sans Verebona — Complexe & Stressant
            </div>
            <ul className="space-y-3">
              {uc.without.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-[color:var(--text-muted)] leading-relaxed">
                  <X className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-400/70" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Avec Verebona */}
          <div className={`p-5 rounded-xl border ${uc.colorBorder} bg-gradient-to-br from-[#0f2d1f]/60 to-[color:var(--bg-card)] relative overflow-hidden`}>
            <div className="text-[10px] uppercase tracking-widest text-green-400 mb-4 font-semibold flex items-center justify-between">
              <span>Avec Verebona — Simple & Collaboratif</span>
              {uc.hasExportProof && (
                <div className="flex gap-1.5">
                  <FileText className="w-3 h-3 text-green-400/50" />
                  <FileSpreadsheet className="w-3 h-3 text-green-400/50" />
                </div>
              )}
            </div>
            <ul className="space-y-3">
              {uc.withSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-500" />
                  <span className="text-[color:var(--text-primary)] font-medium">{step}</span>
                </li>
              ))}
            </ul>
            {uc.hasExportProof && (
              <div className="absolute -bottom-2 -right-2 opacity-[0.03] rotate-12 text-green-900">
                <FilePieChart size={80} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WhyVerebonaPage() {
  return (
    <div className="public-page min-h-screen flex flex-col bg-[color:var(--bg-page)] pt-[72px] md:pt-0">
      <ForceTheme theme="blue" />
      <ScrollRevealInit />
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <div className="mb-10 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--accent-soft)] text-xs uppercase tracking-wider text-[color:var(--text-muted)] mb-4">
                <span className="w-2 h-2 rounded-full bg-[#22c55e] shadow-[0_0_0_4px_rgba(34,197,94,0.2)]"></span>
                <span>Pourquoi Verebona ?</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-semibold text-[color:var(--text-primary)] mb-4 leading-tight">
                Acheter est simple.<br />
                <span className="bg-gradient-to-r from-[#3b82f6] to-[#22c55e] bg-clip-text text-transparent">
                  Gérer dans le temps l'est beaucoup moins.
                </span>
              </h1>

              <p className="text-lg text-[color:var(--text-muted)] max-w-3xl mx-auto">
                Factures, notices, garanties, contrats, informations clés…<br />
                Avec le temps, les éléments liés à vos biens se dispersent entre emails, dossiers, applications et espaces clients.
              </p>
              <p className="text-lg text-[color:var(--text-muted)] max-w-3xl mx-auto mt-4">
                Verebona vous permet de <strong className="text-[color:var(--text-primary)]">centraliser et organiser</strong> les informations liées à chaque bien,<br />
                et de les suivre dans le temps, simplement.
              </p>

              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <Link href="/signup">
                  <Button className="rounded-full bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] hover:shadow-lg transition-all hover:translate-y-[-1px]">
                    Créez votre compte
                  </Button>
                </Link>
                <a href="#use-cases">
                  <Button
                    variant="ghost"
                    className="rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--accent-soft)] text-[color:var(--text-primary)]"
                  >
                    Voir les cas d'usage
                  </Button>
                </a>
              </div>
            </div>

            {/* Le Problème : 3 points */}
            <div className="mb-4">
              <h2 className="text-2xl font-semibold text-[color:var(--text-primary)] mb-6 text-center">
                Le Problème : La gestion fragmentée
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    title: "Informations dispersées",
                    text: "Factures, notices, garanties, contrats… Stockés à différents endroits, difficiles à retrouver rapidement.",
                  },
                  {
                    title: "Vue d'ensemble incomplète",
                    text: "Sans organisation par bien, il devient difficile de garder une vision claire et cohérente de ce que vous possédez.",
                  },
                  {
                    title: "Suivi dans le temps compliqué",
                    text: "Entre entretiens, renouvellements et échéances, garder le bon rythme sans outil dédié devient vite complexe.",
                  },
                ].map((b) => (
                  <Card
                    key={b.title}
                    className="reveal border border-[color:var(--border-subtle)] bg-[color:var(--bg-card)] rounded-2xl shadow-sm"
                  >
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-[color:var(--text-primary)] mb-2">
                        {b.title}
                      </h3>
                      <p className="text-sm text-[color:var(--text-muted)] leading-relaxed">
                        {b.text}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases — Tabs latéraux */}
        <section id="use-cases" className="py-12 md:py-20 bg-[color:var(--bg-card)]/30">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <div className="mb-8">
              <h2 className="text-3xl font-semibold text-[color:var(--text-primary)] mb-3">
                Des solutions pour chaque situation
              </h2>
              <p className="text-[color:var(--text-muted)] max-w-2xl">
                Découvrez comment un inventaire administré change radicalement la gestion de vos biens dans les moments qui comptent.
              </p>
            </div>

            <UseCasesTabPanel />
          </div>
        </section>

        {/* Confiance & Sécurité */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-semibold text-[color:var(--text-primary)] mb-4">
                Confiance & Sécurité
              </h2>
              <p className="text-[color:var(--text-muted)] max-w-2xl mx-auto">
                Vos données patrimoniales sont précieuses. Nous mettons tout en œuvre pour les protéger et vous garantir une totale souveraineté.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: Shield,
                  title: "Souveraineté des données",
                  text: "Vous restez l'unique propriétaire de vos documents. Si vous supprimez une donnée, elle disparaît définitivement de nos serveurs.",
                },
                {
                  icon: Lock,
                  title: "Sécurité maximale",
                  text: "Hébergement sécurisé en France, chiffrement des échanges et authentification robuste pour protéger votre espace.",
                },
                {
                  icon: Users,
                  title: "Vie privée respectée",
                  text: "Aucune exploitation commerciale de vos données. Verebona vit de ses abonnements, pas de la revente d'informations.",
                },
              ].map((s, idx) => (
                <Card key={idx} className="reveal border border-[color:var(--border-subtle)] bg-[color:var(--bg-card)] rounded-2xl shadow-sm">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-[color:var(--accent-soft)] flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
                      <s.icon className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-[color:var(--text-primary)] mb-2">
                      {s.title}
                    </h3>
                    <p className="text-sm text-[color:var(--text-muted)] leading-relaxed">
                      {s.text}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container mx-auto px-4 md:px-6 max-w-4xl">
            <Card className="border border-blue-500/30 bg-gradient-to-b from-blue-950/40 to-[color:var(--bg-card)] rounded-3xl overflow-hidden text-center shadow-lg">
              <CardContent className="p-10 md:p-16">
                <h2 className="text-3xl md:text-4xl font-semibold text-[color:var(--text-primary)] mb-6">
                  Prêt à reprendre le contrôle ?
                </h2>
                <p className="text-lg text-[color:var(--text-muted)] mb-10 max-w-2xl mx-auto">
                  Rejoignez les utilisateurs qui ont déjà centralisé leur patrimoine sur Verebona.
                </p>
                <Link href="/signup">
                  <Button size="lg" className="rounded-full bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] hover:shadow-lg transition-all hover:translate-y-[-1px] px-8">
                    Créez votre compte
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
