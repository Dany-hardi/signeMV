import React from 'react';
import { Poem, ActivePage } from '../types';
import { PaperReader } from '../components/PaperReader';
import { useLanguage } from '../context/LanguageContext';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

interface PoemDetailPageProps {
  poem: Poem;
  allPoems: Poem[];
  onSelectPoem: (poem: Poem) => void;
  setActivePage: (page: ActivePage) => void;
  onOpenShareModal: (poem: Poem) => void;
  onOpenNewsletter: () => void;
  onBookmarkToggle?: (poemId: string, isSaved: boolean) => void;
  onLikeToggle?: (poemId: string, isLiked: boolean) => void;
  savedPoemIds?: string[];
}

export const PoemDetailPage: React.FC<PoemDetailPageProps> = ({
  poem,
  allPoems,
  onSelectPoem,
  setActivePage,
  onOpenShareModal,
  onOpenNewsletter,
  onBookmarkToggle,
  onLikeToggle,
  savedPoemIds = []
}) => {
  const { t } = useLanguage();
  const currentIndex = allPoems.findIndex(p => p.id === poem.id);
  const prevPoem = currentIndex > 0 ? allPoems[currentIndex - 1] : null;
  const nextPoem = currentIndex < allPoems.length - 1 ? allPoems[currentIndex + 1] : null;

  return (
    <div className="max-w-4xl mx-auto px-4 pt-24 pb-16 animate-fade-in">
      
      {/* Top Back Nav */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => setActivePage('poems')}
          className="flex items-center gap-2 text-xs font-semibold text-paper-muted hover:text-accent-terracotta transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.backToPoems}</span>
        </button>

        <span className="text-xs text-paper-muted font-sans">
          Poème {currentIndex + 1} / {allPoems.length}
        </span>
      </div>

      {/* Main Paper Reader */}
      <PaperReader
        poem={poem}
        onOpenShareModal={onOpenShareModal}
        onOpenNewsletter={onOpenNewsletter}
        onBookmarkToggle={onBookmarkToggle}
        onLikeToggle={onLikeToggle}
        isSavedInApp={savedPoemIds.includes(poem.id)}
      />

      {/* Previous / Next Navigation Bar */}
      <div className="mt-12 pt-8 border-t border-paper-border/60 dark:border-darkpaper-border/60 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {prevPoem ? (
          <button
            onClick={() => onSelectPoem(prevPoem)}
            className="flex flex-col items-start p-4 rounded-xl bg-paper-card/60 dark:bg-darkpaper-card border border-paper-border/50 dark:border-darkpaper-border/50 hover:border-accent-terracotta/40 transition-all text-left group"
          >
            <span className="text-[10px] uppercase tracking-wider text-paper-muted flex items-center gap-1">
              <ChevronLeft className="w-3.5 h-3.5" /> Poème précédent
            </span>
            <span className="font-serif font-medium text-sm text-paper-ink dark:text-darkpaper-ink group-hover:text-accent-terracotta mt-1">
              {prevPoem.titre}
            </span>
          </button>
        ) : <div />}

        {nextPoem ? (
          <button
            onClick={() => onSelectPoem(nextPoem)}
            className="flex flex-col items-end p-4 rounded-xl bg-paper-card/60 dark:bg-darkpaper-card border border-paper-border/50 dark:border-darkpaper-border/50 hover:border-accent-terracotta/40 transition-all text-right group justify-self-end w-full"
          >
            <span className="text-[10px] uppercase tracking-wider text-paper-muted flex items-center gap-1">
              Poème suivant <ChevronRight className="w-3.5 h-3.5" />
            </span>
            <span className="font-serif font-medium text-sm text-paper-ink dark:text-darkpaper-ink group-hover:text-accent-terracotta mt-1">
              {nextPoem.titre}
            </span>
          </button>
        ) : <div />}
      </div>

    </div>
  );
};
