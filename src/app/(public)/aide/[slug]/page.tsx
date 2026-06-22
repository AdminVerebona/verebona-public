import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import { HELP_ARTICLES, type HelpArticle } from '@/lib/help-content/articles';
import { Header } from '@/components/Header';
import { LandingFooter } from '@/components/LandingFooter';

// Redirections d'anciens slugs supprimés (à compléter)
const SLUG_REDIRECTS: Record<string, string | null> = {
  // 'ancien-slug': 'nouveau-slug',   // équivalent direct → 301
  // 'autre-slug': null,              // supprimé sans équivalent → /aide
};

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = HELP_ARTICLES.find((a) => a.slug === slug && a.isPublished);
  if (!article) return {};
  return {
    title: `${article.seoTitle} — Centre d'aide — Verebona`,
    description: article.summary,
  };
}

function getRelatedArticles(article: HelpArticle, max = 5): HelpArticle[] {
  const published = HELP_ARTICLES.filter((a) => a.isPublished && a.slug !== article.slug);

  // Score : nombre de thèmes en commun
  const scored = published.map((a) => ({
    article: a,
    score: a.tags.themes.filter((t) => article.tags.themes.includes(t)).length,
  }));

  // Articles avec au moins 1 thème commun, triés par score desc
  const related = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.article);

  // Compléter avec d'autres articles si pas assez
  if (related.length < max) {
    const others = published.filter((a) => !related.includes(a));
    related.push(...others.slice(0, max - related.length));
  }

  return related.slice(0, max);
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;

  // 1. Redirect pour anciens slugs
  if (slug in SLUG_REDIRECTS) {
    const target = SLUG_REDIRECTS[slug];
    if (target) redirect(`/aide/${target}`); // 301
    else redirect('/aide');
  }

  // 2. Article existant
  const article = HELP_ARTICLES.find((a) => a.slug === slug && a.isPublished);
  if (!article) notFound();

  const relatedArticles = getRelatedArticles(article);

  return (
    <div className="public-page min-h-screen flex flex-col bg-gradient-to-b from-[#111827] via-[#020617] to-[#000] pt-[72px] md:pt-0">
      <Header />
      <div className="flex-1">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Fil d'Ariane */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/aide" className="hover:text-foreground transition-colors">
            Centre d'aide
          </Link>
          <span>/</span>
          <span className="text-foreground">{article.title}</span>
        </nav>

        {/* Header article */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            {article.tags.states.includes('new') && (
              <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded px-2 py-0.5">
                Nouveau
              </span>
            )}
            {article.tags.states.includes('updated') && (
              <span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded px-2 py-0.5">
                Mis à jour
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold">{article.title}</h1>
          {article.updatedAt && (
            <p className="text-xs text-muted-foreground mt-1">
              Mis à jour le{' '}
              {new Date(article.updatedAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          )}
        </div>

        {/* Illustration */}
        {article.illustration && (
          <div className="mb-8 rounded-xl overflow-hidden border border-border">
            <img
              src={article.illustration}
              alt={article.title}
              className="w-full object-cover"
            />
          </div>
        )}

        {/* Intro */}
        {article.intro && (
          <p className="text-base leading-relaxed text-muted-foreground mb-5 border-l-2 border-primary/40 pl-4">
            {article.intro}
          </p>
        )}

        {/* Description */}
        {article.description && (
          <p className="text-sm leading-relaxed mb-8">{article.description}</p>
        )}

        {/* Step-by-step guide */}
        {article.steps && article.steps.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
              Guide pas à pas
            </h2>
            <ol className="space-y-4">
              {article.steps.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold mb-1">{step.title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: step.body.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }}
                    />
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Optional legacy markdown body */}
        {article.body && (
          <div className="prose prose-sm dark:prose-invert max-w-none mt-6">
            {article.body.split('\n').map((line, i) => {
              if (line.startsWith('# ')) return <h1 key={i} className="text-xl font-bold mt-0 mb-4">{line.slice(2)}</h1>;
              if (line.startsWith('## ')) return <h2 key={i} className="text-base font-semibold mt-6 mb-2">{line.slice(3)}</h2>;
              if (line.startsWith('### ')) return <h3 key={i} className="text-sm font-semibold mt-4 mb-1">{line.slice(4)}</h3>;
              if (line.trim() === '') return <br key={i} />;
              return <p key={i} className="text-sm leading-relaxed mb-2">{line}</p>;
            })}
          </div>
        )}

        {/* Articles en relation */}
        {relatedArticles.length > 0 && (
          <div className="mt-10">
            <div className="rounded-xl border border-border bg-card px-5 py-4">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Articles en relation
              </h2>
              <div className="border-t border-border">
                {relatedArticles.map((rel) => (
                  <Link
                    key={rel.slug}
                    href={`/aide/${rel.slug}`}
                    className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-0 hover:bg-white/[0.03] transition-colors group -mx-3 px-3 rounded"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="text-sm text-foreground group-hover:text-primary transition-colors leading-snug">
                        {rel.title}
                      </span>
                      {rel.tags.states.includes('new') && (
                        <span className="shrink-0 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded px-1.5 py-0.5">Nouveau</span>
                      )}
                      {rel.tags.states.includes('updated') && (
                        <span className="shrink-0 text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded px-1.5 py-0.5">Mis à jour</span>
                      )}
                    </span>
                    <svg
                      className="w-4 h-4 text-primary shrink-0 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-border">
          <Link
            href="/aide"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au centre d'aide
          </Link>
        </div>
      </div>
      </div>
      <LandingFooter />
    </div>
  );
}
