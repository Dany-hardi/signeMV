import React from 'react';
import { Poem, ActivePage } from '../types';
import { PaperReader } from '../components/PaperReader';
import { PoemCard } from '../components/PoemCard';
import { Logo } from '../components/Logo';
import { PoeticOracle } from '../components/PoeticOracle';
import { TypographicRespiration } from '../components/TypographicRespiration';
import { InteractiveEnvelope } from '../components/InteractiveEnvelope';
import { useLanguage } from '../context/LanguageContext';
import { ArrowRight, BookOpen, Feather } from 'lucide-react';

interface HomePageProps {
  poems: Poem[];
  onSelectPoem: (poem: Poem) => void;
  setActivePage: (page: ActivePage) => void;
  onOpenShareModal: (poem: Poem) => void;
  onOpenNewsletter: () => void;
  savedPoemIds?: string[];
  onToggleBookmark?: (e: React.MouseEvent, poem: Poem) => void;
  onBookmarkToggle?: (poemId: string, isSaved: boolean) => void;
  onLikeToggle?: (poemId: string, isLiked: boolean) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  poems,
  onSelectPoem,
  setActivePage,
  onOpenShareModal,
  onOpenNewsletter,
  savedPoemIds = [],
  onToggleBookmark,
  onBookmarkToggle,
  onLikeToggle
}) => {
  const { t } = useLanguage();
  const featuredPoem = poems[0];
  const recentPoems = poems.slice(1, 4);

  return (
    <div className="space-y-16 pb-16 animate-fade-in">
      
      {/* Hero Section */}
      <section className="pt-28 pb-12 px-4 text-center max-w-4xl mx-auto">
        <div className="inline-block mb-6">
          <Logo size="lg" showText={false} />
        </div>

        <span className="block font-sans text-xs tracking-widest uppercase text-accent-terracotta font-semibold mb-3">
          {t.heroSubtitle}
        </span>

        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-medium tracking-tight text-paper-ink dark:text-darkpaper-ink mb-6 leading-tight">
          {t.heroTitle1} <br />
          <span className="italic font-normal text-accent-terracotta">{t.heroTitle2}</span>
        </h1>

        <p className="font-serif text-base sm:text-lg text-paper-muted dark:text-darkpaper-muted max-w-2xl mx-auto leading-relaxed mb-8">
          {t.heroDesc}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-sans">
          <button
            onClick={() => setActivePage('poems')}
            className="px-6 py-3 rounded-full bg-accent-terracotta text-white font-medium hover:bg-accent-terracotta/90 transition-all shadow-md flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>{t.discoverBtn}</span>
          </button>
          
          <button
            onClick={onOpenNewsletter}
            className="px-6 py-3 rounded-full bg-paper-card dark:bg-darkpaper-card border border-paper-border/80 dark:border-darkpaper-border/80 text-paper-ink dark:text-darkpaper-ink font-medium hover:border-accent-terracotta/50 transition-all flex items-center gap-2"
          >
            <Feather className="w-4 h-4 text-accent-terracotta" />
            <span>{t.newsletterTitle}</span>
          </button>
        </div>
      </section>

      {/* Featured Poem (PaperReader) */}
      {featuredPoem && (
        <section className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-6">
            <span className="text-xs uppercase tracking-widest text-accent-terracotta font-semibold">
              Poème à la Une
            </span>
          </div>
          <PaperReader
            poem={featuredPoem}
            onOpenShareModal={onOpenShareModal}
            onOpenNewsletter={onOpenNewsletter}
            onBookmarkToggle={onBookmarkToggle}
            onLikeToggle={onLikeToggle}
            isSavedInApp={savedPoemIds.includes(featuredPoem.id)}
          />
        </section>
      )}

      {/* 3D Oracle Poétique (Tirer une strophe au sort) */}
      <PoeticOracle
        poems={poems}
        onSelectPoem={onSelectPoem}
      />

      {/* Typographic Respiration Banner */}
      <TypographicRespiration />

      {/* Recent Poems Grid */}
      {recentPoems.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-paper-border/60">
            <div>
              <h2 className="font-serif text-2xl font-medium text-paper-ink dark:text-darkpaper-ink">
                Récents écrits
              </h2>
              <p className="text-xs font-serif italic text-paper-muted">
                Les dernières compositions publiées dans le sanctuaire.
              </p>
            </div>

            <button
              onClick={() => setActivePage('poems')}
              className="flex items-center gap-1.5 text-xs font-medium text-accent-terracotta hover:underline"
            >
              <span>Tout explorer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentPoems.map(poem => (
              <PoemCard
                key={poem.id}
                poem={poem}
                onClick={() => onSelectPoem(poem)}
                onOpenShareModal={onOpenShareModal}
                isSaved={savedPoemIds.includes(poem.id)}
                onToggleBookmark={onToggleBookmark}
              />
            ))}
          </div>
        </section>
      )}

      {/* Interactive Wax-Sealed Envelope Newsletter */}
      <InteractiveEnvelope
        onOpenNewsletter={onOpenNewsletter}
      />

    </div>
  );
};
