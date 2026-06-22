import Link from "next/link";
import { LandingFooter } from "@/components/LandingFooter";
import { Button } from "@/components/ui/button";
import { ForceTheme } from "@/components/ForceTheme";
import { Header } from "@/components/Header";
import { ScrollRevealInit } from "@/components/ScrollRevealInit";

export const metadata = {
  title: "Comment ça marche",
  description:
    "Comprenez la logique interne de Verebona : comment vos biens, documents, agenda et espaces s'articulent pour former un système cohérent.",
  alternates: { canonical: 'https://verebona.app/comment-ca-marche' },
};

const STEPS = [
  {
    number: "01",
    title: "Le bien est le point central.",
    body: "Tout part d'un bien — une maison, une voiture, un vélo, un appareil. Chaque bien a sa propre fiche : références, photos, dates clés. C'est autour de lui que le reste s'organise.",
    accent: "#3b82f6",
  },
  {
    number: "02",
    title: "Tout est relié, rien n'est isolé.",
    body: "Documents, équipements, événements — aucun élément ne flotte seul. Ils sont rattachés à un bien. Cela permet de retrouver instantanément, de comprendre le contexte, et d'éviter les informations perdues.",
    accent: "#22c55e",
  },
  {
    number: "03",
    title: "Le système signale ce qui manque.",
    body: "Si une information est incomplète ou non rattachée, elle remonte automatiquement dans \"À traiter\". Ce n'est pas une to-do list globale : c'est une file d'actions ciblées. Vous savez exactement quoi corriger, et pourquoi.",
    accent: "#f59e0b",
  },
  {
    number: "04",
    title: "Les données vivent dans le temps.",
    body: "Les dates associées à vos documents et événements alimentent automatiquement l'agenda. L'agenda n'est pas un outil séparé : c'est une vue unifiée de toutes vos données datées, classées par bien.",
    accent: "#8b5cf6",
  },
  {
    number: "05",
    title: "Un espace unique, partageable si besoin.",
    body: "Tout est regroupé dans un seul compte, structuré et cohérent. Si vous souhaitez gérer des biens à deux, l'offre Duo permet de partager un espace commun sans perdre l'organisation ni la clarté.",
    accent: "#06b6d4",
  },
];

export default function CommentCaMarchePage() {
  return (
    <div className="public-page min-h-screen flex flex-col bg-gradient-to-b from-[#111827] via-[#020617] to-[#000] pt-[72px] md:pt-0">
      <ForceTheme theme="blue" />
      <ScrollRevealInit />
      <Header />

      <main className="flex-1">

        {/* Hero */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs uppercase tracking-wider text-white/50 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#3b82f6] shadow-[0_0_0_4px_rgba(59,130,246,0.2)]" />
              Comment ça marche
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold text-white mb-6 leading-tight">
              Un système simple.<br />
              <span className="bg-gradient-to-r from-[#3b82f6] to-[#22c55e] bg-clip-text text-transparent">
                Pas juste une liste de fonctionnalités.
              </span>
            </h1>
            <p className="text-lg text-white/55 leading-relaxed">
              Verebona n'est pas une application de stockage. C'est un système qui organise vos informations autour de ce que vous possédez — et qui reste cohérent dans le temps.
            </p>
          </div>
        </section>

        {/* Résumé en 3 points */}
        <section className="py-10 border-t border-white/5">
          <div className="container mx-auto px-4 md:px-6 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              {[
                { label: "Vous ajoutez des éléments", sub: "biens, documents, événements" },
                { label: "Le système vous aide à les relier", sub: "analyse, suggestions, rattachement automatique" },
                { label: "Et tout le reste suit", sub: "signale, classe, rappelle" },
              ].map((item, i) => (
                <div key={i} className={`reveal${i > 0 ? ` reveal-delay-${i}` : ''} p-5 rounded-2xl border border-white/8 bg-white/[0.03]`}>
                  <p className="text-base font-semibold text-white mb-1">{item.label}</p>
                  <p className="text-sm text-white/40">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Les 5 principes */}
        <section className="py-12 md:py-16 border-t border-white/5">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl">
            <div className="space-y-0">
              {STEPS.map((step, i) => (
                <div
                  key={i}
                  className="reveal flex gap-6 md:gap-10 py-10 border-b border-white/5 last:border-0"
                >
                  <div
                    className="text-5xl md:text-6xl font-bold leading-none flex-shrink-0 w-14 md:w-20 select-none"
                    style={{ color: step.accent, opacity: 0.25 }}
                  >
                    {step.number}
                  </div>
                  <div className="pt-1">
                    <h2 className="text-xl md:text-2xl font-semibold text-white mb-3 leading-snug">
                      {step.title}
                    </h2>
                    <p className="text-white/55 leading-relaxed text-base">
                      {step.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24 border-t border-white/5">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl text-center">
            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-5">
              Prêt à essayer ?
            </h2>
            <p className="text-white/55 mb-8 leading-relaxed max-w-xl mx-auto">
              Commencez gratuitement avec vos premiers biens. Sans carte bancaire, sans engagement.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="rounded-full bg-gradient-to-br from-[#00D4AA] to-[#00A882] hover:shadow-[0_18px_40px_rgba(0,180,140,0.5)] transition-all hover:translate-y-[-1px] px-8 text-white border-0"
                >
                  Commencer gratuitement
                </Button>
              </Link>
              <Link href="/pourquoi-verebona">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-white/15 text-white/70 hover:text-white hover:bg-white/10 px-8"
                >
                  Voir les cas d'usage
                </Button>
              </Link>
            </div>
          </div>
        </section>

      </main>

      <LandingFooter />
    </div>
  );
}
