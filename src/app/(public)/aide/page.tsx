'use client';

import { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Fuse from 'fuse.js';
import { Search, X, Sparkles } from 'lucide-react';
import { HELP_ARTICLES, type HelpArticle } from '@/lib/help-content/articles';
import { Header } from '@/components/Header';
import { LandingFooter } from '@/components/LandingFooter';

// ── Synonymes ─────────────────────────────────────────────────────────────────
const SYNONYM_MAP: Record<string, string> = {
  'assurance': 'police contrat',
  'locataire': 'bien',
  'factu': 'facture',
  'docs': 'documents',
  'fichier': 'document',
  'maison': 'bien immobilier',
  'chaudière': 'équipement',
  'vmc': 'équipement',
  'clim': 'équipement climatisation',
};

function normalizeQuery(q: string): string {
  let result = q.toLowerCase();
  for (const [key, val] of Object.entries(SYNONYM_MAP)) {
    result = result.replace(new RegExp(key, 'gi'), val);
  }
  return result;
}

const SIXTY_DAYS = 60 * 24 * 60 * 60 * 1000;

const publishedArticles = HELP_ARTICLES.filter((a) => a.isPublished);

const fuse = new Fuse(publishedArticles, {
  keys: [
    { name: 'title', weight: 0.5 },
    { name: 'summary', weight: 0.3 },
    { name: 'tags.themes', weight: 0.2 },
  ],
  threshold: 0.3,
  includeScore: true,
});

type ThemeFilter = string;
type OfferFilter = 'standard' | 'premium' | 'premium_duo';
type StateFilter = 'new' | 'updated' | 'coming_soon';

// Carte pour la section Nouveautés (grille)
function ArticleCard({ article }: { article: HelpArticle }) {
  return (
    <Link
      href={`/aide/${article.slug}`}
      className="block rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors p-4"
    >
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-sm font-medium">{article.title}</h2>
        <div className="flex gap-1 flex-shrink-0">
          {article.tags.states.includes('new') && (
            <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded px-1.5 py-0.5">Nouveau</span>
          )}
          {article.tags.states.includes('updated') && (
            <span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded px-1.5 py-0.5">Mis à jour</span>
          )}
          {article.tags.states.includes('coming_soon') && (
            <span className="text-xs bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 rounded px-1.5 py-0.5">Bientôt</span>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{article.summary}</p>
      {article.tags.offers.includes('premium') && !article.tags.offers.includes('standard') && (
        <span className="inline-block mt-2 text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded px-1.5 py-0.5">Premium</span>
      )}
      {article.tags.offers.includes('premium_duo') && !article.tags.offers.includes('standard') && !article.tags.offers.includes('premium') && (
        <span className="inline-block mt-2 text-xs bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 rounded px-1.5 py-0.5">Duo</span>
      )}
    </Link>
  );
}

// Ligne de résultat (liste plate)
function ArticleRow({ article }: { article: HelpArticle }) {
  return (
    <Link
      href={`/aide/${article.slug}`}
      className="flex items-center justify-between gap-4 py-3.5 border-b border-border last:border-0 hover:bg-white/[0.03] transition-colors group -mx-2 px-2 rounded"
    >
      <span className="flex items-center gap-2 min-w-0">
        <span className="text-sm text-foreground group-hover:text-primary transition-colors leading-snug">
          {article.title}
        </span>
        {article.tags.states.includes('new') && (
          <span className="shrink-0 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded px-1.5 py-0.5">Nouveau</span>
        )}
        {article.tags.states.includes('updated') && (
          <span className="shrink-0 text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded px-1.5 py-0.5">Mis à jour</span>
        )}
        {article.tags.states.includes('coming_soon') && (
          <span className="shrink-0 text-xs bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 rounded px-1.5 py-0.5">Bientôt</span>
        )}
      </span>
      <svg
        className="w-4 h-4 text-primary shrink-0 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

function AidePageInner() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [selectedThemes, setSelectedThemes] = useState<ThemeFilter[]>([]);
  const [selectedOffers, setSelectedOffers] = useState<OfferFilter[]>([]);
  const [selectedStates, setSelectedStates] = useState<StateFilter[]>([]);

  const allThemes = useMemo(() => {
    const set = new Set<string>();
    publishedArticles.forEach((a) => a.tags.themes.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, []);

  const newArticles = useMemo(() =>
    publishedArticles.filter(
      (a) => a.tags.states.includes('new') && Date.now() - new Date(a.publishedAt).getTime() < SIXTY_DAYS
    ).slice(0, 3),
    []
  );

  const filteredArticles = useMemo(() => {
    let base: HelpArticle[];

    if (query.trim()) {
      const normalized = normalizeQuery(query);
      base = fuse.search(normalized).map((r) => r.item);
    } else {
      base = publishedArticles;
    }

    // AND inter-type, OR intra-type
    if (selectedThemes.length > 0) {
      base = base.filter((a) => selectedThemes.some((t) => a.tags.themes.includes(t)));
    }
    if (selectedOffers.length > 0) {
      base = base.filter((a) => selectedOffers.some((o) => a.tags.offers.includes(o)));
    }
    if (selectedStates.length > 0) {
      base = base.filter((a) => selectedStates.some((s) => a.tags.states.includes(s)));
    }

    return base;
  }, [query, selectedThemes, selectedOffers, selectedStates]);

  function resetFilters() {
    setQuery('');
    setSelectedThemes([]);
    setSelectedOffers([]);
    setSelectedStates([]);
  }

  function toggleFilter<T>(arr: T[], setArr: (v: T[]) => void, val: T) {
    setArr(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  }

  const hasFilters = query || selectedThemes.length > 0 || selectedOffers.length > 0 || selectedStates.length > 0;

  return (
    <div className="public-page min-h-screen flex flex-col bg-gradient-to-b from-[#111827] via-[#020617] to-[#000] pt-[72px] md:pt-0">
      <Header />
      <div className="flex-1">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Centre d'aide</h1>
          <p className="text-muted-foreground mt-1">Trouvez des réponses à vos questions sur Verebona.</p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un article…"
            className="w-full rounded-xl border border-input bg-background pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filters — no categories, tags only */}
        <div className="flex flex-wrap gap-2 mb-6">
          {allThemes.map((theme) => (
            <button
              key={theme}
              onClick={() => toggleFilter(selectedThemes, setSelectedThemes, theme)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                selectedThemes.includes(theme)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border text-muted-foreground hover:border-primary hover:text-foreground'
              }`}
            >
              {theme}
            </button>
          ))}
          {(['premium', 'premium_duo'] as OfferFilter[]).map((offer) => (
            <button
              key={offer}
              onClick={() => toggleFilter(selectedOffers, setSelectedOffers, offer)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                selectedOffers.includes(offer)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border text-muted-foreground hover:border-primary hover:text-foreground'
              }`}
            >
              {offer === 'premium' ? 'Premium' : 'Duo'}
            </button>
          ))}
          {hasFilters && (
            <button
              onClick={resetFilters}
              className="px-3 py-1 rounded-full text-xs font-medium border border-destructive/50 text-destructive hover:bg-destructive/10 transition-colors"
            >
              Réinitialiser
            </button>
          )}
        </div>

        {/* Nouveautés block — only when no active search/filter */}
        {!hasFilters && newArticles.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Nouveautés
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {newArticles.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
            <div className="border-t border-border mt-6 mb-6" />
          </div>
        )}

        {/* All / filtered articles */}
        <div>
          {!hasFilters && (
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
              Tous les articles
            </h2>
          )}
          {hasFilters && query.trim() && (
            <h2 className="text-2xl font-bold mb-6">
              {filteredArticles.length} résultat{filteredArticles.length !== 1 ? 's' : ''} pour votre recherche &ldquo;{query.trim()}&rdquo;
            </h2>
          )}
          {hasFilters && !query.trim() && (
            <p className="text-sm text-muted-foreground mb-3">
              {filteredArticles.length} résultat{filteredArticles.length !== 1 ? 's' : ''}
            </p>
          )}
          {filteredArticles.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">Aucun article trouvé.</p>
              <button onClick={resetFilters} className="mt-2 text-sm text-primary hover:underline">
                Réinitialiser les filtres
              </button>
            </div>
          ) : hasFilters ? (
            /* Résultats de recherche — liste plate */
            <div className="border-t border-border">
              {filteredArticles.map((article) => (
                <ArticleRow key={article.slug} article={article} />
              ))}
            </div>
          ) : (
            /* Vue par défaut — liste plate */
            <div className="border-t border-border">
              {filteredArticles.map((article) => (
                <ArticleRow key={article.slug} article={article} />
              ))}
            </div>
          )}
        </div>
      </div>
      </div>
      <LandingFooter />
    </div>
  );
}

export default function AidePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <AidePageInner />
    </Suspense>
  );
}
