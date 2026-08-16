import React, { useState } from 'react';
import { Poem } from '../types';
import { PoemCard } from '../components/PoemCard';
import { useLanguage } from '../context/LanguageContext';
import { Search } from 'lucide-react';

interface PoemsPageProps {
  poems: Poem[];
  onSelectPoem: (poem: Poem) => void;
  onOpenShareModal: (poem: Poem) => void;
  savedPoemIds?: string[];
  onToggleBookmark?: (e: React.MouseEvent, poem: Poem) => void;
}

export const PoemsPage: React.FC<PoemsPageProps> = ({
  poems,
  onSelectPoem,
  onOpenShareModal,
  savedPoemIds = [],
  onToggleBookmark
}) => {
  const { t } = useLanguage();
  const [selectedTheme, setSelectedTheme] = useState<string>('Tous');
  const [searchQuery, setSearchQuery] = useState('');

  const themes: string[] = ['Tous', 'Introspection', 'Étreintes', 'Mélancolie', 'Saisons', 'Nocturnes'];

  const filteredPoems = poems.filter((poem) => {
    const matchesTheme = selectedTheme === 'Tous' || poem.theme === selectedTheme;
    const matchesSearch = 
      poem.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      poem.contenu.toLowerCase().includes(searchQuery.toLowerCase()) ||
      poem.extrait.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTheme && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-16 animate-fade-in space-y-10">
      
      {/* Header Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-widest text-accent-terracotta font-semibold">
          {t.collectionsTitle}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium text-paper-ink dark:text-darkpaper-ink">
          {t.navPoems}
        </h1>
        <p className="text-sm text-paper-muted dark:text-darkpaper-muted font-serif italic">
          {t.collectionsSubtitle}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-6 max-w-4xl mx-auto">
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-paper-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-paper-card/80 dark:bg-darkpaper-card border border-paper-border/70 dark:border-darkpaper-border/70 text-sm text-paper-ink dark:text-darkpaper-ink focus:outline-none focus:border-accent-terracotta/60 transition-all placeholder:text-paper-muted/60"
          />
        </div>

        {/* Theme Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {themes.map((theme) => (
            <button
              key={theme}
              onClick={() => setSelectedTheme(theme)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
                selectedTheme === theme
                  ? 'bg-accent-terracotta text-white shadow-xs'
                  : 'bg-paper-card/70 dark:bg-darkpaper-card text-paper-muted dark:text-darkpaper-muted hover:text-paper-ink dark:hover:text-darkpaper-ink border border-paper-border/50 dark:border-darkpaper-border/50'
              }`}
            >
              {theme}
            </button>
          ))}
        </div>

      </div>

      {/* Poems Grid */}
      {filteredPoems.length === 0 ? (
        <div className="text-center py-16 font-serif italic text-paper-muted">
          Aucun poème ne correspond à votre recherche.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPoems.map((poem) => (
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
      )}

    </div>
  );
};
